# Testing Documentation

## Overview

This project includes a comprehensive test suite covering unit tests, integration tests, and end-to-end (E2E) tests. The testing infrastructure follows industry best practices and ensures code quality, reliability, and maintainability.

## Test Stack

- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end browser testing
- **Firebase Admin SDK**: Database seeding and testing utilities

## Test Structure

```
__tests__/
├── unit/                    # Unit tests
│   ├── auth/               # Authentication tests
│   │   ├── signIn.test.tsx
│   │   └── signUp.test.tsx
│   ├── subscriptions/      # Subscription tests
│   │   ├── checkout.test.ts
│   │   └── lifecycle.test.ts
│   ├── support/            # Support ticket tests
│   │   └── tickets.test.ts
│   ├── account/            # Account management tests
│   │   └── deletion.test.ts
│   └── api/                # API route tests
│       └── webhook.test.ts
├── integration/            # Integration tests
│   ├── auth-flow.test.tsx
│   └── subscription-flow.test.ts
├── e2e/                    # End-to-end tests
│   ├── auth.spec.ts
│   ├── subscription.spec.ts
│   └── support-tickets.spec.ts
├── mocks/                  # Mock implementations
│   ├── firebase.ts
│   └── stripe.ts
└── utils/                  # Test utilities
    └── test-utils.tsx
```

## Running Tests

### All Tests
```bash
npm test                    # Run tests in watch mode
npm run test:ci            # Run all tests in CI mode with coverage
```

### Unit Tests
```bash
npm run test:unit          # Run only unit tests
```

### Integration Tests
```bash
npm run test:integration   # Run only integration tests
```

### E2E Tests
```bash
npm run test:e2e           # Run E2E tests
npm run test:e2e:ui        # Run E2E tests with UI
```

## Test Coverage

The project maintains the following coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

To view coverage report:
```bash
npm run test:ci
# Coverage report will be in ./coverage/lcov-report/index.html
```

## Test Categories

### 1. Authentication Tests

**Location**: `__tests__/unit/auth/`

Tests cover:
- ✅ Sign up with email/password
- ✅ Sign in with valid/invalid credentials
- ✅ Password reset flow
- ✅ Email validation
- ✅ Password strength validation
- ✅ Auth state persistence
- ✅ User profile creation

**Example**:
```typescript
test('should successfully sign in with valid credentials', async () => {
  const result = await signInWithEmailAndPassword(
    mockAuth,
    'test@example.com',
    'password123'
  )
  expect(result.user).toEqual(mockUser)
})
```

### 2. Subscription Tests

**Location**: `__tests__/unit/subscriptions/`

Tests cover:
- ✅ Checkout session creation
- ✅ Billing portal access
- ✅ Subscription lifecycle (create, update, cancel)
- ✅ Failed payment handling
- ✅ Subscription renewal
- ✅ Plan upgrades/downgrades
- ✅ Customer management

**Example**:
```typescript
test('should create a checkout session for subscription', async () => {
  const session = await mockStripeInstance.checkout.sessions.create({
    customer: 'cus_123',
    mode: 'subscription',
    line_items: [{ price: 'price_premium', quantity: 1 }],
  })
  expect(session.mode).toBe('subscription')
})
```

### 3. Support Ticket Tests

**Location**: `__tests__/unit/support/`

Tests cover:
- ✅ Ticket creation
- ✅ Ticket retrieval
- ✅ Ticket status updates
- ✅ Admin responses
- ✅ Ticket deletion
- ✅ Input validation
- ✅ Admin ticket management

### 4. Account Deletion Tests

**Location**: `__tests__/unit/account/`

Tests cover:
- ✅ User account deletion
- ✅ User data cleanup
- ✅ Subscription cancellation before deletion
- ✅ Stripe customer deletion
- ✅ Complete deletion flow
- ✅ Error handling

### 5. Webhook Tests

**Location**: `__tests__/unit/api/`

Tests cover:
- ✅ Webhook signature validation
- ✅ Subscription created events
- ✅ Subscription updated events
- ✅ Subscription deleted events
- ✅ Payment succeeded events
- ✅ Payment failed events
- ✅ Customer events
- ✅ Idempotency handling

### 6. Integration Tests

**Location**: `__tests__/integration/`

Tests cover:
- ✅ Complete authentication flows
- ✅ Complete subscription purchase flows
- ✅ Subscription cancellation flows
- ✅ Failed payment flows
- ✅ Webhook event processing

### 7. E2E Tests

**Location**: `__tests__/e2e/`

Tests cover:
- ✅ User sign up/sign in flows
- ✅ Protected route access
- ✅ Subscription purchase UI
- ✅ Billing portal access
- ✅ Support ticket submission
- ✅ Admin ticket management

## Database Seeding

### Production Seeding
```bash
npm run seed               # Seed production database (requires Firebase Admin SDK)
npm run seed -- --clear    # Clear existing data before seeding
```

### Development Seeding
```bash
npm run seed:dev           # Quick seed for local development
```

### Seed Data

**Users**:
- `admin@saasavant.com` (Admin123!) - Admin user
- `premium@saasavant.com` (Premium123!) - Premium subscriber
- `basic@saasavant.com` (Basic123!) - Basic subscriber
- `free@saasavant.com` (Free123!) - Free user
- `canceled@saasavant.com` (Canceled123!) - Canceled subscription

**Development Users**:
- `dev@test.com` (Test123!) - Regular user
- `admin@test.com` (Admin123!) - Admin user

## Mocking Strategy

### Firebase Mocking
The test suite uses custom Firebase mocks that simulate:
- Authentication (sign up, sign in, sign out)
- Firestore operations (CRUD)
- Real-time listeners

### Stripe Mocking
Stripe operations are mocked to simulate:
- Customer creation/management
- Checkout sessions
- Billing portal sessions
- Subscriptions
- Webhook events

## CI/CD Integration

The project includes GitHub Actions workflows for continuous integration:

**Workflow**: `.github/workflows/ci.yml`

Jobs:
1. **Lint**: ESLint code quality checks
2. **Unit Tests**: Run all unit tests
3. **Integration Tests**: Run integration tests
4. **E2E Tests**: Run Playwright tests
5. **Build**: Build Next.js application
6. **Type Check**: TypeScript compilation check
7. **Security Scan**: npm audit for vulnerabilities

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use clear, descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Test Independence
- Each test should be independent
- Use `beforeEach` to reset state
- Clean up after tests

### 3. Mocking
- Mock external dependencies (Firebase, Stripe)
- Use realistic mock data
- Reset mocks between tests

### 4. Assertions
- Use specific assertions
- Test both success and failure cases
- Verify error messages

### 5. Coverage
- Aim for high coverage but focus on critical paths
- Don't test implementation details
- Test user-facing behavior

## Writing New Tests

### Unit Test Template
```typescript
import { mockFirestore } from '../../mocks/firebase'

describe('Feature Name', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should do something', async () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = await someFunction(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should perform user action', async ({ page }) => {
    await page.goto('/page')
    await page.click('button')
    await expect(page.locator('.result')).toBeVisible()
  })
})
```

## Troubleshooting

### Tests Failing Locally
1. Clear Jest cache: `npx jest --clearCache`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check environment variables in `.env.local`

### E2E Tests Failing
1. Install Playwright browsers: `npx playwright install`
2. Ensure dev server is running on port 3000
3. Check for port conflicts

### Coverage Not Generating
1. Run tests with coverage flag: `npm run test:ci`
2. Check `jest.config.js` coverage settings
3. Ensure test files match patterns in config

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Firebase Testing Guide](https://firebase.google.com/docs/rules/unit-tests)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before committing
3. Maintain or improve code coverage
4. Update this documentation if adding new test categories
