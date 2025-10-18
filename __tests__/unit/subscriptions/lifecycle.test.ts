import {
  mockStripeInstance,
  resetMockStripeData,
  addMockSubscription,
  createMockWebhookEvent,
} from '../../mocks/stripe'
import {
  mockSubscription,
  mockCanceledSubscription,
  mockPastDueSubscription,
} from '../../utils/test-utils'

describe('Subscription Lifecycle', () => {
  beforeEach(() => {
    resetMockStripeData()
  })

  describe('Active Subscription', () => {
    it('should retrieve an active subscription', async () => {
      const subscription = await mockStripeInstance.subscriptions.retrieve('sub_123')

      expect(subscription.status).toBe('active')
      expect(subscription.id).toBe('sub_123')
      expect(subscription.cancel_at_period_end).toBe(false)
    })

    it('should have valid subscription details', async () => {
      const subscription = await mockStripeInstance.subscriptions.retrieve('sub_123')

      expect(subscription).toHaveProperty('current_period_end')
      expect(subscription).toHaveProperty('plan')
      expect(subscription.plan.amount).toBe(2999)
      expect(subscription.plan.currency).toBe('usd')
      expect(subscription.plan.interval).toBe('month')
    })

    it('should list customer subscriptions', async () => {
      addMockSubscription('sub_test', {
        ...mockSubscription,
        id: 'sub_test',
        customer: 'cus_123',
      })

      const subscriptions = await mockStripeInstance.subscriptions.list({
        customer: 'cus_123',
      })

      expect(subscriptions.data).toBeInstanceOf(Array)
      expect(subscriptions.data.length).toBeGreaterThan(0)
    })
  })

  describe('Subscription Cancellation', () => {
    it('should cancel a subscription', async () => {
      const canceledSub = await mockStripeInstance.subscriptions.cancel('sub_123')

      expect(canceledSub.status).toBe('canceled')
      expect(canceledSub).toHaveProperty('canceled_at')
    })

    it('should cancel subscription at period end', async () => {
      const updatedSub = await mockStripeInstance.subscriptions.update('sub_123', {
        cancel_at_period_end: true,
        status: 'active', // Explicitly keep active status
      })

      expect(updatedSub.cancel_at_period_end).toBe(true)
      expect(updatedSub.status).toBe('active') // Still active until period ends
    })

    it('should retrieve canceled subscription', async () => {
      const subscription = await mockStripeInstance.subscriptions.retrieve(
        'sub_canceled'
      )

      expect(subscription.status).toBe('canceled')
      expect(subscription.cancel_at_period_end).toBe(true)
    })

    it('should fail to cancel non-existent subscription', async () => {
      await expect(
        mockStripeInstance.subscriptions.cancel('sub_nonexistent')
      ).rejects.toThrow('Subscription not found')
    })
  })

  describe('Failed Payment & Past Due', () => {
    it('should retrieve past due subscription', async () => {
      const subscription = await mockStripeInstance.subscriptions.retrieve(
        'sub_past_due'
      )

      expect(subscription.status).toBe('past_due')
    })

    it('should update subscription status to past_due', async () => {
      const updatedSub = await mockStripeInstance.subscriptions.update('sub_123', {
        status: 'past_due',
      })

      expect(updatedSub.status).toBe('past_due')
    })

    it('should handle failed renewal webhook', () => {
      const event = createMockWebhookEvent('invoice.payment_failed', {
        subscription: 'sub_123',
        attempt_count: 1,
      })

      expect(event.type).toBe('invoice.payment_failed')
      expect(event.data.object.subscription).toBe('sub_123')
    })
  })

  describe('Subscription Updates', () => {
    it('should update subscription plan', async () => {
      const updatedSub = await mockStripeInstance.subscriptions.update('sub_123', {
        plan: {
          id: 'price_enterprise',
          product: 'prod_enterprise',
          amount: 9999,
          currency: 'usd',
          interval: 'month',
        },
      })

      expect(updatedSub.plan.id).toBe('price_enterprise')
      expect(updatedSub.plan.amount).toBe(9999)
    })

    it('should update subscription metadata', async () => {
      const updatedSub = await mockStripeInstance.subscriptions.update('sub_123', {
        metadata: {
          feature_flag: 'advanced_analytics',
        },
      })

      expect(updatedSub.metadata.feature_flag).toBe('advanced_analytics')
    })
  })

  describe('Webhook Events', () => {
    it('should create subscription created event', () => {
      const event = createMockWebhookEvent('customer.subscription.created', {
        id: 'sub_new',
        status: 'active',
        customer: 'cus_123',
      })

      expect(event.type).toBe('customer.subscription.created')
      expect(event.data.object.id).toBe('sub_new')
      expect(event.data.object.status).toBe('active')
    })

    it('should create subscription updated event', () => {
      const event = createMockWebhookEvent('customer.subscription.updated', {
        id: 'sub_123',
        status: 'active',
        cancel_at_period_end: true,
      })

      expect(event.type).toBe('customer.subscription.updated')
      expect(event.data.object.cancel_at_period_end).toBe(true)
    })

    it('should create subscription deleted event', () => {
      const event = createMockWebhookEvent('customer.subscription.deleted', {
        id: 'sub_123',
        status: 'canceled',
      })

      expect(event.type).toBe('customer.subscription.deleted')
      expect(event.data.object.status).toBe('canceled')
    })

    it('should create payment succeeded event', () => {
      const event = createMockWebhookEvent('invoice.payment_succeeded', {
        subscription: 'sub_123',
        amount_paid: 2999,
        status: 'paid',
      })

      expect(event.type).toBe('invoice.payment_succeeded')
      expect(event.data.object.amount_paid).toBe(2999)
    })

    it('should create payment failed event', () => {
      const event = createMockWebhookEvent('invoice.payment_failed', {
        subscription: 'sub_123',
        attempt_count: 2,
      })

      expect(event.type).toBe('invoice.payment_failed')
      expect(event.data.object.attempt_count).toBe(2)
    })
  })

  describe('Subscription Renewal', () => {
    it('should handle successful renewal', () => {
      const event = createMockWebhookEvent('invoice.payment_succeeded', {
        subscription: 'sub_123',
        billing_reason: 'subscription_cycle',
        amount_paid: 2999,
      })

      expect(event.data.object.billing_reason).toBe('subscription_cycle')
      expect(event.data.object.amount_paid).toBe(2999)
    })

    it('should handle failed renewal attempt', () => {
      const event = createMockWebhookEvent('invoice.payment_failed', {
        subscription: 'sub_123',
        billing_reason: 'subscription_cycle',
        attempt_count: 1,
        next_payment_attempt: Date.now() + 86400000, // 24 hours later
      })

      expect(event.data.object.billing_reason).toBe('subscription_cycle')
      expect(event.data.object.attempt_count).toBe(1)
      expect(event.data.object).toHaveProperty('next_payment_attempt')
    })
  })
})
