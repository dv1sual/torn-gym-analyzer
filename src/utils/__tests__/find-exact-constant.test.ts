import { describe, it } from 'vitest';

describe('Find Exact Constant', () => {
  it('should find the exact constant for stat cap', () => {
    const baseStat = 303304576;
    const expectedStatCap = 53402804.74876895;
    
    // Formula: (stat - 50M) / (constant × LN(stat)) + 50M = expectedStatCap
    // Solving for constant: constant = (stat - 50M) / ((expectedStatCap - 50M) × LN(stat))
    
    const numerator = baseStat - 50_000_000;
    const denominator = (expectedStatCap - 50_000_000) * Math.log(baseStat);
    const exactConstant = numerator / denominator;
    
    console.log('=== FINDING EXACT CONSTANT ===');
    console.log(`Base stat: ${baseStat.toLocaleString()}`);
    console.log(`Expected stat cap: ${expectedStatCap.toFixed(8)}`);
    console.log(`LN(${baseStat}): ${Math.log(baseStat)}`);
    console.log(`Numerator (stat - 50M): ${numerator.toLocaleString()}`);
    console.log(`Denominator ((expected - 50M) × LN): ${denominator.toFixed(8)}`);
    console.log(`Exact constant needed: ${exactConstant.toFixed(10)}`);
    
    // Test the exact constant
    const testStatCap = (baseStat - 50_000_000) / (exactConstant * Math.log(baseStat)) + 50_000_000;
    console.log(`Test with exact constant: ${testStatCap.toFixed(8)}`);
    console.log(`Difference: ${(testStatCap - expectedStatCap).toFixed(10)}`);
    
    // Also test some rounded versions
    const rounded6 = Math.round(exactConstant * 1000000) / 1000000;
    const rounded5 = Math.round(exactConstant * 100000) / 100000;
    const rounded4 = Math.round(exactConstant * 10000) / 10000;
    
    console.log(`\nRounded to 6 decimals: ${rounded6}`);
    console.log(`Result: ${((baseStat - 50_000_000) / (rounded6 * Math.log(baseStat)) + 50_000_000).toFixed(8)}`);
    
    console.log(`\nRounded to 5 decimals: ${rounded5}`);
    console.log(`Result: ${((baseStat - 50_000_000) / (rounded5 * Math.log(baseStat)) + 50_000_000).toFixed(8)}`);
    
    console.log(`\nRounded to 4 decimals: ${rounded4}`);
    console.log(`Result: ${((baseStat - 50_000_000) / (rounded4 * Math.log(baseStat)) + 50_000_000).toFixed(8)}`);
  });
});
