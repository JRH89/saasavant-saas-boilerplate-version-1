import { mockStripeInstance, resetMockStripeData } from '../../mocks/stripe'
import { mockUser } from '../../utils/test-utils'

describe('Stripe Checkout', () => {
  beforeEach(() => {
    resetMockStripeData()
  })

  describe('Create Checkout Session', () => {
    it('should create a checkout session for subscription', async () => {
      const session = await mockStripeInstance.checkout.sessions.create({
        customer: 'cus_123',
        mode: 'subscription',
        line_items: [
          {
            price: 'price_premium',
            quantity: 1,
          },
        ],
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
        metadata: {
          userId: mockUser.uid,
        },
      })

      expect(session).toHaveProperty('id')
      expect(session).toHaveProperty('url')
      expect(session.mode).toBe('subscription')
      expect(session.customer).toBe('cus_123')
      expect(session.metadata.userId).toBe(mockUser.uid)
    })

    it('should create a checkout session with correct URLs', async () => {
      const successUrl = 'http://localhost:3000/dashboard?success=true'
      const cancelUrl = 'http://localhost:3000/pricing?canceled=true'

      const session = await mockStripeInstance.checkout.sessions.create({
        customer: 'cus_123',
        mode: 'subscription',
        line_items: [{ price: 'price_premium', quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
      })

      expect(session.success_url).toBe(successUrl)
      expect(session.cancel_url).toBe(cancelUrl)
    })

    it('should retrieve a checkout session', async () => {
      const createdSession = await mockStripeInstance.checkout.sessions.create({
        customer: 'cus_123',
        mode: 'subscription',
        line_items: [{ price: 'price_premium', quantity: 1 }],
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
      })

      const retrievedSession = await mockStripeInstance.checkout.sessions.retrieve(
        createdSession.id
      )

      expect(retrievedSession.id).toBe(createdSession.id)
      expect(retrievedSession.customer).toBe('cus_123')
    })

    it('should fail to retrieve non-existent session', async () => {
      await expect(
        mockStripeInstance.checkout.sessions.retrieve('cs_nonexistent')
      ).rejects.toThrow('Session not found')
    })
  })

  describe('Billing Portal Session', () => {
    it('should create a billing portal session', async () => {
      const session = await mockStripeInstance.billingPortal.sessions.create({
        customer: 'cus_123',
        return_url: 'http://localhost:3000/dashboard',
      })

      expect(session).toHaveProperty('id')
      expect(session).toHaveProperty('url')
      expect(session.customer).toBe('cus_123')
      expect(session.return_url).toBe('http://localhost:3000/dashboard')
    })

    it('should generate unique portal URLs', async () => {
      const session1 = await mockStripeInstance.billingPortal.sessions.create({
        customer: 'cus_123',
        return_url: 'http://localhost:3000/dashboard',
      })

      const session2 = await mockStripeInstance.billingPortal.sessions.create({
        customer: 'cus_456',
        return_url: 'http://localhost:3000/dashboard',
      })

      expect(session1.id).not.toBe(session2.id)
      expect(session1.url).not.toBe(session2.url)
    })
  })

  describe('Customer Management', () => {
    it('should create a new customer', async () => {
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
        metadata: {
          firebaseUID: mockUser.uid,
        },
      })

      expect(customer).toHaveProperty('id')
      expect(customer.email).toBe(mockUser.email)
      expect(customer.metadata.firebaseUID).toBe(mockUser.uid)
    })

    it('should retrieve an existing customer', async () => {
      const createdCustomer = await mockStripeInstance.customers.create({
        email: mockUser.email,
        metadata: { firebaseUID: mockUser.uid },
      })

      const retrievedCustomer = await mockStripeInstance.customers.retrieve(
        createdCustomer.id
      )

      expect(retrievedCustomer.id).toBe(createdCustomer.id)
      expect(retrievedCustomer.email).toBe(mockUser.email)
    })

    it('should update customer information', async () => {
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
      })

      const updatedCustomer = await mockStripeInstance.customers.update(
        customer.id,
        {
          metadata: { plan: 'premium' },
        }
      )

      expect(updatedCustomer.metadata.plan).toBe('premium')
    })

    it('should delete a customer', async () => {
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
      })

      const deletedCustomer = await mockStripeInstance.customers.del(customer.id)

      expect(deletedCustomer.deleted).toBe(true)
      await expect(
        mockStripeInstance.customers.retrieve(customer.id)
      ).rejects.toThrow('Customer not found')
    })
  })
})
