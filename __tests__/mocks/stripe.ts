import { mockSubscription, mockCanceledSubscription, mockPastDueSubscription } from '../utils/test-utils'

// Mock Stripe customer data
const mockCustomers: Record<string, any> = {}
const mockCheckoutSessions: Record<string, any> = {}
const mockSubscriptions: Record<string, any> = {
  'sub_123': mockSubscription,
  'sub_canceled': mockCanceledSubscription,
  'sub_past_due': mockPastDueSubscription,
}

export const mockStripeInstance = {
  customers: {
    create: jest.fn(async (params: any) => {
      const customerId = `cus_${Date.now()}`
      mockCustomers[customerId] = {
        id: customerId,
        email: params.email,
        metadata: params.metadata || {},
        created: Math.floor(Date.now() / 1000),
      }
      return mockCustomers[customerId]
    }),
    retrieve: jest.fn(async (customerId: string) => {
      if (!mockCustomers[customerId]) {
        throw new Error('Customer not found')
      }
      return mockCustomers[customerId]
    }),
    update: jest.fn(async (customerId: string, params: any) => {
      if (!mockCustomers[customerId]) {
        throw new Error('Customer not found')
      }
      mockCustomers[customerId] = {
        ...mockCustomers[customerId],
        ...params,
      }
      return mockCustomers[customerId]
    }),
    del: jest.fn(async (customerId: string) => {
      if (!mockCustomers[customerId]) {
        throw new Error('Customer not found')
      }
      delete mockCustomers[customerId]
      return { id: customerId, deleted: true }
    }),
  },
  checkout: {
    sessions: {
      create: jest.fn(async (params: any) => {
        const sessionId = `cs_${Date.now()}`
        mockCheckoutSessions[sessionId] = {
          id: sessionId,
          url: `https://checkout.stripe.com/pay/${sessionId}`,
          customer: params.customer,
          mode: params.mode,
          line_items: params.line_items,
          success_url: params.success_url,
          cancel_url: params.cancel_url,
          metadata: params.metadata || {},
        }
        return mockCheckoutSessions[sessionId]
      }),
      retrieve: jest.fn(async (sessionId: string) => {
        if (!mockCheckoutSessions[sessionId]) {
          throw new Error('Session not found')
        }
        return mockCheckoutSessions[sessionId]
      }),
    },
  },
  billingPortal: {
    sessions: {
      create: jest.fn(async (params: any) => {
        const uniqueId = `bps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        return {
          id: uniqueId,
          url: `https://billing.stripe.com/session/${uniqueId}`,
          customer: params.customer,
          return_url: params.return_url,
        }
      }),
    },
  },
  subscriptions: {
    retrieve: jest.fn(async (subscriptionId: string) => {
      if (!mockSubscriptions[subscriptionId]) {
        throw new Error('Subscription not found')
      }
      return mockSubscriptions[subscriptionId]
    }),
    update: jest.fn(async (subscriptionId: string, params: any) => {
      if (!mockSubscriptions[subscriptionId]) {
        throw new Error('Subscription not found')
      }
      mockSubscriptions[subscriptionId] = {
        ...mockSubscriptions[subscriptionId],
        ...params,
      }
      return mockSubscriptions[subscriptionId]
    }),
    cancel: jest.fn(async (subscriptionId: string) => {
      if (!mockSubscriptions[subscriptionId]) {
        throw new Error('Subscription not found')
      }
      mockSubscriptions[subscriptionId] = {
        ...mockSubscriptions[subscriptionId],
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000),
      }
      return mockSubscriptions[subscriptionId]
    }),
    list: jest.fn(async (params: any) => {
      const customerSubs = Object.values(mockSubscriptions).filter(
        (sub: any) => sub.customer === params.customer
      )
      return {
        data: customerSubs,
        has_more: false,
      }
    }),
  },
  webhooks: {
    constructEvent: jest.fn((payload: any, signature: string, secret: string) => {
      // Mock webhook event construction
      return JSON.parse(payload)
    }),
  },
  paymentIntents: {
    retrieve: jest.fn(async (paymentIntentId: string) => {
      return {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 2999,
        currency: 'usd',
      }
    }),
  },
}

// Helper functions
export const resetMockStripeData = () => {
  Object.keys(mockCustomers).forEach(key => delete mockCustomers[key])
  Object.keys(mockCheckoutSessions).forEach(key => delete mockCheckoutSessions[key])
  // Reset subscriptions to default mocks
  Object.keys(mockSubscriptions).forEach(key => {
    if (!['sub_123', 'sub_canceled', 'sub_past_due'].includes(key)) {
      delete mockSubscriptions[key]
    }
  })
}

export const addMockCustomer = (customerId: string, data: any) => {
  mockCustomers[customerId] = data
}

export const addMockSubscription = (subscriptionId: string, data: any) => {
  mockSubscriptions[subscriptionId] = data
}

export const getMockCustomer = (customerId: string) => mockCustomers[customerId]

export const getMockSubscription = (subscriptionId: string) => mockSubscriptions[subscriptionId]

// Mock webhook events
export const createMockWebhookEvent = (type: string, data: any) => {
  return {
    id: `evt_${Date.now()}`,
    type,
    data: {
      object: data,
    },
    created: Math.floor(Date.now() / 1000),
  }
}
