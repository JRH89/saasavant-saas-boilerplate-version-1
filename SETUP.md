# Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Stripe account
- Firebase project
- SendGrid account

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including TypeScript types.

> **💡 Quick Preview**: You can run `npm run dev` now to preview the landing page, about page, and FAQ without configuring environment variables. However, authentication, subscriptions, and other features require the configuration below.

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_APIKEY=your_firebase_api_key
NEXT_PUBLIC_APPID=your_firebase_app_id
NEXT_PUBLIC_AUTHDOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_MESSAGINGSENDERID=your_messaging_sender_id
NEXT_PUBLIC_STORAGEBUCKET=your_project_id.appspot.com
NEXT_PUBLIC_PROJECTID=your_project_id

# Stripe Configuration
NEXT_PUBLIC_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_YEARLY_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SendGrid Configuration
NEXT_PUBLIC_SENDGRID_API_KEY=SG.xxx
NEXT_PUBLIC_SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Application Configuration
NEXT_PUBLIC_MONTHLY_PRICE=9.99
NEXT_PUBLIC_YEARLY_PRICE=99.99
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Stripe Setup

#### Create Products and Prices

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Create two products:
   - **Monthly Subscription** - $9.99/month
   - **Yearly Subscription** - $99.99/year
3. Copy the price IDs to your `.env.local`

#### Configure Webhook (Development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret (starts with `whsec_`) to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 4. Firebase Setup

#### Create Firestore Database

1. Go to Firebase Console → Firestore Database
2. Create database in production mode
3. Update security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /customers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      
      match /subscriptions/{subscriptionId} {
        allow read: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

#### Enable Authentication

1. Go to Firebase Console → Authentication
2. Enable Email/Password sign-in method

### 5. SendGrid Setup

1. Create a SendGrid account
2. Verify a sender email address
3. Create an API key with "Mail Send" permissions
4. Add to `.env.local`

### 6. Run Development Server

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Visit `http://localhost:3000`

## Testing

### Test User Flow

1. **Sign Up**: Go to `/Signup` and create an account
2. **Subscribe**: Navigate to `/Dashboard/subscribe` and select a plan
3. **Use Test Card**: `4242 4242 4242 4242` (any future date, any CVC)
4. **Verify**: Check Firestore for subscription data
5. **Manage**: Go to `/Dashboard/account` and click "Manage Subscription"

### Verify Webhook Events

Watch the terminal running `stripe listen` for webhook events:
- `checkout.session.completed`
- `customer.subscription.created`
- `invoice.payment_succeeded`

## Production Deployment

### 1. Configure Production Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to production environment

### 2. Update Environment Variables

Set all environment variables in your hosting platform (Vercel, etc.):
- Update `NEXT_PUBLIC_BASE_URL` to your production domain
- Use production Stripe keys
- Use production Firebase config

### 3. Deploy

```bash
npm run build
npm run start
```

Or deploy to Vercel:
```bash
vercel --prod
```

## Troubleshooting

### Webhook Not Working

**Issue**: Subscriptions not updating after payment

**Solution**:
1. Check webhook secret is correct
2. Verify Stripe CLI is running (dev)
3. Check webhook endpoint is accessible (prod)
4. Review Stripe Dashboard → Webhooks for errors

### TypeScript Errors

**Issue**: Module not found errors

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Firebase Permission Denied

**Issue**: Can't read/write to Firestore

**Solution**:
1. Check Firestore security rules
2. Verify user is authenticated
3. Check Firebase config in `.env.local`

### Checkout Session Fails

**Issue**: Error creating checkout session

**Solution**:
1. Verify Stripe secret key is correct
2. Check price IDs exist in Stripe
3. Review browser console for errors
4. Check server logs

## Next Steps

1. ✅ Customize branding and styling
2. ✅ Add your logo and content
3. ✅ Configure custom domain
4. ✅ Set up error monitoring (Sentry)
5. ✅ Add analytics (Google Analytics, Mixpanel)
6. ✅ Test thoroughly before launch

## Support

- **Full Documentation**: https://saasavant-docs.vercel.app - Comprehensive guides and tutorials
- **Migration Guide**: See `MIGRATION_GUIDE.md` for detailed information
- **Stripe Docs**: https://stripe.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Ready to launch!** 🚀
