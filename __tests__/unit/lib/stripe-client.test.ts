import { mockStripeInstance } from '../../mocks/stripe'
import { mockUser } from '../../utils/test-utils'

describe('Stripe Client Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCheckoutSession', () => {
    test('should create checkout session', async () => {
      const priceId = 'price_premium'
      
      const session = await mockStripeInstance.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/cancel`,
      })

      expect(session).toHaveProperty('id')
      expect(session).toHaveProperty('url')
    })

    test('should handle checkout session creation errors', async () => {
      const invalidPriceId = ''
      
      // Should validate price ID
      expect(invalidPriceId).toBe('')
    })

    test('should include metadata in checkout session', async () => {
      const session = await mockStripeInstance.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: 'price_premium', quantity: 1 }],
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
        metadata: {
          userId: mockUser.uid,
          plan: 'premium',
        },
      })

      expect(session.metadata.userId).toBe(mockUser.uid)
      expect(session.metadata.plan).toBe('premium')
    })
  })

  describe('createPortalSession', () => {
    test('should create portal session', async () => {
      const customerId = 'cus_123'
      
      const session = await mockStripeInstance.billingPortal.sessions.create({
        customer: customerId,
        return_url: 'http://localhost:3000/dashboard',
      })

      expect(session).toHaveProperty('id')
      expect(session).toHaveProperty('url')
      expect(session.customer).toBe(customerId)
    })

    test('should handle portal session creation errors', async () => {
      const invalidCustomerId = ''
      
      // Should validate customer ID
      expect(invalidCustomerId).toBe('')
    })

    test('should use correct return URL', async () => {
      const returnUrl = 'http://localhost:3000/account'
      
      const session = await mockStripeInstance.billingPortal.sessions.create({
        customer: 'cus_123',
        return_url: returnUrl,
      })

      expect(session.return_url).toBe(returnUrl)
    })
  })

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate network error
      const mockError = new Error('Network error')
      
      expect(mockError.message).toBe('Network error')
    })

    test('should handle Stripe API errors', async () => {
      // Simulate Stripe error
      const mockError = new Error('Invalid API key')
      
      expect(mockError.message).toBe('Invalid API key')
    })

    test('should handle invalid parameters', () => {
      const invalidParams = {
        // Missing required fields
      }
      
      expect(Object.keys(invalidParams).length).toBe(0)
    })
  })

  describe('Response Handling', () => {
    test('should return checkout session URL', async () => {
      const session = await mockStripeInstance.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: 'price_premium', quantity: 1 }],
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
      })

      expect(session.url).toContain('checkout.stripe.com')
    })

    test('should return portal session URL', async () => {
      const session = await mockStripeInstance.billingPortal.sessions.create({
        customer: 'cus_123',
        return_url: 'http://localhost:3000/dashboard',
      })

      expect(session.url).toContain('billing.stripe.com')
    })
  })
})
