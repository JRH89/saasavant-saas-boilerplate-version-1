import { mockUser, mockAdminUser } from '../utils/test-utils'

// Mock Firebase Auth
export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(mockAuth.currentUser)
    return jest.fn() // unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(async (email: string, password: string) => {
    if (email === 'test@example.com' && password === 'password123') {
      mockAuth.currentUser = mockUser as any
      return { user: mockUser }
    }
    throw new Error('Invalid credentials')
  }),
  createUserWithEmailAndPassword: jest.fn(async (email: string, password: string) => {
    const newUser = { ...mockUser, email }
    mockAuth.currentUser = newUser as any
    return { user: newUser }
  }),
  signOut: jest.fn(async () => {
    mockAuth.currentUser = null
  }),
  sendPasswordResetEmail: jest.fn(async () => Promise.resolve()),
}

// Mock Firestore
const mockData: Record<string, any> = {
  users: {
    [mockUser.uid]: {
      email: mockUser.email,
      displayName: mockUser.displayName,
      isAdmin: false,
      createdAt: Date.now(),
    },
    [mockAdminUser.uid]: {
      email: mockAdminUser.email,
      displayName: mockAdminUser.displayName,
      isAdmin: true,
      createdAt: Date.now(),
    },
  },
  supportTickets: {},
  announcements: {},
}

export const mockFirestore = {
  collection: jest.fn((collectionName: string) => ({
    doc: jest.fn((docId?: string) => ({
      get: jest.fn(async () => ({
        exists: () => !!mockData[collectionName]?.[docId || ''],
        data: () => mockData[collectionName]?.[docId || ''],
        id: docId,
      })),
      set: jest.fn(async (data: any) => {
        if (!mockData[collectionName]) mockData[collectionName] = {}
        mockData[collectionName][docId || ''] = data
      }),
      update: jest.fn(async (data: any) => {
        if (mockData[collectionName]?.[docId || '']) {
          mockData[collectionName][docId || ''] = {
            ...mockData[collectionName][docId || ''],
            ...data,
          }
        }
      }),
      delete: jest.fn(async () => {
        if (mockData[collectionName]?.[docId || '']) {
          delete mockData[collectionName][docId || '']
        }
      }),
    })),
    add: jest.fn(async (data: any) => {
      const id = `${collectionName}_${Date.now()}`
      if (!mockData[collectionName]) mockData[collectionName] = {}
      mockData[collectionName][id] = { ...data, id }
      return { id }
    }),
    get: jest.fn(async () => ({
      docs: Object.entries(mockData[collectionName] || {}).map(([id, data]) => ({
        id,
        data: () => data,
        exists: true,
      })),
    })),
    where: jest.fn(() => ({
      get: jest.fn(async () => ({
        docs: Object.entries(mockData[collectionName] || {}).map(([id, data]) => ({
          id,
          data: () => data,
          exists: true,
        })),
      })),
    })),
  })),
  doc: jest.fn((path: string) => {
    const [collectionName, docId] = path.split('/')
    return {
      get: jest.fn(async () => ({
        exists: () => !!mockData[collectionName]?.[docId],
        data: () => mockData[collectionName]?.[docId],
        id: docId,
      })),
      set: jest.fn(async (data: any) => {
        if (!mockData[collectionName]) mockData[collectionName] = {}
        mockData[collectionName][docId] = data
      }),
      update: jest.fn(async (data: any) => {
        if (mockData[collectionName]?.[docId]) {
          mockData[collectionName][docId] = {
            ...mockData[collectionName][docId],
            ...data,
          }
        }
      }),
      delete: jest.fn(async () => {
        if (mockData[collectionName]?.[docId]) {
          delete mockData[collectionName][docId]
        }
      }),
    }
  }),
}

// Helper to reset mock data
export const resetMockData = () => {
  Object.keys(mockData).forEach(key => {
    if (key !== 'users') {
      mockData[key] = {}
    }
  })
}

// Helper to add mock data
export const addMockData = (collection: string, id: string, data: any) => {
  if (!mockData[collection]) mockData[collection] = {}
  mockData[collection][id] = data
}

// Helper to get mock data
export const getMockData = (collection: string, id?: string) => {
  if (id) return mockData[collection]?.[id]
  return mockData[collection]
}
