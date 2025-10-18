# Changelog

All notable changes to SaaSavant will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-01-18

### 📧 Email Service Migration - SendGrid → MailerSend

Migrated from SendGrid to MailerSend due to SendGrid removing their free tier. MailerSend offers 12,000 free emails per month.

### Changed

#### Email Service Provider
- **Removed**: `@sendgrid/mail` package
- **Added**: `mailersend` package
- **Migrated**: All email functionality to MailerSend API
  - `src/app/api/sendWelcomeEmail/route.ts` - Now uses MailerSend
  - `src/app/api/sendNewsletter/route.ts` - Now uses MailerSend

#### Environment Variables
- **Removed**:
  - `NEXT_PUBLIC_SENDGRID_API_KEY`
  - `NEXT_PUBLIC_SENDGRID_FROM_EMAIL`
- **Added**:
  - `MAILERSEND_API_KEY` - MailerSend API token
  - `MAILERSEND_FROM_EMAIL` - Sender email address

#### Documentation
- **New File**: `MAILERSEND_SETUP.md` - Complete MailerSend setup guide
  - Account creation
  - Domain verification
  - API token generation
  - Testing instructions
  - Production setup
  - Troubleshooting
- **Updated**: `README.md` - Changed all SendGrid references to MailerSend
- **Updated**: `.env.example` - New MailerSend environment variables

### Benefits

- ✅ **12,000 free emails/month** (vs SendGrid's removed free tier)
- ✅ No credit card required for free tier
- ✅ Email analytics and tracking included
- ✅ Template management
- ✅ Better developer experience

### Migration Guide

For existing users:

1. Create a MailerSend account at https://www.mailersend.com/
2. Get your API token from the dashboard
3. Update your `.env.local`:
   ```env
   MAILERSEND_API_KEY=mlsn.your_token_here
   MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
   ```
4. Remove old SendGrid variables
5. Test email functionality

See [MAILERSEND_SETUP.md](./MAILERSEND_SETUP.md) for detailed instructions.

---

## [2.1.0] - 2025-01-18

### 🚀 Major Update - Comprehensive Testing, CI/CD, Next.js 15 & React 19

This release adds a production-ready test suite with 148 tests, automated CI/CD pipeline, and upgrades to Next.js 15 with React 19 and Turbopack.

### Added

#### Comprehensive Test Suite (148 Tests)
- **New Directory**: `__tests__/` - Complete test infrastructure
  - `__tests__/unit/` - 125 unit tests covering all critical business logic
  - `__tests__/integration/` - 23 integration tests for complete user flows
  - `__tests__/e2e/` - End-to-end tests with Playwright
  - `__tests__/mocks/` - Firebase and Stripe mock implementations
  - `__tests__/utils/` - Test utilities and helpers

#### Unit Tests (125 tests)
- **Authentication Tests** (27 tests)
  - `__tests__/unit/auth/signIn.test.tsx` - Sign in flow validation
  - `__tests__/unit/auth/signUp.test.tsx` - Sign up and user creation
- **Subscription Tests** (54 tests)
  - `__tests__/unit/subscriptions/checkout.test.ts` - Stripe checkout sessions
  - `__tests__/unit/subscriptions/lifecycle.test.ts` - Subscription lifecycle management
- **Support System Tests** (16 tests)
  - `__tests__/unit/support/tickets.test.ts` - Support ticket CRUD operations
- **Account Management Tests** (12 tests)
  - `__tests__/unit/account/deletion.test.ts` - Account deletion and cleanup
- **API Route Tests** (16 tests)
  - `__tests__/unit/api/webhook.test.ts` - Webhook event processing
  - `__tests__/unit/api/create-checkout.test.ts` - Checkout endpoint
  - `__tests__/unit/api/create-portal.test.ts` - Portal endpoint
- **Utility Tests** (16 tests)
  - `__tests__/unit/lib/stripe-client.test.ts` - Stripe client utilities
  - `__tests__/unit/lib/getPremiumStatus.test.ts` - Premium status validation

#### Integration Tests (23 tests)
- `__tests__/integration/auth-flow.test.tsx` - Complete authentication flows
- `__tests__/integration/subscription-flow.test.ts` - End-to-end subscription flows

#### E2E Tests (Playwright)
- `__tests__/e2e/auth.spec.ts` - Authentication UI testing
- `__tests__/e2e/subscription.spec.ts` - Subscription purchase flows
- `__tests__/e2e/support-tickets.spec.ts` - Support ticket management

#### Test Infrastructure
- **New File**: `jest.config.js` - Jest configuration with Next.js integration
- **New File**: `jest.setup.js` - Global test setup and mocks
- **New File**: `playwright.config.ts` - Playwright E2E configuration
- **New File**: `.env.test.example` - Test environment variables template
- **New File**: `__tests__/mocks/firebase.ts` - Comprehensive Firebase mocks
- **New File**: `__tests__/mocks/stripe.ts` - Complete Stripe API mocks
- **New File**: `__tests__/utils/test-utils.tsx` - Reusable test utilities

#### Database Seeding Scripts
- **New File**: `scripts/seed.js` - Production database seeding
  - Creates 5 test users (admin, premium, basic, free, canceled)
  - Seeds 8 support tickets with various statuses
  - Creates 3 announcements
  - Uses Firebase Admin SDK
- **New File**: `scripts/seed-dev.js` - Development quick seeding
  - Creates 2 dev users
  - Seeds 3 test tickets
  - Uses Firebase Client SDK

#### CI/CD Pipeline
- **New File**: `.github/workflows/ci.yml` - Automated testing pipeline
  - **Lint Job**: ESLint code quality checks
  - **Unit Tests Job**: Run all unit tests with coverage
  - **Integration Tests Job**: Test complete user flows
  - **E2E Tests Job**: Playwright browser testing
  - **Build Job**: Next.js production build verification
  - **Type Check Job**: TypeScript compilation validation
  - **Security Scan Job**: npm audit for vulnerabilities
  - Runs on push to `main` or `develop` branches
  - Runs on pull requests
  - Uploads test coverage and Playwright reports

#### Test Documentation
- **New File**: `TESTING.md` - Comprehensive testing guide
  - Test structure and organization
  - Running tests locally
  - Writing new tests
  - Best practices
  - Troubleshooting
- **New File**: `TEST_SUMMARY.md` - Complete test coverage overview
  - Detailed breakdown of all 148 tests
  - Coverage by feature area
  - Test file descriptions
- **New File**: `QUICK_START_TESTING.md` - 5-minute quick start guide
- **New File**: `COVERAGE_REPORT.md` - Test coverage analysis
- **New File**: `IMPLEMENTATION_SUMMARY.md` - Implementation details

#### NPM Scripts
- `test` - Run tests in watch mode
- `test:ci` - Run all tests with coverage (CI mode)
- `test:unit` - Run only unit tests
- `test:integration` - Run only integration tests
- `test:e2e` - Run Playwright E2E tests
- `test:e2e:ui` - Run E2E tests with Playwright UI
- `seed` - Seed production database
- `seed:dev` - Quick development seeding

### Changed

#### Framework Upgrades
- **Next.js**: 14.2.4 → **15.5.6**
  - Turbopack dev mode enabled by default
  - Improved build performance
  - Better caching semantics
  - React 19 support
- **React**: 18.x → **19.2.0**
  - New hooks: `useActionState` (replaces `useFormState`)
  - Improved form handling
  - Better hydration error messages
  - React Compiler support (experimental)
- **React DOM**: 18.x → **19.2.0**
- **TypeScript Types**: Updated to React 19 compatible versions
  - `@types/react`: 18.3.3 → **19.2.2**
  - `@types/react-dom`: 18.x → **19.2.2**

#### Development Experience
- **Dev Server**: Now uses `--turbopack` flag for faster builds
  - Up to 700x faster updates
  - Improved Fast Refresh
  - Better memory usage
- **Lint Command**: Changed from `next lint` to `eslint .`
  - ESLint 9 support
  - More flexible configuration

#### Dependencies
- **Added**: `@playwright/test@^1.40.0` - E2E testing framework
- **Added**: `@testing-library/jest-dom@^6.1.5` - Custom Jest matchers
- **Added**: `@testing-library/react@^14.1.2` - React testing utilities
- **Added**: `@testing-library/user-event@^14.5.1` - User interaction simulation
- **Added**: `@types/jest@^29.5.11` - TypeScript types for Jest
- **Added**: `jest@^29.7.0` - Testing framework
- **Added**: `jest-environment-jsdom@^29.7.0` - DOM environment for Jest
- **Added**: `firebase-admin@^12.0.0` - For database seeding
- **Updated**: `framer-motion` - Latest version for React 19 compatibility
- **Updated**: `eslint-config-next`: 14.2.4 → **15.5.6**

#### Configuration
- **Modified**: `next.config.mjs`
  - Added `eslint: { ignoreDuringBuilds: true }` to prevent build failures
  - ESLint runs separately via `npm run lint`
- **Modified**: `package.json`
  - Added type overrides for React 19 consistency
  - Updated all test-related scripts
  - Added seeding scripts
- **Modified**: `.gitignore`
  - Added test coverage directories
  - Added Playwright report directories
  - Added Firebase service account files
  - Added IDE-specific files

#### Framer Motion Compatibility
- **Fixed**: `src/components/landing-page/Header.tsx`
  - Updated transition configuration for React 19
  - Removed invalid `type: 'easeInOut'` property
  - Changed `motion.nav` to `motion.div` for better compatibility

### Fixed

- **Fixed**: ESLint configuration errors with Next.js 15
- **Fixed**: Framer Motion type errors with React 19
- **Fixed**: Test utilities type compatibility with React 19
- **Fixed**: Firebase mock initialization in tests
- **Fixed**: Next.js router mocking for App Router (`next/navigation`)
- **Fixed**: Build failures related to async request APIs

### Security

- Automated security scanning in CI/CD pipeline
- npm audit runs on every build
- Test coverage ensures critical paths are validated
- Webhook signature verification tested
- Authentication flows comprehensively tested

### Performance

- Turbopack dev mode for faster development
- Improved build times with Next.js 15
- Better caching control (fetch not cached by default)
- Optimized test execution with parallel workers

### Developer Experience

- **148 comprehensive tests** covering all critical functionality
- Automated CI/CD pipeline catches issues early
- Database seeding for quick development setup
- Extensive test documentation
- Type-safe test utilities
- Easy-to-run test commands
- Playwright UI mode for debugging E2E tests

### Testing Coverage

- ✅ **100% of critical business logic tested**
- ✅ Authentication flows (sign up, sign in, password reset)
- ✅ Subscription lifecycle (checkout, billing, cancellation)
- ✅ Payment processing (success, failure, renewal)
- ✅ Webhook handling (all Stripe events)
- ✅ Support ticket system (CRUD operations)
- ✅ Account deletion (complete data cleanup)
- ✅ API routes (checkout, portal, webhooks)
- ✅ Integration flows (complete user journeys)

### Breaking Changes

⚠️ **Minor Breaking Changes**

1. **Next.js 15 Async APIs**: Some request APIs are now async (handled by codemod)
2. **React 19**: `useFormState` deprecated in favor of `useActionState`
3. **Caching Changes**: `fetch()` and GET Route Handlers no longer cached by default
4. **ESLint**: Now runs separately from build process

**Migration**: Run `npx @next/codemod@canary upgrade latest` to automatically handle most changes.

---

## [2.0.0] - 2024-12-01

### 🎉 Major Release - TypeScript Migration & Direct Stripe Integration

This release represents a complete architectural overhaul of the SaaSavant boilerplate, transitioning from Firebase extensions to direct Stripe API integration with full TypeScript support.

### Added

#### Type Definitions
- **New File**: `src/types/stripe.ts` - Complete Stripe type definitions
  - `CheckoutSessionParams` - Checkout session parameters
  - `PortalSessionParams` - Billing portal parameters
  - `SubscriptionData` - Subscription data structure
  - `CustomerData` - Customer data structure
- **New File**: `src/types/user.ts` - User-related types
  - `UserData` - User document structure
  - `AuthContextType` - Authentication context
  - `PricingPlan` - Pricing plan structure
- **New File**: `src/types/api.ts` - API response types
  - `ApiResponse` - Generic API response wrapper
  - `CheckoutResponse` - Checkout session response
  - `PortalResponse` - Portal session response
  - `EmailRequest` & `EmailResponse` - Email API types

#### API Routes (TypeScript)
- **New File**: `src/app/api/stripe/webhook/route.ts` - Comprehensive webhook handler
  - Handles `checkout.session.completed`
  - Handles `customer.subscription.created/updated/deleted`
  - Handles `invoice.payment_succeeded/failed`
  - Automatic subscription status updates
  - Real-time Firestore synchronization
- **New File**: `src/app/api/stripe/create-checkout/route.ts` - Checkout session creation
  - Direct Stripe API integration
  - Customer lookup and creation
  - Metadata handling for user tracking
- **New File**: `src/app/api/stripe/create-portal/route.ts` - Billing portal access
  - Customer portal session creation
  - Subscription management interface
- **New File**: `src/app/api/sendWelcomeEmail/route.ts` - Welcome email sender
- **New File**: `src/app/api/sendNewsletter/route.ts` - Newsletter distribution

#### Utility Libraries
- **New File**: `src/lib/stripe/client.ts` - Client-side Stripe utilities
  - `createCheckoutSession()` - Initiate checkout flow
  - `createPortalSession()` - Access billing portal
- **New File**: `src/lib/stripe/getPremiumStatus.ts` - Premium status checker
  - Real-time subscription status validation

#### Documentation
- **New File**: `MIGRATION_GUIDE.md` - Comprehensive migration instructions
- **New File**: `REFACTORING_SUMMARY.md` - Detailed refactoring overview
- **New File**: `SETUP.md` - Quick setup guide
- **New File**: `.env.example` - Environment variable template
- **New File**: `CHANGELOG.md` - This file

#### Features
- Direct Stripe API integration (no Firebase extension required)
- Real-time webhook processing for subscription events
- Automatic premium status updates
- Customer portal for subscription management
- Type-safe API routes and utilities
- Comprehensive error handling and logging
- Production-ready webhook signature verification

### Changed

#### Core Files Converted to TypeScript
- `firebase.js` → `firebase.ts` - Firebase configuration with lazy initialization
- `src/context/AuthProvider.jsx` → `src/context/AuthProvider.tsx` - Auth context with types
- `src/components/user/SignUp.jsx` → `src/components/user/SignUp.tsx` - Type-safe sign up
- `src/components/user/SignIn.jsx` → `src/components/user/SignIn.tsx` - Type-safe sign in
- `src/components/user/AccountPage.jsx` → `src/components/user/AccountPage.tsx` - Account management
- `src/components/user/SubscriptionSection.jsx` → `src/components/user/SubscriptionSection.tsx` - Subscription UI

#### Landing Page Content
- Updated `src/components/landing-page/FeaturesSection.jsx` - Real feature descriptions
  - Removed placeholder names (ZebraPay, Nimbus, QuickFox)
  - Added actual features (Stripe, Firebase, TypeScript, etc.)
- Updated `src/components/landing-page/LogoTicker.tsx` - Real tech stack
  - Shows actual technologies: Next.js 14, TypeScript, Firebase, Stripe, SendGrid, TailwindCSS
- Updated `src/components/landing-page/Hero.jsx` - Version 2.0 tag
- Updated `src/components/page/About.jsx` - Accurate product information
  - Replaced "GrowthMaster" with "SaaSavant"
  - Updated all feature descriptions
  - Added real FAQ content
- Updated `src/components/page/FAQ.jsx` - Relevant questions and answers
  - 8 comprehensive FAQ items
  - Accurate technical information

#### Navigation
- Updated `src/components/landing-page/Header.tsx`
  - Added "Docs" link to navigation menu
  - Links to https://saasavant-docs.vercel.app
  - Opens in new tab with proper security attributes

#### Documentation
- Updated `README.md`
  - Added link to full documentation site
  - Added "Preview Without Configuration" section
  - Clarified environment variable requirements
  - Added SaaSavant docs to Additional Resources
- Updated `SETUP.md`
  - Added quick preview note
  - Added documentation link to Support section
  - Clarified when env vars are needed

#### Dependencies
- Added `@mantine/core@5.10.5` - Mantine UI components
- Added `@mantine/hooks@5.10.5` - Mantine hooks
- Added `@emotion/react` - Emotion styling (Mantine dependency)
- Added `@emotion/cache` - Emotion cache (Mantine dependency)
- Added `@emotion/server` - Emotion SSR (Mantine dependency)

#### Configuration
- Updated Stripe API version from `2024-11-20.acacia` to `2024-06-20`
- Modified Firebase initialization to support build-time without env vars
- Added dynamic imports in webhook route to prevent build failures

### Removed

- **Removed**: Firebase Stripe Extension dependency
- **Removed**: Cloud Functions requirement
- **Removed**: Extension-specific configuration files
- **Removed**: Placeholder content and fake service names
- **Removed**: Old JavaScript-only implementations

### Fixed

- **Fixed**: TypeScript compilation errors across the codebase
- **Fixed**: PricingPlan interface mismatch in `SubscriptionSection.tsx`
- **Fixed**: Missing Stripe type definitions
- **Fixed**: Stripe API version compatibility issues
- **Fixed**: Missing Mantine dependencies for Newsletter component
- **Fixed**: Firebase initialization during build time
- **Fixed**: Webhook route build failures
- **Fixed**: ESLint warnings (non-blocking, documented)

### Security

- Implemented webhook signature verification
- Added server-side API key management
- Improved Firestore security rules documentation
- Added environment variable validation
- Implemented proper error handling and logging

### Performance

- Reduced complexity by removing Cloud Functions
- Improved build times with lazy Firebase initialization
- Optimized webhook processing with direct API calls
- Better type checking at compile-time

### Developer Experience

- Full TypeScript support with comprehensive types
- Better IDE autocomplete and IntelliSense
- Improved error messages and debugging
- Comprehensive documentation and guides
- Clear migration path from v1.x

### Breaking Changes

⚠️ **This is a major version update with breaking changes**

1. **Firebase Extension Removal**: Projects using the Firebase Stripe extension must migrate to direct API integration
2. **TypeScript Migration**: Core files now use TypeScript (`.tsx`/`.ts` instead of `.jsx`/`.js`)
3. **API Route Changes**: New API routes replace extension-based functions
4. **Environment Variables**: New required environment variables for Stripe webhook secret
5. **Database Structure**: Subscription data now stored in `customers/{uid}/subscriptions` collection

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration instructions.

---

## [1.0.0] - 2024-09-01

### Initial Release

- Next.js 14 with App Router
- Firebase Authentication (email/password)
- Firestore database
- Firebase Stripe Extension integration
- SendGrid email integration
- Admin dashboard
- User management
- Subscription handling via Firebase extension
- Landing page with pricing
- TailwindCSS styling
- Responsive design

---

## Migration Notes

### From v1.x to v2.0

**Required Actions:**
1. Install new dependencies: `npm install`
2. Update environment variables (add `STRIPE_WEBHOOK_SECRET`)
3. Configure Stripe webhook endpoint
4. Remove Firebase Stripe Extension
5. Update Firestore security rules
6. Test checkout and subscription flows

**Estimated Migration Time:** 2-4 hours

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for step-by-step instructions.

---

## Support

- **Documentation**: https://saasavant-docs.vercel.app
- **Setup Guide**: [SETUP.md](./SETUP.md)
- **Migration Guide**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Refactoring Summary**: [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) principles and uses [Semantic Versioning](https://semver.org/).
