import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CheckoutSessionParams } from '@/types/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceId, userId, customerEmail, successUrl, cancelUrl } = body as CheckoutSessionParams;

    // Validate required fields
    if (!priceId || !userId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, userId, or customerEmail' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    let customerId: string | undefined;
    
    try {
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log(`Existing customer found: ${customerId}`);
      }
    } catch (error) {
      console.error('Error checking for existing customer:', error);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      client_reference_id: userId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/Dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/Dashboard/subscribe`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
    });

    console.log(`Checkout session created: ${session.id}`);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
