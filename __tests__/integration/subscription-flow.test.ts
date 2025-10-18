import { mockStripeInstance, createMockWebhookEvent, addMockSubscription } from '../mocks/stripe'
import { mockFirestore, addMockData, getMockData } from '../mocks/firebase'
import { mockUser, mockSubscription } from '../utils/test-utils'

describe('Subscription Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Subscription Purchase Flow', () => {
    it('should complete full subscription purchase', async () => {
      // Step 1: Create Stripe customer
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
        metadata: { firebaseUID: mockUser.uid },
      })

      expect(customer.email).toBe(mockUser.email)

      // Step 2: Create checkout session
      const session = await mockStripeInstance.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        line_items: [{ price: 'price_premium', quantity: 1 }],
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
        metadata: { userId: mockUser.uid },
      })

      expect(session.customer).toBe(customer.id)
      expect(session.mode).toBe('subscription')

      // Step 3: Simulate webhook - subscription created
      const webhookEvent = createMockWebhookEvent('customer.subscription.created', {
        id: 'sub_new',
        customer: customer.id,
        status: 'active',
        items: {
          data: [{
            price: {
              id: 'price_premium',
              product: 'prod_premium',
            },
          }],
        },
      })

      expect(webhookEvent.type).toBe('customer.subscription.created')

      // Step 4: Update Firestore with subscription data
      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({
        stripeCustomerId: customer.id,
        subscriptionId: 'sub_new',
        subscriptionStatus: 'active',
        plan: 'premium',
      })

      const snapshot = await userDoc.get()
      const userData = snapshot.data()

      expect(userData.stripeCustomerId).toBe(customer.id)
      expect(userData.subscriptionStatus).toBe('active')
      expect(userData.plan).toBe('premium')
    })
  })

  describe('Subscription Cancellation Flow', () => {
    it('should complete subscription cancellation', async () => {
      // Setup: User has active subscription
      addMockSubscription('sub_active', {
        ...mockSubscription,
        id: 'sub_active',
        customer: 'cus_123',
        status: 'active',
      })

      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionId: 'sub_active',
        subscriptionStatus: 'active',
      })

      // Step 1: Cancel subscription at period end
      const updatedSub = await mockStripeInstance.subscriptions.update('sub_active', {
        cancel_at_period_end: true,
      })

      expect(updatedSub.cancel_at_period_end).toBe(true)

      // Step 2: Webhook - subscription updated
      const webhookEvent = createMockWebhookEvent('customer.subscription.updated', {
        id: 'sub_active',
        cancel_at_period_end: true,
        status: 'active',
      })

      expect(webhookEvent.data.object.cancel_at_period_end).toBe(true)

      // Step 3: Update Firestore
      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({
        cancelAtPeriodEnd: true,
      })

      const snapshot = await userDoc.get()
      expect(snapshot.data().cancelAtPeriodEnd).toBe(true)
    })

    it('should handle immediate cancellation', async () => {
      addMockSubscription('sub_active', {
        ...mockSubscription,
        id: 'sub_active',
      })

      // Cancel immediately
      const canceledSub = await mockStripeInstance.subscriptions.cancel('sub_active')

      expect(canceledSub.status).toBe('canceled')

      // Webhook - subscription deleted
      const webhookEvent = createMockWebhookEvent('customer.subscription.deleted', {
        id: 'sub_active',
        status: 'canceled',
      })

      // Update Firestore
      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({
        subscriptionStatus: 'canceled',
        subscriptionId: null,
      })

      const snapshot = await userDoc.get()
      expect(snapshot.data().subscriptionStatus).toBe('canceled')
    })
  })

  describe('Failed Payment Flow', () => {
    it('should handle failed payment renewal', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionId: 'sub_123',
        subscriptionStatus: 'active',
      })

      // Webhook - payment failed
      const webhookEvent = createMockWebhookEvent('invoice.payment_failed', {
        subscription: 'sub_123',
        attempt_count: 1,
        next_payment_attempt: Date.now() + 86400000,
      })

      expect(webhookEvent.type).toBe('invoice.payment_failed')

      // Update subscription status
      const updatedSub = await mockStripeInstance.subscriptions.update('sub_123', {
        status: 'past_due',
      })

      expect(updatedSub.status).toBe('past_due')

      // Update Firestore
      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({
        subscriptionStatus: 'past_due',
        paymentFailed: true,
      })

      const snapshot = await userDoc.get()
      expect(snapshot.data().subscriptionStatus).toBe('past_due')
      expect(snapshot.data().paymentFailed).toBe(true)
    })

    it('should handle multiple failed payment attempts', async () => {
      const attempts = [1, 2, 3]

      for (const attempt of attempts) {
        const webhookEvent = createMockWebhookEvent('invoice.payment_failed', {
          subscription: 'sub_123',
          attempt_count: attempt,
        })

        expect(webhookEvent.data.object.attempt_count).toBe(attempt)
      }

      // After max attempts, subscription is canceled
      const webhookEvent = createMockWebhookEvent('customer.subscription.deleted', {
        id: 'sub_123',
        status: 'canceled',
      })

      expect(webhookEvent.type).toBe('customer.subscription.deleted')
    })
  })

  describe('Successful Renewal Flow', () => {
    it('should handle successful subscription renewal', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionId: 'sub_123',
        subscriptionStatus: 'active',
      })

      // Webhook - payment succeeded
      const webhookEvent = createMockWebhookEvent('invoice.payment_succeeded', {
        subscription: 'sub_123',
        billing_reason: 'subscription_cycle',
        amount_paid: 2999,
        period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
      })

      expect(webhookEvent.type).toBe('invoice.payment_succeeded')
      expect(webhookEvent.data.object.billing_reason).toBe('subscription_cycle')

      // Update Firestore with new period end
      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({
        subscriptionStatus: 'active',
        currentPeriodEnd: webhookEvent.data.object.period_end,
      })

      const snapshot = await userDoc.get()
      expect(snapshot.data().subscriptionStatus).toBe('active')
      expect(snapshot.data().currentPeriodEnd).toBeTruthy()
    })
  })

  describe('Plan Upgrade Flow', () => {
    it('should handle subscription plan upgrade', async () => {
      addMockSubscription('sub_123', {
        ...mockSubscription,
        plan: {
          id: 'price_basic',
          amount: 999,
        },
      })

      // Update subscription to premium plan
      const updatedSub = await mockStripeInstance.subscriptions.update('sub_123', {
        plan: {
          id: 'price_premium',
          amount: 2999,
        },
      })

      expect(updatedSub.plan.id).toBe('price_premium')
      expect(updatedSub.plan.amount).toBe(2999)

      // Webhook - subscription updated
      const webhookEvent = createMockWebhookEvent('customer.subscription.updated', {
        id: 'sub_123',
        plan: {
          id: 'price_premium',
          amount: 2999,
        },
      })

      // Update Firestore
      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({
        plan: 'premium',
      })

      const snapshot = await userDoc.get()
      expect(snapshot.data().plan).toBe('premium')
    })
  })

  describe('Billing Portal Flow', () => {
    it('should create billing portal session', async () => {
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
      })

      const portalSession = await mockStripeInstance.billingPortal.sessions.create({
        customer: customer.id,
        return_url: 'http://localhost:3000/dashboard',
      })

      expect(portalSession.customer).toBe(customer.id)
      expect(portalSession.url).toBeTruthy()
      expect(portalSession.return_url).toBe('http://localhost:3000/dashboard')
    })
  })

  describe('Webhook Event Processing', () => {
    it('should process all subscription webhook events', async () => {
      const events = [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ]

      for (const eventType of events) {
        const event = createMockWebhookEvent(eventType, {
          id: 'sub_123',
          customer: 'cus_123',
        })

        expect(event.type).toBe(eventType)
        expect(event.data.object).toBeTruthy()
      }
    })

    it('should verify webhook signature', () => {
      const payload = JSON.stringify({
        type: 'customer.subscription.created',
        data: { object: { id: 'sub_123' } },
      })

      const event = mockStripeInstance.webhooks.constructEvent(
        payload,
        'test_signature',
        'whsec_test'
      )

      expect(event.type).toBe('customer.subscription.created')
    })
  })
})
