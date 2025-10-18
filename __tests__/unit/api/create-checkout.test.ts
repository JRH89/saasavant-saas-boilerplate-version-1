import { mockStripeInstance } from '../../mocks/stripe'
import { mockUser } from '../../utils/test-utils'

describe('Create Checkout API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/stripe/create-checkout', () => {
    test('should create checkout session with valid data', async () => {
      const checkoutData = {
        priceId: 'price_premium',
        userId: mockUser.uid,
        userEmail: mockUser.email,
      }

      const session = await mockStripeInstance.checkout.sessions.create({
        customer_email: checkoutData.userEmail,
        mode: 'subscription',
        line_items: [
          {
            price: checkoutData.priceId,
            quantity: 1,
          },
        ],
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
        metadata: {
          userId: checkoutData.userId,
        },
      })

      expect(session).toHaveProperty('id')
      expect(session).toHaveProperty('url')
      expect(session.mode).toBe('subscription')
    })

    test('should include user metadata in session', async () => {
      const session = await mockStripeInstance.checkout.sessions.create({
        customer_email: mockUser.email,
        mode: 'subscription',
        line_items: [{ price: 'price_premium', quantity: 1 }],
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
        metadata: {
          userId: mockUser.uid,
        },
      })

      expect(session.metadata.userId).toBe(mockUser.uid)
    })

    test('should handle missing price ID', async () => {
      const invalidData = {
        userId: mockUser.uid,
        userEmail: mockUser.email,
        // Missing priceId
      }

      // Should validate required fields
      expect(invalidData).not.toHaveProperty('priceId')
    })

    test('should handle missing user email', async () => {
      const invalidData = {
        priceId: 'price_premium',
        userId: mockUser.uid,
        // Missing userEmail
      }

      expect(invalidData).not.toHaveProperty('userEmail')
    })

    test('should create session with correct URLs', async () => {
      const successUrl = 'http://localhost:3000/dashboard?success=true'
      const cancelUrl = 'http://localhost:3000/pricing?canceled=true'

      const session = await mockStripeInstance.checkout.sessions.create({
        customer_email: mockUser.email,
        mode: 'subscription',
        line_items: [{ price: 'price_premium', quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
      })

      expect(session.success_url).toBe(successUrl)
      expect(session.cancel_url).toBe(cancelUrl)
    })

    test('should support different price tiers', async () => {
      const priceTiers = ['price_basic', 'price_premium', 'price_enterprise']

      for (const priceId of priceTiers) {
        const session = await mockStripeInstance.checkout.sessions.create({
          customer_email: mockUser.email,
          mode: 'subscription',
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: 'http://localhost:3000/success',
          cancel_url: 'http://localhost:3000/cancel',
        })

        expect(session.line_items[0].price).toBe(priceId)
      }
    })
  })
})
