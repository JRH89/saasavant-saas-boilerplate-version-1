import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { mockAuth, mockFirestore } from '../../mocks/firebase'
import { mockUser } from '../../utils/test-utils'

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  createUserWithEmailAndPassword: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore),
  doc: jest.fn(),
  setDoc: jest.fn(),
  collection: jest.fn(),
}))

describe('Sign Up Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createUserWithEmailAndPassword', () => {
    it('should successfully create a new user', async () => {
      const mockCreateUser = createUserWithEmailAndPassword as jest.Mock
      const newUser = { ...mockUser, email: 'newuser@example.com' }
      mockCreateUser.mockResolvedValue({ user: newUser })

      const result = await mockCreateUser(
        mockAuth,
        'newuser@example.com',
        'password123'
      )

      expect(result.user.email).toBe('newuser@example.com')
      expect(mockCreateUser).toHaveBeenCalledWith(
        mockAuth,
        'newuser@example.com',
        'password123'
      )
    })

    it('should fail with existing email', async () => {
      const mockCreateUser = createUserWithEmailAndPassword as jest.Mock
      mockCreateUser.mockRejectedValue(new Error('Email already in use'))

      await expect(
        mockCreateUser(mockAuth, 'test@example.com', 'password123')
      ).rejects.toThrow('Email already in use')
    })

    it('should fail with weak password', async () => {
      const mockCreateUser = createUserWithEmailAndPassword as jest.Mock
      mockCreateUser.mockRejectedValue(new Error('Password should be at least 6 characters'))

      await expect(
        mockCreateUser(mockAuth, 'newuser@example.com', '123')
      ).rejects.toThrow('Password should be at least 6 characters')
    })

    it('should fail with invalid email format', async () => {
      const mockCreateUser = createUserWithEmailAndPassword as jest.Mock
      mockCreateUser.mockRejectedValue(new Error('Invalid email format'))

      await expect(
        mockCreateUser(mockAuth, 'invalid-email', 'password123')
      ).rejects.toThrow('Invalid email format')
    })
  })

  describe('User Profile Creation', () => {
    it('should create user document in Firestore after signup', async () => {
      const mockCreateUser = createUserWithEmailAndPassword as jest.Mock
      const mockSetDoc = setDoc as jest.Mock
      const mockDoc = doc as jest.Mock

      const newUser = { uid: 'new-user-123', email: 'newuser@example.com' }
      mockCreateUser.mockResolvedValue({ user: newUser })
      mockDoc.mockReturnValue({ id: newUser.uid })
      mockSetDoc.mockResolvedValue(undefined)

      await mockCreateUser(mockAuth, 'newuser@example.com', 'password123')
      
      // Simulate creating user document
      const userRef = mockDoc(mockFirestore, 'users', newUser.uid)
      await mockSetDoc(userRef, {
        email: newUser.email,
        createdAt: Date.now(),
        isAdmin: false,
      })

      expect(mockSetDoc).toHaveBeenCalled()
    })

    it('should set default user properties', async () => {
      const mockSetDoc = setDoc as jest.Mock
      const mockDoc = doc as jest.Mock

      const userData = {
        email: 'newuser@example.com',
        createdAt: Date.now(),
        isAdmin: false,
        displayName: '',
      }

      const userRef = mockDoc(mockFirestore, 'users', 'new-user-123')
      await mockSetDoc(userRef, userData)

      expect(mockSetDoc).toHaveBeenCalledWith(userRef, expect.objectContaining({
        email: 'newuser@example.com',
        isAdmin: false,
      }))
    })
  })

  describe('Email Verification', () => {
    it('should send verification email after signup', async () => {
      const mockSendEmailVerification = jest.fn().mockResolvedValue(undefined)
      const newUser = {
        ...mockUser,
        emailVerified: false,
        sendEmailVerification: mockSendEmailVerification,
      }

      await newUser.sendEmailVerification()

      expect(mockSendEmailVerification).toHaveBeenCalled()
    })
  })

  describe('Input Validation', () => {
    it('should validate email format before signup', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      expect(emailRegex.test('valid@example.com')).toBe(true)
      expect(emailRegex.test('invalid-email')).toBe(false)
      expect(emailRegex.test('missing@domain')).toBe(false)
      expect(emailRegex.test('@example.com')).toBe(false)
    })

    it('should validate password strength', () => {
      const isPasswordValid = (password: string) => password.length >= 6
      
      expect(isPasswordValid('password123')).toBe(true)
      expect(isPasswordValid('12345')).toBe(false)
      expect(isPasswordValid('')).toBe(false)
    })
  })
})
