import { describe, it } from 'vitest';
import { calculateGymGainsMultiplier, TrainingPerks } from '../calc';

describe('Debug Gym Multiplier', () => {
  it('should debug gym multiplier calculation step by step', () => {
    const stat = 'spd' as const;
    const perks: TrainingPerks = {
      steadfast: { spd: 7 },
      manualGymBonusPercent: { spd: 4 }
    };

    console.log('=== GYM MULTIPLIER DEBUG ===');
    console.log('Expected result: 1.1133371400000003');
    
    // Step by step calculation
    let m = 1;
    console.log(`Starting multiplier: ${m}`);
    
    // Manual gym bonus (4% = 2% + 1% + 1%)
    const uiBonus = perks.manualGymBonusPercent?.[stat] ?? 0;
    if (uiBonus > 0) {
      const oldM = m;
      m *= 1 + uiBonus / 100;
      console.log(`After manual bonus (${uiBonus}%): ${oldM} × ${1 + uiBonus / 100} = ${m}`);
    }
    
    // Steadfast bonus (7%)
    if ((perks.steadfast?.[stat] ?? 0) > 0) {
      const oldM = m;
      const steadfastPercent = perks.steadfast![stat]!;
      m *= 1 + steadfastPercent / 100;
      console.log(`After steadfast (${steadfastPercent}%): ${oldM} × ${1 + steadfastPercent / 100} = ${m}`);
    }
    
    console.log(`Final calculated multiplier: ${m}`);
    console.log(`Expected: 1.1133371400000003`);
    console.log(`Difference: ${(m - 1.1133371400000003).toFixed(10)}`);
    
    // Test the actual function
    const actualMultiplier = calculateGymGainsMultiplier(stat, perks);
    console.log(`Actual function result: ${actualMultiplier}`);
    
    // Let's also test the exact spreadsheet calculation
    // From spreadsheet: (1+0.02)*(1+0.01)*(1+0.01)*(1+0.07)
    const propertyPerks = 1.02;
    const educationStat = 1.01;
    const educationGeneral = 1.01;
    const steadfast = 1.07;
    
    const spreadsheetCalc = propertyPerks * educationStat * educationGeneral * steadfast;
    console.log(`\nSpreadsheet calculation:`);
    console.log(`${propertyPerks} × ${educationStat} × ${educationGeneral} × ${steadfast} = ${spreadsheetCalc}`);
    console.log(`Difference from expected: ${(spreadsheetCalc - 1.1133371400000003).toFixed(15)}`);
    
    // Test if we should be applying bonuses separately
    console.log(`\nTesting separate bonus application:`);
    const manualBonus = 1.04; // 4% total
    const steadfastBonus = 1.07; // 7%
    const separateCalc = manualBonus * steadfastBonus;
    console.log(`${manualBonus} × ${steadfastBonus} = ${separateCalc}`);
  });
});
