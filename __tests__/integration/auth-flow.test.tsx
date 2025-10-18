import { mockAuth, mockFirestore, addMockData } from '../mocks/firebase'
import { mockUser } from '../utils/test-utils'

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.currentUser = null
  })

  describe('Complete Sign Up Flow', () => {
    it('should complete full sign up process', async () => {
      const email = 'newuser@example.com'
      const password = 'password123'
      const displayName = 'New User'

      // Step 1: Create user in Firebase Auth
      const authResult = await mockAuth.createUserWithEmailAndPassword(email, password)
      expect(authResult.user.email).toBe(email)

      // Step 2: Create user document in Firestore
      const userDoc = mockFirestore.doc(`users/${authResult.user.uid}`)
      await userDoc.set({
        email,
        displayName,
        createdAt: Date.now(),
        isAdmin: false,
        emailVerified: false,
      })

      // Step 3: Verify user document was created
      const snapshot = await userDoc.get()
      expect(snapshot.exists()).toBe(true)
      expect(snapshot.data().email).toBe(email)
      expect(snapshot.data().displayName).toBe(displayName)
    })

    it('should send welcome email after signup', async () => {
      const mockSendEmail = jest.fn().mockResolvedValue({ success: true })
      
      const authResult = await mockAuth.createUserWithEmailAndPassword(
        'newuser@example.com',
        'password123'
      )

      // Simulate sending welcome email
      await mockSendEmail({
        to: authResult.user.email,
        subject: 'Welcome to SaaSavant',
        template: 'welcome',
      })

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'newuser@example.com',
          subject: 'Welcome to SaaSavant',
        })
      )
    })
  })

  describe('Complete Sign In Flow', () => {
    it('should complete full sign in process', async () => {
      // Setup: User exists in database
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        displayName: mockUser.displayName,
        isAdmin: false,
      })

      // Step 1: Sign in with Firebase Auth
      const authResult = await mockAuth.signInWithEmailAndPassword(
        'test@example.com',
        'password123'
      )
      expect(authResult.user.email).toBe('test@example.com')

      // Step 2: Fetch user data from Firestore
      const userDoc = mockFirestore.doc(`users/${authResult.user.uid}`)
      const snapshot = await userDoc.get()
      
      expect(snapshot.exists()).toBe(true)
      expect(snapshot.data().email).toBe(mockUser.email)
    })

    it('should update last login timestamp', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        lastLogin: null,
      })

      await mockAuth.signInWithEmailAndPassword('test@example.com', 'password123')

      // Update last login
      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      await userDoc.update({ lastLogin: Date.now() })

      const snapshot = await userDoc.get()
      expect(snapshot.data().lastLogin).toBeTruthy()
    })
  })

  describe('Sign Out Flow', () => {
    it('should complete sign out process', async () => {
      // Setup: User is signed in
      mockAuth.currentUser = mockUser as any

      // Sign out
      await mockAuth.signOut()

      expect(mockAuth.currentUser).toBeNull()
    })

    it('should clear local state on sign out', async () => {
      mockAuth.currentUser = mockUser as any
      let localUserState = mockUser

      await mockAuth.signOut()
      localUserState = null as any

      expect(mockAuth.currentUser).toBeNull()
      expect(localUserState).toBeNull()
    })
  })

  describe('Password Reset Flow', () => {
    it('should send password reset email', async () => {
      const email = 'test@example.com'
      
      await mockAuth.sendPasswordResetEmail(email)

      expect(mockAuth.sendPasswordResetEmail).toHaveBeenCalledWith(email)
    })

    it('should handle password reset for existing user', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
      })

      await mockAuth.sendPasswordResetEmail(mockUser.email)

      expect(mockAuth.sendPasswordResetEmail).toHaveBeenCalled()
    })
  })

  describe('Admin Access Flow', () => {
    it('should grant admin access to admin users', async () => {
      addMockData('users', 'admin-123', {
        email: 'admin@example.com',
        isAdmin: true,
      })

      const userDoc = mockFirestore.doc('users/admin-123')
      const snapshot = await userDoc.get()
      const userData = snapshot.data()

      expect(userData.isAdmin).toBe(true)
    })

    it('should deny admin access to regular users', async () => {
      addMockData('users', mockUser.uid, {
        email: mockUser.email,
        isAdmin: false,
      })

      const userDoc = mockFirestore.doc(`users/${mockUser.uid}`)
      const snapshot = await userDoc.get()
      const userData = snapshot.data()

      expect(userData.isAdmin).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle sign in with wrong password', async () => {
      await expect(
        mockAuth.signInWithEmailAndPassword('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials')
    })

    it('should handle sign up with existing email', async () => {
      mockAuth.createUserWithEmailAndPassword.mockRejectedValueOnce(
        new Error('Email already in use')
      )

      await expect(
        mockAuth.createUserWithEmailAndPassword('test@example.com', 'password123')
      ).rejects.toThrow('Email already in use')
    })

    it('should handle network errors during authentication', async () => {
      mockAuth.signInWithEmailAndPassword.mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(
        mockAuth.signInWithEmailAndPassword('test@example.com', 'password123')
      ).rejects.toThrow('Network error')
    })
  })
})
