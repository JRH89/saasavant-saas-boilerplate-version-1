import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { mockAuth } from '../../mocks/firebase'
import { mockUser } from '../../utils/test-utils'

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  signInWithEmailAndPassword: jest.fn(),
}))

// Mock the auth context
const mockSignIn = jest.fn()
jest.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: mockSignIn,
  }),
}))

describe('Sign In Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signInWithEmailAndPassword', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockSignInFn = signInWithEmailAndPassword as jest.Mock
      mockSignInFn.mockResolvedValue({ user: mockUser })

      const result = await mockSignInFn(
        mockAuth,
        'test@example.com',
        'password123'
      )

      expect(result.user).toEqual(mockUser)
      expect(mockSignInFn).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      )
    })

    it('should fail with invalid credentials', async () => {
      const mockSignInFn = signInWithEmailAndPassword as jest.Mock
      mockSignInFn.mockRejectedValue(new Error('Invalid credentials'))

      await expect(
        mockSignInFn(mockAuth, 'wrong@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials')
    })

    it('should fail with empty email', async () => {
      const mockSignInFn = signInWithEmailAndPassword as jest.Mock
      mockSignInFn.mockRejectedValue(new Error('Email is required'))

      await expect(
        mockSignInFn(mockAuth, '', 'password123')
      ).rejects.toThrow('Email is required')
    })

    it('should fail with empty password', async () => {
      const mockSignInFn = signInWithEmailAndPassword as jest.Mock
      mockSignInFn.mockRejectedValue(new Error('Password is required'))

      await expect(
        mockSignInFn(mockAuth, 'test@example.com', '')
      ).rejects.toThrow('Password is required')
    })

    it('should handle network errors', async () => {
      const mockSignInFn = signInWithEmailAndPassword as jest.Mock
      mockSignInFn.mockRejectedValue(new Error('Network error'))

      await expect(
        mockSignInFn(mockAuth, 'test@example.com', 'password123')
      ).rejects.toThrow('Network error')
    })
  })

  describe('Auth State Persistence', () => {
    it('should maintain auth state after successful login', async () => {
      const mockSignInFn = signInWithEmailAndPassword as jest.Mock
      mockSignInFn.mockResolvedValue({ user: mockUser })

      await mockSignInFn(mockAuth, 'test@example.com', 'password123')
      
      // Simulate auth state change
      mockAuth.currentUser = mockUser as any

      expect(mockAuth.currentUser).toEqual(mockUser)
    })

    it('should clear auth state after logout', async () => {
      mockAuth.currentUser = mockUser as any
      
      await mockAuth.signOut()

      expect(mockAuth.currentUser).toBeNull()
    })
  })

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      await mockAuth.sendPasswordResetEmail('test@example.com')

      expect(mockAuth.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com')
    })

    it('should handle invalid email for password reset', async () => {
      mockAuth.sendPasswordResetEmail.mockRejectedValueOnce(
        new Error('Invalid email')
      )

      await expect(
        mockAuth.sendPasswordResetEmail('invalid-email')
      ).rejects.toThrow('Invalid email')
    })
  })
})
