import { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { CheckoutResponse, PortalResponse } from '@/types/api';

/**
 * Creates a Stripe checkout session and returns the checkout URL
 * This replaces the Firebase extension's checkout session creation
 */
export const createCheckoutSession = async (
  app: FirebaseApp,
  priceId: string
): Promise<string> => {
  const auth = getAuth(app);
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not authenticated');
  }

  console.log('Creating checkout session for user:', user.uid);

  try {
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId: user.uid,
        customerEmail: user.email,
        successUrl: `${window.location.origin}/Dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/Dashboard/subscribe`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const data: CheckoutResponse = await response.json();
    console.log('Checkout session created:', data.sessionId);

    return data.url;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
};

/**
 * Creates a Stripe billing portal session and returns the portal URL
 * This replaces the Firebase extension's portal link creation
 */
export const createPortalSession = async (
  stripeCustomerId: string,
  returnUrl?: string
): Promise<string> => {
  if (!stripeCustomerId) {
    throw new Error('Stripe customer ID is required');
  }

  console.log('Creating portal session for customer:', stripeCustomerId);

  try {
    const response = await fetch('/api/stripe/create-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId: stripeCustomerId,
        returnUrl: returnUrl || `${window.location.origin}/Dashboard/account`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create portal session');
    }

    const data: PortalResponse = await response.json();
    console.log('Portal session created');

    return data.url;
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    throw new Error(`Failed to create portal session: ${error.message}`);
  }
};
