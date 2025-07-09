import { describe, it, expect } from 'vitest';
import { computeGain, calculateMultipleTrains, TrainingPerks } from '../calc';

describe('Debug Exact Spreadsheet Match', () => {
  it('should match the exact spreadsheet result for George\'s SPD training', () => {
    // Exact data from the spreadsheet Sheet1
    const baseStat = 303304576;
    const happy = 5100;
    const gymName = "George's";
    const stat = 'spd' as const;
    const totalEnergy = 400;
    const trains = 40;
    
    // Bonuses from spreadsheet:
    // Faction Steadfast: 0.07 (7%)
    // Property Perks: 0.02 (2%) 
    // Education (Stat Specific): 0.01 (1%)
    // Education (General): 0.01 (1%)
    // Job Perks: 0
    // Book Perks: 0
    // Bonus Multiplier: 1.1133371400000003
    
    const perks: TrainingPerks = {
      steadfast: { spd: 7 },
      manualGymBonusPercent: { spd: 4 } // 2% + 1% + 1% = 4% total manual bonus
    };

    console.log('=== EXACT SPREADSHEET MATCH TEST ===');
    console.log(`Base SPD stat: ${baseStat.toLocaleString()}`);
    console.log(`Happy: ${happy}`);
    console.log(`Gym: ${gymName}`);
    console.log(`Total energy: ${totalEnergy} (${trains} trains)`);
    console.log(`Expected spreadsheet result: 1,054,251.38`);
    console.log(`Expected stat cap adjusted: 53,402,804.75`);
    console.log(`Expected bonus multiplier: 1.1133371400000003`);
    
    // Test single train first
    const singleTrainGain = computeGain(baseStat, happy, gymName, stat, perks);
    console.log(`Single train gain: ${singleTrainGain.toFixed(6)}`);
    console.log(`Expected single train: 26,380.798457536177`);
    
    // Test multiple trains
    const result = calculateMultipleTrains(baseStat, happy, gymName, trains, stat, perks);
    console.log(`Multiple trains result: ${result.totalGain.toFixed(2)}`);
    console.log(`Difference: ${(result.totalGain - 1054251.38).toFixed(2)}`);
    
    // The target is exactly 1,054,251.38
    expect(result.totalGain).toBeCloseTo(1054251.38, 1);
  });

  it('should debug the stat cap calculation', () => {
    const baseStat = 303304576;
    const expectedStatCap = 53402804.74876895;
    
    // Updated formula: (stat - 50M) / (3.8115203763 × LN(stat)) + 50M
    const statCap = baseStat < 50_000_000 
      ? baseStat 
      : (baseStat - 50_000_000) / (3.8115203763 * Math.log(baseStat)) + 50_000_000;
    
    console.log('=== STAT CAP DEBUG ===');
    console.log(`Original stat: ${baseStat.toLocaleString()}`);
    console.log(`Our stat cap: ${statCap.toFixed(8)}`);
    console.log(`Expected stat cap: ${expectedStatCap.toFixed(8)}`);
    console.log(`Difference: ${(statCap - expectedStatCap).toFixed(8)}`);
    console.log(`LN(${baseStat}): ${Math.log(baseStat)}`);
    console.log(`3.8115203763 × LN: ${3.8115203763 * Math.log(baseStat)}`);
    
    // Test if the new constant works
    const newConstant = 3.8115203763;
    console.log(`Using constant ${newConstant}: ${((baseStat - 50_000_000) / (newConstant * Math.log(baseStat)) + 50_000_000).toFixed(8)}`);
  });

  it('should debug the bonus multiplier calculation', () => {
    const expectedMultiplier = 1.1133371400000003;
    
    // Spreadsheet bonuses:
    // Property Perks: 2%
    // Education (Stat Specific): 1% 
    // Education (General): 1%
    // Faction Steadfast: 7%
    // Total should be: (1 + 0.02) × (1 + 0.01) × (1 + 0.01) × (1 + 0.07)
    
    const propertyPerks = 1.02;
    const educationStat = 1.01;
    const educationGeneral = 1.01;
    const steadfast = 1.07;
    
    const calculatedMultiplier = propertyPerks * educationStat * educationGeneral * steadfast;
    
    console.log('=== BONUS MULTIPLIER DEBUG ===');
    console.log(`Property Perks: ${propertyPerks}`);
    console.log(`Education (Stat): ${educationStat}`);
    console.log(`Education (General): ${educationGeneral}`);
    console.log(`Steadfast: ${steadfast}`);
    console.log(`Calculated: ${calculatedMultiplier}`);
    console.log(`Expected: ${expectedMultiplier}`);
    console.log(`Difference: ${(calculatedMultiplier - expectedMultiplier).toFixed(10)}`);
  });
});
