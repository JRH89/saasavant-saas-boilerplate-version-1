// Stripe checkout session parameters
export interface CheckoutSessionParams {
  priceId: string;
  userId: string;
  customerEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

// Stripe billing portal session parameters
export interface PortalSessionParams {
  customerId: string;
  returnUrl?: string;
}

// Subscription data stored in Firestore
export interface SubscriptionData {
  id: string;
  status: string;
  customerId: string;
  priceId: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  created: number;
  metadata?: Record<string, any>;
  updated: number;
}

// Customer data stored in Firestore
export interface CustomerData {
  stripeId: string;
  email: string;
  created: number;
}
