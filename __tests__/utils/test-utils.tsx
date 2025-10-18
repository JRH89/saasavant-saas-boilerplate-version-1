import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/context/AuthProvider'

// Mock user data
export const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
}

export const mockAdminUser = {
  uid: 'admin-user-123',
  email: 'admin@example.com',
  displayName: 'Admin User',
  emailVerified: true,
}

// Mock subscription data
export const mockSubscription = {
  id: 'sub_123',
  status: 'active',
  current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
  cancel_at_period_end: false,
  plan: {
    id: 'price_premium',
    product: 'prod_premium',
    amount: 2999,
    currency: 'usd',
    interval: 'month',
  },
}

export const mockCanceledSubscription = {
  ...mockSubscription,
  status: 'canceled',
  cancel_at_period_end: true,
}

export const mockPastDueSubscription = {
  ...mockSubscription,
  status: 'past_due',
}

// Mock support ticket
export const mockSupportTicket = {
  id: 'ticket-123',
  userId: mockUser.uid,
  type: 'Bug',
  message: 'Test support ticket message',
  timestamp: Date.now(),
  ticketStatus: 'submitted',
}

// Custom render with providers
interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return <AuthProvider>{children}</AuthProvider>
}

const customRender = (
  ui: ReactElement<any>,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock Firebase functions
export const mockFirebaseAuth = {
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}

export const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}

// Mock Stripe functions
export const mockStripe = {
  customers: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
  },
  checkout: {
    sessions: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  },
  billingPortal: {
    sessions: {
      create: jest.fn(),
    },
  },
  subscriptions: {
    retrieve: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}

// Reset all mocks
export const resetAllMocks = () => {
  Object.values(mockFirebaseAuth).forEach(mock => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      mock.mockClear()
    }
  })
  Object.values(mockFirestore).forEach(mock => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      mock.mockClear()
    }
  })
  Object.values(mockStripe.customers).forEach(mock => mock.mockClear())
  Object.values(mockStripe.checkout.sessions).forEach(mock => mock.mockClear())
  Object.values(mockStripe.billingPortal.sessions).forEach(mock => mock.mockClear())
  Object.values(mockStripe.subscriptions).forEach(mock => mock.mockClear())
}
