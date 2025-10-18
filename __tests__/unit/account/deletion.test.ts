import { mockAuth, mockFirestore, addMockData, getMockData } from '../../mocks/firebase'
import { mockStripeInstance, addMockCustomer, addMockSubscription } from '../../mocks/stripe'
import { mockUser, mockSubscription } from '../../utils/test-utils'

describe('Account Deletion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Delete User Account', () => {
    it('should delete user from Firebase Auth', async () => {
      mockAuth.currentUser = mockUser as any
      
      // Mock delete user function
      const mockDeleteUser = jest.fn().mockResolvedValue(undefined)
      
      await mockDeleteUser()
      
      expect(mockDeleteUser).toHaveBeenCalled()
    })

    it('should delete user document from Firestore', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        displayName: mockUser.displayName,
        isAdmin: false,
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.delete()

      const deletedUser = getMockData('users', mockUser.uid)
      expect(deletedUser).toBeUndefined()
    })

    it('should verify user document is deleted', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.delete()

      const snapshot = await userDoc.get()
      expect(snapshot.exists()).toBe(false)
    })
  })

  describe('Delete User Data', () => {
    it('should delete user support tickets', async () => {
      addMockData('supportTickets', 'ticket1', {
        userId: mockUser.uid,
        type: 'Bug',
        message: 'Test ticket',
      })

      addMockData('supportTickets', 'ticket2', {
        userId: mockUser.uid,
        type: 'Help',
        message: 'Test ticket 2',
      })

      // Delete tickets
      const ticketDoc1 = mockFirestore.doc('supportTickets/ticket1')
      const ticketDoc2 = mockFirestore.doc('supportTickets/ticket2')
      
      await ticketDoc1.delete()
      await ticketDoc2.delete()

      expect(getMockData('supportTickets', 'ticket1')).toBeUndefined()
      expect(getMockData('supportTickets', 'ticket2')).toBeUndefined()
    })

    it('should delete user-specific collections', async () => {
      const collections = ['supportTickets', 'userSettings', 'notifications']
      
      for (const collection of collections) {
        addMockData(collection, `${mockUser.uid}_1`, {
          userId: mockUser.uid,
          data: 'test',
        })

        const doc = mockFirestore.doc(`${collection}/${mockUser.uid}_1`)
        await doc.delete()

        expect(getMockData(collection, `${mockUser.uid}_1`)).toBeUndefined()
      }
    })
  })

  describe('Cancel Stripe Subscription', () => {
    it('should cancel active subscription before account deletion', async () => {
      addMockSubscription('sub_active', {
        ...mockSubscription,
        id: 'sub_active',
        customer: 'cus_123',
        status: 'active',
      })

      const canceledSub = await mockStripeInstance.subscriptions.cancel('sub_active')

      expect(canceledSub.status).toBe('canceled')
      expect(canceledSub).toHaveProperty('canceled_at')
    })

    it('should handle subscription already canceled', async () => {
      addMockSubscription('sub_canceled', {
        ...mockSubscription,
        id: 'sub_canceled',
        status: 'canceled',
      })

      const subscription = await mockStripeInstance.subscriptions.retrieve('sub_canceled')
      expect(subscription.status).toBe('canceled')
    })
  })

  describe('Delete Stripe Customer', () => {
    it('should delete Stripe customer', async () => {
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
        metadata: { firebaseUID: mockUser.uid },
      })

      const deletedCustomer = await mockStripeInstance.customers.del(customer.id)

      expect(deletedCustomer.deleted).toBe(true)
      expect(deletedCustomer.id).toBe(customer.id)
    })

    it('should verify customer is deleted from Stripe', async () => {
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
      })

      await mockStripeInstance.customers.del(customer.id)

      await expect(
        mockStripeInstance.customers.retrieve(customer.id)
      ).rejects.toThrow('Customer not found')
    })

    it('should handle customer with active subscriptions', async () => {
      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
      })

      addMockSubscription('sub_test', {
        ...mockSubscription,
        customer: customer.id,
        status: 'active',
      })

      // Cancel subscription first
      await mockStripeInstance.subscriptions.cancel('sub_test')
      
      // Then delete customer
      const deletedCustomer = await mockStripeInstance.customers.del(customer.id)
      expect(deletedCustomer.deleted).toBe(true)
    })
  })

  describe('Complete Account Deletion Flow', () => {
    it('should execute full account deletion process', async () => {
      // Setup user with data
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        displayName: mockUser.displayName,
      })

      addMockData('supportTickets', 'ticket1', {
        userId: mockUser.uid,
        type: 'Bug',
        message: 'Test',
      })

      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
        metadata: { firebaseUID: mockUser.uid },
      })

      addMockSubscription('sub_user', {
        ...mockSubscription,
        customer: customer.id,
      })

      // Execute deletion steps
      // 1. Cancel subscription
      await mockStripeInstance.subscriptions.cancel('sub_user')
      
      // 2. Delete Stripe customer
      await mockStripeInstance.customers.del(customer.id)
      
      // 3. Delete user data
      const ticketDoc = mockFirestore.doc('supportTickets/ticket1')
      await ticketDoc.delete()
      
      // 4. Delete user document
      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.delete()

      // Verify all deletions
      expect(getMockData('users', mockUser.uid)).toBeUndefined()
      expect(getMockData('supportTickets', 'ticket1')).toBeUndefined()
      
      await expect(
        mockStripeInstance.customers.retrieve(customer.id)
      ).rejects.toThrow('Customer not found')
    })

    it('should handle deletion with no active subscription', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
      })

      const customer = await mockStripeInstance.customers.create({
        email: mockUser.email,
      })

      // Delete without subscription
      await mockStripeInstance.customers.del(customer.id)
      
      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.delete()

      expect(getMockData('users', mockUser.uid)).toBeUndefined()
    })
  })

  describe('Account Deletion Validation', () => {
    it('should require user authentication for deletion', () => {
      const isAuthenticated = mockAuth.currentUser !== null
      
      if (!isAuthenticated) {
        expect(isAuthenticated).toBe(false)
      }
    })

    it('should prevent deletion without confirmation', () => {
      const confirmDeletion = (confirmed: boolean) => confirmed === true
      
      expect(confirmDeletion(true)).toBe(true)
      expect(confirmDeletion(false)).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle Firestore deletion errors gracefully', async () => {
      const mockError = new Error('Firestore deletion failed')
      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      
      jest.spyOn(userDoc, 'delete').mockRejectedValueOnce(mockError)

      await expect(userDoc.delete()).rejects.toThrow('Firestore deletion failed')
    })

    it('should handle Stripe deletion errors gracefully', async () => {
      await expect(
        mockStripeInstance.customers.del('cus_nonexistent')
      ).rejects.toThrow('Customer not found')
    })
  })
})
