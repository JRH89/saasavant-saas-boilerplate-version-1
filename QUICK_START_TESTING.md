# Quick Start: Testing Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Playwright Browsers (for E2E tests)
```bash
npx playwright install
```

### 3. Run Tests
```bash
# Run all tests in watch mode
npm test

# Run all tests once (CI mode)
npm run test:ci

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # E2E tests only
```

## 📋 Quick Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests in watch mode |
| `npm run test:ci` | Run all tests with coverage |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run seed:dev` | Seed development database |
| `npm run seed` | Seed production database |

## 🌱 Seed Test Data

### Development Seeding (Quick)
```bash
npm run seed:dev
```

**Creates**:
- `dev@test.com` (Test123!)
- `admin@test.com` (Admin123!)
- 3 test support tickets
- 1 announcement

### Production Seeding (Full)
```bash
npm run seed
```

**Creates**:
- 5 users (admin, premium, basic, free, canceled)
- 8 support tickets
- 3 announcements

## 🧪 Test Structure

```
__tests__/
├── unit/              # Fast, isolated tests
├── integration/       # Multi-component tests
├── e2e/              # Full user journey tests
├── mocks/            # Firebase & Stripe mocks
└── utils/            # Test helpers
```

## ✅ What's Tested

- ✅ **Authentication**: Sign up, sign in, password reset
- ✅ **Subscriptions**: Checkout, billing, cancellation
- ✅ **Payments**: Success, failure, renewal
- ✅ **Support Tickets**: Create, update, admin management
- ✅ **Account**: Deletion, data cleanup
- ✅ **Webhooks**: Stripe event processing
- ✅ **UI**: E2E user journeys

## 📊 View Coverage

```bash
npm run test:ci
# Open coverage/lcov-report/index.html
```

## 🔍 Debugging Tests

### Run Single Test File
```bash
npx jest __tests__/unit/auth/signIn.test.tsx
```

### Run Tests Matching Pattern
```bash
npx jest --testNamePattern="should sign in"
```

### Debug in VS Code
Add breakpoint and run "Jest: Debug" from command palette

### E2E Debugging
```bash
npm run test:e2e:ui  # Opens Playwright UI
```

## 🐛 Common Issues

### Tests Failing?
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### E2E Tests Failing?
```bash
# Reinstall Playwright browsers
npx playwright install --with-deps
```

### Port 3000 Already in Use?
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

## 📚 Learn More

- **TESTING.md** - Comprehensive testing guide
- **TEST_SUMMARY.md** - Complete test coverage overview
- **README.md** - Project documentation

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Run `npm test` to verify setup
3. ✅ Run `npm run seed:dev` to create test data
4. ✅ Start writing your own tests!

## 💡 Pro Tips

- Use `npm test` during development (watch mode)
- Run `npm run test:ci` before committing
- Check coverage regularly to maintain quality
- Write tests before fixing bugs (TDD)
- Keep tests simple and focused

## 🤝 Contributing

When adding features:
1. Write tests first
2. Ensure all tests pass
3. Maintain coverage above 70%
4. Update documentation

---

**Happy Testing! 🎉**
