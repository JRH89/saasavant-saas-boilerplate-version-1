import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PortalSessionParams } from '@/types/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, returnUrl } = body as PortalSessionParams;

    // Validate required fields
    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing required field: customerId' },
        { status: 400 }
      );
    }

    // Use environment variable or default to localhost if empty or undefined
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const finalReturnUrl = returnUrl?.trim() 
      ? returnUrl 
      : `${baseUrl}/Dashboard/account`;

    console.log('Creating billing portal session for customer:', customerId);
    console.log('Return URL:', finalReturnUrl);

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: finalReturnUrl,
    });

    console.log('Billing portal session created:', session.id);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session', details: error.message },
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
