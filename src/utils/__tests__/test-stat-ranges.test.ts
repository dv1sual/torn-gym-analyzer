import { describe, it } from 'vitest';
import { computeGain, TrainingPerks } from '../calc';

describe('Test Different Stat Ranges', () => {
  it('should test calculations across different stat ranges', () => {
    const gymName = "George's";
    const stat = 'spd' as const;
    const happy = 5000;
    const perks: TrainingPerks = {
      steadfast: { spd: 7 },
      manualGymBonusPercent: { spd: 4 }
    };

    console.log('=== TESTING DIFFERENT STAT RANGES ===');
    
    // Test different stat levels
    const testCases = [
      { stat: 1000, description: 'Very Low (1K)' },
      { stat: 10000, description: 'Low (10K)' },
      { stat: 100000, description: 'Medium (100K)' },
      { stat: 1000000, description: 'High (1M)' },
      { stat: 10000000, description: 'Very High (10M)' },
      { stat: 49999999, description: 'Just Below Cap (49.9M)' },
      { stat: 50000001, description: 'Just Above Cap (50.0M)' },
      { stat: 100000000, description: 'High Cap (100M)' },
      { stat: 303304576, description: 'Test Case (303M)' }
    ];

    testCases.forEach(testCase => {
      const gain = computeGain(testCase.stat, happy, gymName, stat, perks);
      
      // Check if stat cap is applied correctly
      const isAboveCap = testCase.stat >= 50_000_000;
      const statCap = isAboveCap 
        ? (testCase.stat - 50_000_000) / (3.8115203763 * Math.log(testCase.stat)) + 50_000_000
        : testCase.stat;
      
      console.log(`${testCase.description}: ${testCase.stat.toLocaleString()}`);
      console.log(`  Gain: ${gain.toFixed(2)}`);
      console.log(`  Stat Cap Applied: ${isAboveCap ? 'Yes' : 'No'}`);
      if (isAboveCap) {
        console.log(`  Effective Stat: ${statCap.toFixed(0)}`);
      }
      console.log('');
    });

    // Test with old constant for comparison on high stat
    console.log('=== COMPARISON WITH OLD CONSTANT (8.77635) ===');
    const highStat = 303304576;
    const oldConstantStatCap = (highStat - 50_000_000) / (8.77635 * Math.log(highStat)) + 50_000_000;
    const newConstantStatCap = (highStat - 50_000_000) / (3.8115203763 * Math.log(highStat)) + 50_000_000;
    
    console.log(`High stat (${highStat.toLocaleString()}):`);
    console.log(`  Old constant (8.77635): ${oldConstantStatCap.toFixed(0)}`);
    console.log(`  New constant (3.8115203763): ${newConstantStatCap.toFixed(0)}`);
    console.log(`  Difference: ${(newConstantStatCap - oldConstantStatCap).toFixed(0)}`);
  });

  it('should verify low stats are not affected by stat cap', () => {
    const gymName = "George's";
    const stat = 'spd' as const;
    const happy = 5000;
    const perks: TrainingPerks = {};

    console.log('=== VERIFYING LOW STATS UNAFFECTED ===');
    
    // Test stats well below the 50M cap
    const lowStats = [1000, 10000, 100000, 1000000, 10000000, 25000000, 49999999];
    
    lowStats.forEach(baseStat => {
      const gain = computeGain(baseStat, happy, gymName, stat, perks);
      
      // For stats below 50M, the stat cap should not be applied
      // So the effective stat should equal the base stat
      const shouldApplyStatCap = baseStat >= 50_000_000;
      
      console.log(`Stat: ${baseStat.toLocaleString()}`);
      console.log(`  Gain: ${gain.toFixed(2)}`);
      console.log(`  Stat cap applied: ${shouldApplyStatCap ? 'Yes' : 'No'}`);
      
      // Verify that low stats still give reasonable gains
      if (baseStat < 50_000_000 && gain < 1) {
        console.log(`  ⚠️  Warning: Very low gain for stat below cap`);
      }
    });
  });
});
