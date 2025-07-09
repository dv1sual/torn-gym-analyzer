import { describe, it } from 'vitest';
import { computeGain, TrainingPerks, STAT_CONSTANTS, calculateGymGainsMultiplier } from '../calc';

describe('Debug Single Train Calculation', () => {
  it('should debug every step of single train calculation', () => {
    const baseStat = 303304576;
    const happy = 5100;
    const gymName = "George's";
    const stat = 'spd' as const;
    
    const perks: TrainingPerks = {
      steadfast: { spd: 7 },
      manualGymBonusPercent: { spd: 4 }
    };

    console.log('=== SINGLE TRAIN STEP-BY-STEP DEBUG ===');
    console.log(`Base stat: ${baseStat.toLocaleString()}`);
    console.log(`Happy: ${happy}`);
    
    // Step 1: Effective stats (should be same as base for this case)
    const effectiveBaseStat = baseStat; // No education multipliers in this case
    console.log(`Effective base stat: ${effectiveBaseStat.toLocaleString()}`);
    
    // Step 2: Stat cap
    const S = effectiveBaseStat < 50_000_000 
      ? effectiveBaseStat 
      : (effectiveBaseStat - 50_000_000) / (3.8115203763 * Math.log(effectiveBaseStat)) + 50_000_000;
    console.log(`Stat cap adjusted (S): ${S.toFixed(8)}`);
    console.log(`Expected S: 53402804.74876895`);
    
    // Step 3: Happy multiplier with exact rounding
    const lnComponent = Math.round((Math.log(1 + happy / 250)) * 10000) / 10000;
    const happyMult = Math.round((1 + 0.07 * lnComponent) * 10000) / 10000;
    console.log(`LN(1 + ${happy}/250): ${Math.log(1 + happy / 250)}`);
    console.log(`LN component rounded: ${lnComponent}`);
    console.log(`Happy multiplier: ${happyMult}`);
    console.log(`Expected happy mult: 1.2144`);
    
    // Step 4: Constants
    const { A, B } = STAT_CONSTANTS[stat];
    console.log(`A constant: ${A}`);
    console.log(`B constant: ${B}`);
    
    // Step 5: Core calculation components
    const component1 = S * happyMult;
    const component2 = 8 * Math.pow(happy, 1.05);
    const component3 = (1 - Math.pow(happy / 99_999, 2)) * A;
    const component4 = B;
    
    console.log(`Component 1 (S × happyMult): ${component1.toFixed(8)}`);
    console.log(`Component 2 (8 × happy^1.05): ${component2.toFixed(8)}`);
    console.log(`Component 3 ((1-(happy/99999)^2) × A): ${component3.toFixed(8)}`);
    console.log(`Component 4 (B): ${component4}`);
    
    const core = component1 + component2 + component3 + component4;
    console.log(`Core total: ${core.toFixed(8)}`);
    
    // Step 6: Gym multiplier
    const gymMult = calculateGymGainsMultiplier(stat, perks);
    console.log(`Gym multiplier: ${gymMult}`);
    console.log(`Expected gym mult: 1.1133371400000003`);
    
    // Step 7: Final calculation
    const energyUsed = 10; // George's gym
    const G = 7.3; // George's SPD dots
    const baseGain = (energyUsed * G * gymMult * core) / 200_000;
    
    console.log(`Energy used: ${energyUsed}`);
    console.log(`Gym dots (G): ${G}`);
    console.log(`Final calculation: (${energyUsed} × ${G} × ${gymMult} × ${core.toFixed(2)}) / 200,000`);
    console.log(`Base gain: ${baseGain.toFixed(8)}`);
    console.log(`Expected: 26380.798457536177`);
    console.log(`Difference: ${(baseGain - 26380.798457536177).toFixed(8)}`);
    
    // Test the actual function
    const actualGain = computeGain(baseStat, happy, gymName, stat, perks);
    console.log(`Actual function result: ${actualGain.toFixed(8)}`);
  });
});
