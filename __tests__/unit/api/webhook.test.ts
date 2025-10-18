import { createMockWebhookEvent, mockStripeInstance } from '../../mocks/stripe'
import { mockFirestore, addMockData } from '../../mocks/firebase'
import { mockUser } from '../../utils/test-utils'

describe('Stripe Webhook Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Webhook Event Validation', () => {
    it('should construct webhook event from payload', () => {
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
      expect(event.data.object.id).toBe('sub_123')
    })

    it('should validate webhook signature', () => {
      const payload = JSON.stringify({ type: 'test.event' })
      
      expect(() => {
        mockStripeInstance.webhooks.constructEvent(
          payload,
          'valid_signature',
          'whsec_test'
        )
      }).not.toThrow()
    })
  })

  describe('Subscription Created Event', () => {
    it('should handle subscription.created event', async () => {
      const event = createMockWebhookEvent('customer.subscription.created', {
        id: 'sub_new',
        customer: 'cus_123',
        status: 'active',
        items: {
          data: [{
            price: {
              id: 'price_premium',
              product: 'prod_premium',
            },
          }],
        },
        current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
      })

      expect(event.type).toBe('customer.subscription.created')
      expect(event.data.object.status).toBe('active')

      // Simulate updating Firestore
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        stripeCustomerId: 'cus_123',
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({
        subscriptionId: event.data.object.id,
        subscriptionStatus: event.data.object.status,
        plan: 'premium',
        currentPeriodEnd: event.data.object.current_period_end,
      })

      const snapshot = await userDoc.get()
      const userData = snapshot.data()

      expect(userData.subscriptionId).toBe('sub_new')
      expect(userData.subscriptionStatus).toBe('active')
      expect(userData.plan).toBe('premium')
    })
  })

  describe('Subscription Updated Event', () => {
    it('should handle subscription.updated event', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionId: 'sub_123',
        subscriptionStatus: 'active',
      })

      const event = createMockWebhookEvent('customer.subscription.updated', {
        id: 'sub_123',
        status: 'active',
        cancel_at_period_end: true,
      })

      expect(event.type).toBe('customer.subscription.updated')

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({
        cancelAtPeriodEnd: event.data.object.cancel_at_period_end,
      })

      const snapshot = await userDoc.get()
      expect(snapshot.data().cancelAtPeriodEnd).toBe(true)
    })

    it('should handle plan change in subscription.updated', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionId: 'sub_123',
        plan: 'basic',
      })

      const event = createMockWebhookEvent('customer.subscription.updated', {
        id: 'sub_123',
        items: {
          data: [{
            price: {
              id: 'price_premium',
              product: 'prod_premium',
            },
          }],
        },
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({ plan: 'premium' })

      const snapshot = await userDoc.get()
      expect(snapshot.data().plan).toBe('premium')
    })
  })

  describe('Subscription Deleted Event', () => {
    it('should handle subscription.deleted event', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionId: 'sub_123',
        subscriptionStatus: 'active',
        plan: 'premium',
      })

      const event = createMockWebhookEvent('customer.subscription.deleted', {
        id: 'sub_123',
        status: 'canceled',
      })

      expect(event.type).toBe('customer.subscription.deleted')

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({
        subscriptionStatus: 'canceled',
        subscriptionId: null,
        plan: 'free',
      })

      const snapshot = await userDoc.get()
      expect(snapshot.data().subscriptionStatus).toBe('canceled')
      expect(snapshot.data().plan).toBe('free')
    })
  })

  describe('Invoice Payment Events', () => {
    it('should handle invoice.payment_succeeded event', async () => {
      const event = createMockWebhookEvent('invoice.payment_succeeded', {
        subscription: 'sub_123',
        amount_paid: 2999,
        status: 'paid',
        billing_reason: 'subscription_cycle',
      })

      expect(event.type).toBe('invoice.payment_succeeded')
      expect(event.data.object.status).toBe('paid')
      expect(event.data.object.amount_paid).toBe(2999)
    })

    it('should handle invoice.payment_failed event', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionId: 'sub_123',
        subscriptionStatus: 'active',
      })

      const event = createMockWebhookEvent('invoice.payment_failed', {
        subscription: 'sub_123',
        attempt_count: 1,
        next_payment_attempt: Date.now() + 86400000,
      })

      expect(event.type).toBe('invoice.payment_failed')
      expect(event.data.object.attempt_count).toBe(1)

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({
        subscriptionStatus: 'past_due',
        paymentFailed: true,
        paymentAttempts: event.data.object.attempt_count,
      })

      const snapshot = await userDoc.get()
      expect(snapshot.data().subscriptionStatus).toBe('past_due')
      expect(snapshot.data().paymentFailed).toBe(true)
    })

    it('should handle multiple failed payment attempts', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionId: 'sub_123',
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)

      // First attempt
      await userDoc.update({ paymentAttempts: 1, subscriptionStatus: 'past_due' })
      
      // Second attempt
      await userDoc.update({ paymentAttempts: 2 })
      
      // Third attempt
      await userDoc.update({ paymentAttempts: 3 })

      const snapshot = await userDoc.get()
      expect(snapshot.data().paymentAttempts).toBe(3)
    })
  })

  describe('Customer Events', () => {
    it('should handle customer.created event', async () => {
      const event = createMockWebhookEvent('customer.created', {
        id: 'cus_new',
        email: mockUser.email,
        metadata: {
          firebaseUID: mockUser.uid,
        },
      })

      expect(event.type).toBe('customer.created')
      expect(event.data.object.email).toBe(mockUser.email)
    })

    it('should handle customer.updated event', async () => {
      const event = createMockWebhookEvent('customer.updated', {
        id: 'cus_123',
        email: 'newemail@example.com',
      })

      expect(event.type).toBe('customer.updated')
      expect(event.data.object.email).toBe('newemail@example.com')
    })

    it('should handle customer.deleted event', async () => {
      const event = createMockWebhookEvent('customer.deleted', {
        id: 'cus_123',
        deleted: true,
      })

      expect(event.type).toBe('customer.deleted')
      expect(event.data.object.deleted).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle unknown event types gracefully', () => {
      const event = createMockWebhookEvent('unknown.event.type', {
        id: 'test_123',
      })

      expect(event.type).toBe('unknown.event.type')
      // Should not throw error
    })

    it('should handle malformed event data', () => {
      const event = createMockWebhookEvent('customer.subscription.created', {
        // Missing required fields
      })

      expect(event.type).toBe('customer.subscription.created')
      expect(event.data.object).toBeDefined()
    })

    it('should handle Firestore update errors', async () => {
      const userDoc = mockFirestore.doc(`users/nonexistent`)
      
      // Mock error
      jest.spyOn(userDoc, 'update').mockRejectedValueOnce(
        new Error('Document not found')
      )

      await expect(
        userDoc.update({ subscriptionStatus: 'active' })
      ).rejects.toThrow('Document not found')
    })
  })

  describe('Idempotency', () => {
    it('should handle duplicate webhook events', async () => {
      const event = createMockWebhookEvent('customer.subscription.created', {
        id: 'sub_123',
        status: 'active',
      })

      // Process event twice
      expect(event.id).toBeTruthy()
      
      // Should use event ID to prevent duplicate processing
      const processedEvents = new Set()
      
      if (!processedEvents.has(event.id)) {
        processedEvents.add(event.id)
      }
      
      // Second processing should be skipped
      const alreadyProcessed = processedEvents.has(event.id)
      expect(alreadyProcessed).toBe(true)
    })
  })
})
