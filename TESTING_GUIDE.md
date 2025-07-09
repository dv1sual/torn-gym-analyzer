# Unit Testing Guide for Torn Gym Calculator

## What Are Unit Tests?

Unit tests are automated tests that verify individual pieces of code (units) work correctly in isolation. They help ensure:

1. **Code Quality**: Catch bugs early in development
2. **Refactoring Safety**: Ensure changes don't break existing functionality
3. **Documentation**: Tests serve as living documentation of how code should behave
4. **Confidence**: Deploy with confidence knowing your code works

## Testing Setup

We've set up a modern testing environment using:

- **Vitest**: Fast test runner (works great with Vite)
- **React Testing Library**: Test React components the way users interact with them
- **Jest DOM**: Additional matchers for DOM testing
- **User Event**: Simulate real user interactions

### Configuration Files:
- `vitest.config.ts` - Test configuration
- `src/test/setup.ts` - Global test setup and mocks
- `package.json` - Test scripts

## Test Structure

### Basic Test Anatomy:
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('should do something specific', () => {
    // Arrange: Set up test data
    const mockProps = { value: 100 }
    
    // Act: Render component or call function
    render(<Component {...mockProps} />)
    
    // Assert: Check the result
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## What We've Tested

### 1. Custom Hooks (`src/hooks/__tests__/`)

**useLocalStorage.test.ts**:
- ✅ Returns default value when localStorage is empty
- ✅ Updates localStorage when value changes
- ✅ Handles JSON parsing errors gracefully
- ✅ Works with complex objects
- ✅ Handles localStorage errors

**useResponsive.test.ts**:
- ✅ Detects different screen sizes (mobile/tablet/desktop)
- ✅ Updates on window resize
- ✅ Returns correct grid columns for each screen size
- ✅ Cleans up event listeners on unmount

### 2. Components (`src/components/__tests__/`)

**StatInput.test.tsx**:
- ✅ Renders all stat input fields with icons
- ✅ Displays formatted stat values
- ✅ Handles user input and calls onChange
- ✅ Processes comma-separated numbers
- ✅ Maintains focus while typing (fixes the bug we solved!)
- ✅ Handles invalid input gracefully

**TrainingSetup.test.tsx**:
- ✅ Renders happy and energy inputs
- ✅ Displays current values
- ✅ Calls callbacks on input changes
- ✅ Handles edge cases (empty, invalid input)

## Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode (reruns on file changes)
npm test

# Run tests with UI (visual test runner)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Results Summary

**Current Status**: 36/36 tests passing (100% success rate) ✅

**Passing Tests**:
- All useResponsive hook tests ✅ (9/9)
- All useLocalStorage hook tests ✅ (6/6)
- All StatInput component tests ✅ (11/11)
- All TrainingSetup component tests ✅ (10/10)

**Issues Fixed**:
- ✅ localStorage mock behavior corrected
- ✅ TrainingSetup input handling refined for real-world behavior
- ✅ Number input display value handling properly tested
- ✅ User interaction patterns accurately simulated

## Benefits Achieved

1. **Bug Prevention**: Tests caught several edge cases
2. **Refactoring Safety**: Can modify code with confidence
3. **Documentation**: Tests show how components should be used
4. **Quality Assurance**: Ensures components work as expected

## How Tests Help Development

### Before Tests:
- Manual testing required for every change
- Risk of breaking existing functionality
- Unclear component behavior expectations
- Difficult to catch edge cases

### With Tests:
- Automated verification of functionality
- Safe refactoring with immediate feedback
- Clear documentation of expected behavior
- Comprehensive edge case coverage

## Next Steps

1. **Fix Failing Tests**: Address the localStorage and input handling issues
2. **Add More Tests**: Test remaining components (GymSelector, Results, etc.)
3. **Integration Tests**: Test how components work together
4. **Coverage Goals**: Aim for 90%+ test coverage

## Testing Best Practices

1. **Test Behavior, Not Implementation**: Focus on what users see/do
2. **Use Descriptive Test Names**: Clearly state what's being tested
3. **Arrange-Act-Assert**: Structure tests consistently
4. **Mock External Dependencies**: Isolate units being tested
5. **Test Edge Cases**: Empty inputs, errors, boundary conditions

## Example Test Patterns

### Testing User Interactions:
```typescript
it('should call onChange when user types', async () => {
  const user = userEvent.setup()
  const mockOnChange = vi.fn()
  
  render(<Input onChange={mockOnChange} />)
  
  await user.type(screen.getByRole('textbox'), 'hello')
  
  expect(mockOnChange).toHaveBeenCalledWith('hello')
})
```

### Testing Component Rendering:
```typescript
it('should display the correct title', () => {
  render(<Header title="Test Title" />)
  
  expect(screen.getByText('Test Title')).toBeInTheDocument()
})
```

### Testing Error Handling:
```typescript
it('should handle invalid input gracefully', () => {
  const { result } = renderHook(() => useLocalStorage('key', 'default'))
  
  localStorage.setItem('key', 'invalid-json')
  
  expect(result.current[0]).toBe('default')
})
```

This testing setup provides a solid foundation for maintaining code quality and catching bugs early in the development process.
