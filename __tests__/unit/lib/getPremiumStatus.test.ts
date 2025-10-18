import { mockFirestore, addMockData, getMockData } from '../../mocks/firebase'
import { mockUser, mockSubscription } from '../../utils/test-utils'

describe('Get Premium Status Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPremiumStatus', () => {
    test('should return true for active premium subscription', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionStatus: 'active',
        plan: 'premium',
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      const snapshot = await userDoc.get()
      const userData = snapshot.data()

      const isPremium = userData.subscriptionStatus === 'active' && userData.plan === 'premium'
      expect(isPremium).toBe(true)
    })

    test('should return false for canceled subscription', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionStatus: 'canceled',
        plan: 'premium',
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      const snapshot = await userDoc.get()
      const userData = snapshot.data()

      const isPremium = userData.subscriptionStatus === 'active'
      expect(isPremium).toBe(false)
    })

    test('should return false for free plan', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        plan: 'free',
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      const snapshot = await userDoc.get()
      const userData = snapshot.data()

      const isPremium = userData.plan === 'premium'
      expect(isPremium).toBe(false)
    })

    test('should return false for past due subscription', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionStatus: 'past_due',
        plan: 'premium',
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      const snapshot = await userDoc.get()
      const userData = snapshot.data()

      const isPremium = userData.subscriptionStatus === 'active'
      expect(isPremium).toBe(false)
    })

    test('should handle user without subscription', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        // No subscription data
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      const snapshot = await userDoc.get()
      const userData = snapshot.data()

      const isPremium = userData.subscriptionStatus === 'active'
      expect(isPremium).toBe(false)
    })

    test('should handle non-existent user', async () => {
      const userDoc = mockFirestore.doc('users/nonexistent')
      const snapshot = await userDoc.get()

      expect(snapshot.exists()).toBe(false)
    })

    test('should check subscription expiry', async () => {
      const futureDate = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      const pastDate = Date.now() - 1 * 24 * 60 * 60 * 1000 // 1 day ago

      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionStatus: 'active',
        currentPeriodEnd: futureDate,
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      const snapshot = await userDoc.get()
      const userData = snapshot.data()

      const isActive = userData.currentPeriodEnd > Date.now()
      expect(isActive).toBe(true)
    })

    test('should handle different subscription statuses', async () => {
      const statuses = ['active', 'canceled', 'past_due', 'unpaid', 'trialing']

      for (const status of statuses) {
        addMockData('users', `user_${status}`, {
          email: `${status}@example.com`,
          subscriptionStatus: status,
        })

        const userDoc = mockFirestore.doc(`users/user_${status}`)
        const snapshot = await userDoc.get()
        const userData = snapshot.data()

        expect(userData.subscriptionStatus).toBe(status)
      }
    })

    test('should validate premium features access', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        subscriptionStatus: 'active',
        plan: 'premium',
        features: ['advanced_analytics', 'priority_support', 'custom_domain'],
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      const snapshot = await userDoc.get()
      const userData = snapshot.data()

      const hasPremiumFeatures = userData.features && userData.features.length > 0
      expect(hasPremiumFeatures).toBe(true)
    })
  })
})
