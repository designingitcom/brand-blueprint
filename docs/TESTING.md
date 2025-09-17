# Test-Driven Development (TDD) Guidelines

## Overview

This project follows Test-Driven Development principles. **All new features must have tests written BEFORE implementation.**

## Testing Stack

- **E2E Testing**: Playwright
- **Unit Testing**: Vitest
- **Component Testing**: React Testing Library
- **CI/CD**: GitHub Actions

## TDD Process

### 1. Write Tests First (RED Phase)

Before implementing any feature:

1. Write E2E tests for user workflows
2. Write unit tests for business logic
3. Run tests to ensure they fail (no false positives)

### 2. Implement Feature (GREEN Phase)

1. Write minimal code to make tests pass
2. Focus on functionality, not optimization
3. Run tests frequently during implementation

### 3. Refactor (REFACTOR Phase)

1. Improve code quality while keeping tests green
2. Optimize performance
3. Enhance readability and maintainability

## Test Commands

```bash
# Unit tests
npm run test           # Run unit tests in watch mode
npm run test:ui        # Open Vitest UI
npm run test:coverage  # Generate coverage report

# E2E tests
npm run test:e2e       # Run all E2E tests headless
npm run test:e2e:ui    # Open Playwright UI
npm run test:e2e:debug # Debug mode with browser

# Run everything
npm run test:all       # Unit + E2E tests
```

## Writing Tests

### E2E Test Structure

```typescript
// tests/e2e/feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/path');

    // Act
    await page.click('button');

    // Assert
    await expect(page).toHaveURL('/expected-path');
  });
});
```

### Unit Test Structure

```typescript
// tests/unit/module.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('Module Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

## Test Organization

```
tests/
├── e2e/                # End-to-end tests
│   ├── auth.spec.ts    # Authentication flows
│   ├── onboarding.spec.ts
│   └── business.spec.ts
├── unit/               # Unit tests
│   ├── lib/           # Library functions
│   ├── hooks/         # React hooks
│   └── utils/         # Utility functions
├── integration/        # Integration tests
│   ├── api/           # API route tests
│   └── db/            # Database tests
└── fixtures/           # Test data and mocks
    ├── users.ts
    └── businesses.ts
```

## Best Practices

### 1. Test Naming

- Use descriptive test names that explain the behavior
- Follow "should [expected behavior] when [condition]" pattern
- Group related tests with `describe` blocks

### 2. Test Independence

- Each test should be independent
- Use `beforeEach` for setup, `afterEach` for cleanup
- Don't rely on test execution order

### 3. Assertions

- One logical assertion per test
- Use specific matchers (`.toBe()`, `.toContain()`, etc.)
- Test both positive and negative cases

### 4. Test Data

- Use factories or fixtures for test data
- Avoid hardcoding values
- Clean up test data after tests

### 5. Mocking

- Mock external dependencies
- Keep mocks simple and focused
- Update mocks when interfaces change

## Coverage Requirements

Maintain minimum coverage thresholds:

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## CI/CD Integration

All tests run automatically on:

- Pull requests
- Pushes to main/develop branches
- Pre-commit hooks (optional)

### Pipeline Stages

1. **Lint**: Code quality checks
2. **Type Check**: TypeScript validation
3. **Unit Tests**: Fast feedback on logic
4. **E2E Tests**: Full user flow validation
5. **Build**: Production build verification

## Common Testing Scenarios

### Authentication Testing

```typescript
test('should require authentication', async ({ page }) => {
  await page.goto('/protected-route');
  await expect(page).toHaveURL('/sign-in');
});
```

### Form Validation Testing

```typescript
test('should show validation errors', async ({ page }) => {
  await page.click('button[type="submit"]');
  await expect(page.getByText('Required field')).toBeVisible();
});
```

### API Testing

```typescript
it('should return user data', async () => {
  const response = await fetch('/api/user');
  expect(response.status).toBe(200);
});
```

## Debugging Tests

### Playwright Debugging

```bash
# Debug specific test
npx playwright test auth.spec.ts --debug

# Generate trace on failure
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Vitest Debugging

```bash
# Run specific test file
npm run test path/to/test.ts

# Run tests matching pattern
npm run test -- -t "pattern"

# Debug in VS Code
# Add breakpoints and use JavaScript Debug Terminal
```

## Test Checklist for New Features

Before marking any task as complete:

- [ ] E2E tests written and passing
- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] All tests run in CI/CD
- [ ] Coverage thresholds met
- [ ] Edge cases tested
- [ ] Error scenarios handled
- [ ] Performance benchmarks (if applicable)

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Testing Library](https://testing-library.com/docs/)
- [TDD Best Practices](https://kentcdodds.com/blog/write-tests)

---

**Remember: No code without tests! Write tests first, implementation second.**
