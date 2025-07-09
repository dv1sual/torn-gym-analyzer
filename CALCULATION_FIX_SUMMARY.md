# Critical Gym Calculation Formula Fix

## Issue Identified
The gym calculation formula had a critical bug where the random component (C) was incorrectly being added to the base calculation, causing inaccurate gain predictions.

## Problems Fixed

### 1. **Random Component (C) Misuse**
**❌ Previous (Incorrect) Implementation:**
```typescript
const core = S * happyMult + 8 * Math.pow(happy, 1.05) + (1 - Math.pow(happy / 99_999, 2)) * A + B;
const baseGain = (core * G * energyUsed) / 200_000;
const randomComponent = C * G * energyUsed / 200_000;  // ❌ This was wrong
return (baseGain + randomComponent) * gymMult + jobPts;
```

**✅ Fixed Implementation:**
```typescript
const core = S * happyMult + 8 * Math.pow(happy, 1.05) + (1 - Math.pow(happy / 99_999, 2)) * A + B;
const gymMult = calculateGymGainsMultiplier(stat, perks);
const baseGain = (energyUsed * G * gymMult * core) / 200_000;
return baseGain + jobPts;
```

### 2. **Multiplier Order Correction**
**❌ Previous (Incorrect) Order:**
- Applied gymMult AFTER dividing by 200,000
- `(baseGain + randomComponent) * gymMult + jobPts`

**✅ Fixed Order:**
- Applied gymMult INSIDE the main calculation (matches spreadsheet formula)
- `(energyUsed * G * gymMult * core) / 200_000 + jobPts`

## Spreadsheet Formula Reference

**Correct Formula (M3):**
```
(1/200000)*C3*D3*(K3)*(S*happyMult + 8*happy^1.05 + A*(1-(happy/99999)^2) + B)
```

Where:
- `C3` = energyUsed
- `D3` = G (gym dots)
- `K3` = gymMult (bonus multiplier)
- `S` = effective stat (with stat cap)
- `A`, `B` = stat-specific constants
- **C component is NOT included** in main calculation

## Random Component (C) Usage

The C constants are used in the **Iterate sheet** for min/max variance calculations:
- **Min gain:** `core - C`
- **Max gain:** `core + C`
- **Average gain:** `core` (C cancels out)

**C is NOT included in the main calculation formula (M3)**

## Impact of Fix

1. **Accuracy:** Calculations now match the spreadsheet formula exactly
2. **Precision:** Multiplier order ensures correct bonus application
3. **Consistency:** Removes random variance from base predictions
4. **Testing:** Added comprehensive tests to prevent regression

## Test Coverage

Added 4 new tests in `src/utils/__tests__/calc.test.ts`:
- ✅ Verifies C component is NOT included in main calculation
- ✅ Confirms correct multiplier order (K3 inside calculation)
- ✅ Tests different stats and gyms
- ✅ Validates exact spreadsheet formula structure

## Files Modified

1. **`src/utils/calc.ts`**
   - Fixed `computeGain()` function
   - Added documentation about C component usage
   - Corrected multiplier application order

2. **`src/utils/__tests__/calc.test.ts`** (NEW)
   - Comprehensive test suite for calculation accuracy
   - Prevents future regression of this critical bug

## Verification

All 72 tests pass, including:
- 4 new calculation formula tests
- 68 existing component and hook tests

The fix ensures the gym calculator now provides accurate predictions that match the authoritative spreadsheet formula.
