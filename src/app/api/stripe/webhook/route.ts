import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const getStripeInstance = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
  });
};

const getWebhookSecret = () => process.env.STRIPE_WEBHOOK_SECRET!;

// Disable body parsing for webhook
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function buffer(readable: ReadableStream<Uint8Array>): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = readable.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  try {
    const body = await buffer(req.body!);
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      const stripe = getStripeInstance();
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        getWebhookSecret()
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);

  const customerId = session.customer as string;
  const userId = session.client_reference_id || session.metadata?.userId;

  if (!userId) {
    console.error('No userId found in checkout session');
    return;
  }

  // Create or update customer document
  const { getFirestore } = await import('firebase/firestore');
  const { doc, setDoc } = await import('firebase/firestore');
  const { initFirebase } = await import('../../../../../firebase');
  
  const db = getFirestore(initFirebase());
  const customerRef = doc(db, 'customers', userId);
  await setDoc(
    customerRef,
    {
      stripeId: customerId,
      email: session.customer_email,
      created: Date.now(),
    },
    { merge: true }
  );

  console.log(`Customer document created/updated for user: ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  const customerId = subscription.customer as string;
  
  // Find the user by Stripe customer ID
  const userId = await findUserByCustomerId(customerId);
  
  if (!userId) {
    console.error(`No user found for customer: ${customerId}`);
    return;
  }

  // Update subscription in Firestore
  const { getFirestore } = await import('firebase/firestore');
  const { doc, setDoc, updateDoc } = await import('firebase/firestore');
  const { initFirebase } = await import('../../../../../firebase');
  
  const db = getFirestore(initFirebase());
  const subscriptionRef = doc(
    db,
    'customers',
    userId,
    'subscriptions',
    subscription.id
  );

  const subscriptionData = {
    id: subscription.id,
    status: subscription.status,
    customerId: customerId,
    priceId: subscription.items.data[0]?.price.id,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    created: subscription.created,
    metadata: subscription.metadata,
    updated: Date.now(),
  };

  await setDoc(subscriptionRef, subscriptionData, { merge: true });

  // Update user premium status
  const userRef = doc(db, 'users', userId);
  const isPremium = ['active', 'trialing'].includes(subscription.status);
  
  await updateDoc(userRef, {
    isPremium,
    updatedAt: Date.now(),
  });

  console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  const customerId = subscription.customer as string;
  const userId = await findUserByCustomerId(customerId);

  if (!userId) {
    console.error(`No user found for customer: ${customerId}`);
    return;
  }

  // Update subscription status
  const { getFirestore } = await import('firebase/firestore');
  const { doc, updateDoc } = await import('firebase/firestore');
  const { initFirebase } = await import('../../../../../firebase');
  
  const db = getFirestore(initFirebase());
  const subscriptionRef = doc(
    db,
    'customers',
    userId,
    'subscriptions',
    subscription.id
  );

  await updateDoc(subscriptionRef, {
    status: 'canceled',
    updated: Date.now(),
  });

  // Update user premium status
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    isPremium: false,
    updatedAt: Date.now(),
  });

  console.log(`Subscription deleted for user: ${userId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  const customerId = invoice.customer as string;
  const userId = await findUserByCustomerId(customerId);

  if (!userId) {
    console.error(`No user found for customer: ${customerId}`);
    return;
  }

  // You can add additional logic here, such as sending a receipt email
  console.log(`Payment succeeded for user: ${userId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);

  const customerId = invoice.customer as string;
  const userId = await findUserByCustomerId(customerId);

  if (!userId) {
    console.error(`No user found for customer: ${customerId}`);
    return;
  }

  // You can add logic to notify the user about the failed payment
  console.log(`Payment failed for user: ${userId}`);
}

async function findUserByCustomerId(customerId: string): Promise<string | null> {
  try {
    const { getDocs, query, where, collection: firestoreCollection, getFirestore } = await import('firebase/firestore');
    const { initFirebase } = await import('../../../../../firebase');
    
    const db = getFirestore(initFirebase());
    const customersRef = firestoreCollection(db, 'customers');
    const q = query(customersRef, where('stripeId', '==', customerId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].id;
  } catch (error) {
    console.error('Error finding user by customer ID:', error);
    return null;
  }
}
