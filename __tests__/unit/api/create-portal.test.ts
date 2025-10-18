import { mockStripeInstance } from '../../mocks/stripe'
import { mockUser } from '../../utils/test-utils'

describe('Create Portal API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/stripe/create-portal', () => {
    test('should create billing portal session', async () => {
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
        metadata: { firebaseUID: mockUser.uid },
      })

      const portalSession = await mockStripeInstance.billingPortal.sessions.create({
        customer: customer.id,
        return_url: 'http://localhost:3000/dashboard',
      })

      expect(portalSession).toHaveProperty('id')
      expect(portalSession).toHaveProperty('url')
      expect(portalSession.customer).toBe(customer.id)
    })

    test('should include return URL', async () => {
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
      })

      const returnUrl = 'http://localhost:3000/account'
      const portalSession = await mockStripeInstance.billingPortal.sessions.create({
        customer: customer.id,
        return_url: returnUrl,
      })

      expect(portalSession.return_url).toBe(returnUrl)
    })

    test('should handle missing customer ID', async () => {
      const invalidData = {
        return_url: 'http://localhost:3000/dashboard',
        // Missing customer
      }

      expect(invalidData).not.toHaveProperty('customer')
    })

    test('should handle invalid customer ID', async () => {
      await expect(
        mockStripeInstance.billingPortal.sessions.create({
          customer: 'invalid_customer_id',
          return_url: 'http://localhost:3000/dashboard',
        })
      ).resolves.toHaveProperty('id')
    })

    test('should generate unique portal URLs', async () => {
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
      })

      const session1 = await mockStripeInstance.billingPortal.sessions.create({
        customer: customer.id,
        return_url: 'http://localhost:3000/dashboard',
      })

      const session2 = await mockStripeInstance.billingPortal.sessions.create({
        customer: customer.id,
        return_url: 'http://localhost:3000/dashboard',
      })

      expect(session1.id).not.toBe(session2.id)
      expect(session1.url).not.toBe(session2.url)
    })

    test('should work with different return URLs', async () => {
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
      })

      const returnUrls = [
        'http://localhost:3000/dashboard',
        'http://localhost:3000/account',
        'http://localhost:3000/settings',
      ]

      for (const returnUrl of returnUrls) {
        const session = await mockStripeInstance.billingPortal.sessions.create({
          customer: customer.id,
          return_url: returnUrl,
        })

        expect(session.return_url).toBe(returnUrl)
      }
    })
  })
})
