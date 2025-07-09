import { describe, it } from 'vitest';

describe('Find Exact Spreadsheet Constant', () => {
  it('should find the exact constant that produces 53,402,804.75', () => {
    const baseStat = 303304576;
    const expectedStatCap = 53402804.74876895; // From spreadsheet Sheet1 column I
    
    console.log('=== FINDING EXACT SPREADSHEET CONSTANT ===');
    console.log(`Base stat: ${baseStat.toLocaleString()}`);
    console.log(`Expected stat cap: ${expectedStatCap.toFixed(8)}`);
    
    // Test different constants to see which one gives us exactly 53,402,804.74876895
    const constants = [8.77635, 3.8115203763, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];
    
    constants.forEach(constant => {
      const statCap = (baseStat - 50_000_000) / (constant * Math.log(baseStat)) + 50_000_000;
      const difference = Math.abs(statCap - expectedStatCap);
      console.log(`Constant ${constant}: ${statCap.toFixed(8)} (diff: ${difference.toFixed(8)})`);
    });
    
    // Calculate the exact constant needed
    const exactConstant = (baseStat - 50_000_000) / ((expectedStatCap - 50_000_000) * Math.log(baseStat));
    console.log(`\nExact constant needed: ${exactConstant.toFixed(10)}`);
    
    // Test the exact constant
    const testStatCap = (baseStat - 50_000_000) / (exactConstant * Math.log(baseStat)) + 50_000_000;
    console.log(`Test with exact constant: ${testStatCap.toFixed(8)}`);
    console.log(`Difference: ${(testStatCap - expectedStatCap).toFixed(10)}`);
    
    // Also test what single train gain we get with this constant
    const S = testStatCap;
    const happy = 5100;
    const lnComponent = Math.round((Math.log(1 + happy / 250)) * 10000) / 10000;
    const happyMult = Math.round((1 + 0.07 * lnComponent) * 10000) / 10000;
    const A = 1600, B = 2000; // SPD constants
    const core = S * happyMult + 8 * Math.pow(happy, 1.05) + (1 - Math.pow(happy / 99_999, 2)) * A + B;
    const gymMult = 1.02 * 1.01 * 1.01 * 1.07; // Exact multiplier
    const energyUsed = 10, G = 7.3;
    const singleTrainGain = (energyUsed * G * gymMult * core) / 200_000;
    
    console.log(`\nWith exact constant, single train gain: ${singleTrainGain.toFixed(8)}`);
    console.log(`Expected single train: 26380.798457536177`);
    console.log(`Difference: ${(singleTrainGain - 26380.798457536177).toFixed(8)}`);
  });
});
