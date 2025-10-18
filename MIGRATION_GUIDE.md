# SaaSavant Refactoring & Migration Guide

## Overview

This guide documents the comprehensive refactoring of the SaaSavant boilerplate from a Firebase Extension-based Stripe integration to a direct Stripe API implementation with full TypeScript support.

## Major Changes

### 1. **Removed Firebase Stripe Extension Dependency**

**Before:**
- Relied on `ext-firestore-stripe-payments` Firebase extension
- Required Firebase Cloud Functions
- Checkout sessions created via Firestore listeners
- Portal links generated via Firebase Functions

**After:**
- Direct Stripe API integration via Next.js API routes
- No Firebase Cloud Functions required
- Checkout sessions created directly via `/api/stripe/create-checkout`
- Portal links generated via `/api/stripe/create-portal`
- Webhook handler at `/api/stripe/webhook` for real-time subscription updates

### 2. **Full TypeScript Migration**

**Converted Files:**
- ✅ `firebase.js` → `firebase.ts`
- ✅ `src/context/AuthProvider.jsx` → `src/context/AuthProvider.tsx`
- ✅ All API routes (`.js` → `.ts`)
- ✅ All user components (`.jsx` → `.tsx`)
- ✅ Payment components refactored with TypeScript

**New Type Definitions:**
- `src/types/stripe.ts` - Stripe-related types
- `src/types/user.ts` - User and auth types
- `src/types/api.ts` - API request/response types

### 3. **New Architecture**

```
src/
├── types/                    # TypeScript type definitions
│   ├── stripe.ts
│   ├── user.ts
│   └── api.ts
├── lib/                      # Utility libraries
│   └── stripe/
│       ├── client.ts         # Client-side Stripe functions
│       └── getPremiumStatus.ts
├── app/
│   └── api/
│       └── stripe/
│           ├── webhook/route.ts          # NEW: Stripe webhook handler
│           ├── create-checkout/route.ts  # NEW: Direct checkout creation
│           └── create-portal/route.ts    # Refactored portal creation
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Update Environment Variables

Update your `.env.local` file:

```env
# Firebase (unchanged)
NEXT_PUBLIC_APIKEY=your_firebase_api_key
NEXT_PUBLIC_APPID=your_firebase_app_id
NEXT_PUBLIC_AUTHDOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_MESSAGINGSENDERID=your_firebase_messaging_sender_id
NEXT_PUBLIC_STORAGEBUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_PROJECTID=your_firebase_project_id

# Stripe
NEXT_PUBLIC_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_YEARLY_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  # IMPORTANT: Get from Stripe Dashboard

# Sendgrid (unchanged)
NEXT_PUBLIC_SENDGRID_API_KEY=your_sendgrid_api_key
NEXT_PUBLIC_SENDGRID_FROM_EMAIL=your_verified_sender_email

# General
NEXT_PUBLIC_MONTHLY_PRICE=9.99
NEXT_PUBLIC_YEARLY_PRICE=99.99
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Configure Stripe Webhook

**Critical Step:** You must configure a Stripe webhook to handle subscription events.

#### For Development (Local Testing):

1. Install Stripe CLI:
   ```bash
   stripe login
   ```

2. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

#### For Production:

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add to your production environment variables

### 4. Remove Firebase Extension (If Previously Installed)

If you had the Firebase Stripe extension installed:

1. Go to Firebase Console → Extensions
2. Uninstall `firestore-stripe-payments`
3. Remove any Cloud Functions related to the extension

### 5. Update Firestore Security Rules

Ensure your Firestore rules allow the webhook to write subscription data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Customers collection
    match /customers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Subscriptions subcollection
      match /subscriptions/{subscriptionId} {
        allow read: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Key API Changes

### Creating Checkout Sessions

**Before (Firebase Extension):**
```typescript
import { getCheckoutUrl } from "../payments/account/StripePayments"

const url = await getCheckoutUrl(app, priceId)
// Waited for Firestore listener to populate URL
```

**After (Direct API):**
```typescript
import { createCheckoutSession } from '@/lib/stripe/client'

const url = await createCheckoutSession(app, priceId)
// Direct API call, immediate response
```

### Creating Portal Sessions

**Before (Firebase Extension):**
```typescript
import { getPortalUrl } from "../payments/account/StripePayments"

const url = await getPortalUrl(app)
// Called Firebase Function
```

**After (Direct API):**
```typescript
import { createPortalSession } from '@/lib/stripe/client'

const url = await createPortalSession(stripeCustomerId)
// Direct API call
```

### Getting Premium Status

**Before:**
```typescript
import { getPremiumStatus } from "../payments/account/GetPremiumStatus"

const isPremium = await getPremiumStatus(app)
```

**After:**
```typescript
import { getPremiumStatus } from '@/lib/stripe/getPremiumStatus'

const isPremium = await getPremiumStatus(app)
// Same API, improved TypeScript support
```

## Webhook Event Handling

The new webhook handler (`/api/stripe/webhook/route.ts`) automatically:

1. **Verifies webhook signatures** for security
2. **Creates customer documents** when checkout completes
3. **Updates subscription status** in Firestore
4. **Updates user premium status** automatically
5. **Handles subscription lifecycle** (created, updated, deleted)
6. **Processes payment events** (succeeded, failed)

## Database Structure

### Firestore Collections

```
users/
  {userId}/
    - email: string
    - isPremium: boolean
    - isSubscribed: boolean
    - isAdmin: boolean
    - createdAt: number
    - updatedAt: number

customers/
  {userId}/
    - stripeId: string (Stripe Customer ID)
    - email: string
    - created: number
    
    subscriptions/
      {subscriptionId}/
        - id: string
        - status: string
        - customerId: string
        - priceId: string
        - currentPeriodStart: number
        - currentPeriodEnd: number
        - cancelAtPeriodEnd: boolean
        - created: number
        - updated: number
```

## Testing

### Test Checkout Flow

1. Start development server:
   ```bash
   npm run dev
   ```

2. Start Stripe webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Navigate to `/Dashboard/subscribe`
4. Select a plan
5. Use Stripe test card: `4242 4242 4242 4242`
6. Verify webhook events in terminal
7. Check Firestore for updated subscription data

### Test Cards

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0025 0000 3155

## Benefits of This Refactoring

1. ✅ **No Firebase Cloud Functions required** - Reduced complexity and cost
2. ✅ **Full TypeScript support** - Better type safety and developer experience
3. ✅ **Direct Stripe API control** - More flexibility and customization
4. ✅ **Improved error handling** - Better user feedback
5. ✅ **Real-time webhook processing** - Instant subscription updates
6. ✅ **Better security** - Webhook signature verification
7. ✅ **Easier debugging** - All code in your codebase
8. ✅ **Production-ready** - Follows Stripe best practices

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook secret is correct
2. Verify Stripe CLI is running (development)
3. Check webhook endpoint is publicly accessible (production)
4. Review Stripe Dashboard → Developers → Webhooks for errors

### Subscription Not Updating

1. Check webhook is receiving events
2. Verify Firestore security rules allow writes
3. Check browser console for errors
4. Review server logs for webhook processing errors

### TypeScript Errors

1. Run `npm install` to ensure all types are installed
2. Check `tsconfig.json` has correct path aliases
3. Restart TypeScript server in your IDE

## Migration Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Update environment variables
- [ ] Configure Stripe webhook (development)
- [ ] Test checkout flow locally
- [ ] Test subscription management
- [ ] Remove old Firebase extension
- [ ] Update Firestore security rules
- [ ] Configure production webhook
- [ ] Deploy to production
- [ ] Test production checkout flow
- [ ] Monitor webhook events in Stripe Dashboard

## Support

For issues or questions:
1. Check this migration guide
2. Review the code comments in new files
3. Check Stripe documentation: https://stripe.com/docs
4. Review Firebase documentation: https://firebase.google.com/docs

---

**Last Updated:** October 2025
**Version:** 2.0.0 (TypeScript + Direct Stripe Integration)
