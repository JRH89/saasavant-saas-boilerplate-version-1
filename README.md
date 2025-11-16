# Welcome to SaaSavant v2.2.1

## Overview

SaaSavant is a **production-ready, fully TypeScript** SaaS boilerplate designed to accelerate the development of Software as a Service applications. It features:

- **Direct Stripe API Integration** - No Firebase extensions required
- **Full TypeScript Support** - Type-safe throughout
- **Comprehensive Test Suite** - 148 tests covering all critical paths
- **Automated CI/CD** - GitHub Actions pipeline
- **Webhook-Based Subscriptions** - Real-time updates
- **Firebase Authentication** - Secure user management
- **Firestore Database** - Scalable data storage
- **MailerSend Email** - Transactional emails (12,000/month free)
- **Next.js 15** - Latest framework with Turbopack
- **React 19** - Latest React with improved performance

## What's New in v2.1

### Comprehensive Testing & CI/CD
- **148 Tests**: Unit, integration, and E2E tests covering all critical functionality
- **Automated CI/CD**: GitHub Actions pipeline with 7 jobs
- **Database Seeding**: Quick setup with test data
- **Test Documentation**: Complete guides for writing and running tests

### Framework Upgrades
- **Next.js 15.5.6**: Latest version with Turbopack dev mode
- **React 19.2.0**: Latest React with new hooks and better performance
- **Improved DX**: Faster builds, better error messages, enhanced tooling

### What's New in v2.0

### Major Refactoring

This version includes a **comprehensive refactoring** that eliminates the Firebase Stripe extension dependency and introduces full TypeScript support:

- **Removed Firebase Extension**: Direct Stripe API integration via Next.js API routes
- **TypeScript Migration**: 100% TypeScript for all critical paths
- **Webhook Handler**: Custom webhook implementation for subscription management
- **Improved Architecture**: Better code organization with `/lib` and `/types` directories
- **Enhanced Security**: Webhook signature verification and proper error handling

### Key Benefits

1. **No Cloud Functions Required** - Reduced complexity and cost
2. **Full Control** - Direct access to Stripe API
3. **Type Safety** - Catch errors at compile-time
4. **Better DX** - Improved developer experience with TypeScript
5. **Production Ready** - Comprehensive webhook handling

## Documentation

- **[Full Documentation](https://saasavant-docs.vercel.app)** - Complete documentation site
- **[Quick Setup Guide](./SETUP.md)** - Get started in minutes
- **[Testing Guide](./TESTING.md)** - Comprehensive testing documentation
- **[Quick Start Testing](./QUICK_START_TESTING.md)** - 5-minute testing guide
- **[Migration Guide](./MIGRATION_GUIDE.md)** - Detailed migration instructions
- **[Refactoring Summary](./REFACTORING_SUMMARY.md)** - Complete overview of changes
- **[Changelog](./CHANGELOG.md)** - Version history and changes

## Getting Started

For complete setup instructions, please visit our comprehensive documentation at:

**[https://saasavant-docs.vercel.app/](https://saasavant-docs.vercel.app/)**

The documentation includes:
- Step-by-step setup guide
- Environment configuration
- Firebase setup
- Stripe integration
- MailerSend configuration
- Deployment instructions

## Tech Stack

- **Framework**: Next.js 15.5.6 (App Router + Turbopack)
- **Language**: TypeScript
- **UI Library**: React 19.2.0
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Payments**: Stripe (Direct API)
- **Email**: MailerSend
- **Styling**: Tailwind CSS
- **UI Components**: Lucide Icons, Framer Motion
- **Testing**: Jest, React Testing Library, Playwright
- **CI/CD**: GitHub Actions

## Testing

SaaSavant includes a comprehensive test suite with **148 tests** covering all critical functionality:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:ci

# Run specific test suites
npm run test:unit          # Unit tests (125 tests)
npm run test:integration   # Integration tests (23 tests)
npm run test:e2e          # E2E tests (Playwright)

# Seed test data
npm run seed:dev          # Quick dev seeding
npm run seed              # Full production seeding
```

### What's Tested
- ✅ Authentication flows (sign up, sign in, password reset)
- ✅ Subscription lifecycle (checkout, billing, cancellation)
- ✅ Payment processing (success, failure, renewal)
- ✅ Webhook handling (all Stripe events)
- ✅ Support ticket system (CRUD operations)
- ✅ Account deletion (complete data cleanup)
- ✅ API routes (checkout, portal, webhooks)
- ✅ Integration flows (complete user journeys)

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

## Project Structure

```
src/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   └── stripe/
│   │       ├── webhook/      # Stripe webhook handler
│   │       ├── create-checkout/
│   │       └── create-portal/
│   └── [pages]/              # Application pages
├── components/               # React components
│   ├── user/                 # User-related components
│   ├── payments/             # Payment components
│   └── landing-page/         # Landing page components
├── context/                  # React context providers
├── lib/                      # Utility libraries
│   └── stripe/               # Stripe utilities
└── types/                    # TypeScript type definitions

__tests__/                    # Test suite
├── unit/                     # Unit tests (125 tests)
│   ├── auth/                 # Authentication tests
│   ├── subscriptions/        # Subscription tests
│   ├── support/              # Support ticket tests
│   ├── account/              # Account management tests
│   ├── api/                  # API route tests
│   └── lib/                  # Utility tests
├── integration/              # Integration tests (23 tests)
├── e2e/                      # E2E tests (Playwright)
├── mocks/                    # Firebase & Stripe mocks
└── utils/                    # Test utilities

scripts/                      # Utility scripts
├── seed.js                   # Production database seeding
└── seed-dev.js               # Development seeding
```

## Environment Variables

See `.env.example` for all required environment variables. Key variables:

- **Firebase**: API keys and project configuration
- **Stripe**: API keys, price IDs, and webhook secret
- **MailerSend**: API key and sender email
- **App**: Base URL and pricing

## Testing

### Test Cards (Stripe)

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiration date and any 3-digit CVC.

## Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

### Other Platforms

```bash
npm run build
npm run start
```

**Important**: Configure your production webhook in Stripe Dashboard and update `STRIPE_WEBHOOK_SECRET`.

## Security

- Webhook signature verification
- Server-side API key management
- Firestore security rules
- Environment variable validation
- Input sanitization

## Additional Resources

- [SaaSavant Documentation](https://saasavant-docs.vercel.app) - Comprehensive guides and tutorials
- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

# LICENSE

SaaSavant Boilerplate License Agreement

This License Agreement ("Agreement") is entered into between SaaSavant, represented by Hooker Hill Studios, whose contact information is hookerhillstudios@gmail.com, and you, the user ("Licensee"), regarding the use of the SaaSavant coding boilerplate (the "Product"). By downloading, accessing, or using the Product, Licensee agrees to be bound by the terms and conditions of this Agreement.

1. Grant of License
1.1 Individual License
Subject to the terms and conditions of this Agreement, SaaSavant grants Licensee a non-exclusive, non-transferable, and non-sublicensable Individual License to use the SaaSavant coding boilerplate for the following purposes:

Create unlimited projects.
Build and develop applications or websites for personal or commercial use.

2. Restrictions
Licensee shall not:

Modify, adapt, reverse engineer, decompile, disassemble, or create derivative works based on the SaaSavant boilerplate.
Remove, alter, or obscure any copyright, trademark, or other proprietary notices from the SaaSavant boilerplate.
Use the SaaSavant boilerplate in any way that violates applicable laws, regulations, or third-party rights.
Sub-license, rent, lease, or transfer the SaaSavant boilerplate or any rights granted under this Agreement.

3. Ownership and Intellectual Property
SaaSavant retains all ownership and intellectual property rights in and to the SaaSavant boilerplate. This Agreement does not grant Licensee any ownership rights in the SaaSavant boilerplate.

4. Warranty and Disclaimer
THE SAASAVANT BOILERPLATE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NONINFRINGEMENT.

5. Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SAASAVANT SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO THE USE OR INABILITY TO USE THE SAASAVANT BOILERPLATE, EVEN IF SAASAVANT HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

6. Governing Law and Jurisdiction
This Agreement shall be governed by and construed in accordance with the laws of the United States of America, without regard to its conflict of law principles. Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts located in the United States of America.

7. Entire Agreement
This Agreement constitutes the entire agreement between Licensee and SaaSavant concerning the subject matter herein and supersedes all prior or contemporaneous agreements, representations, warranties, and understandings.

Last updated:10/18/2025

SaaSavant
Contact Information: hookerhillstudios@gmail.com
