import { describe, it, expect } from 'vitest'
import { computeGain, STAT_CONSTANTS } from '../calc'

describe('calc.ts - Gym Calculation Formula', () => {
  describe('computeGain', () => {
    it('should match spreadsheet formula without random component C', () => {
      // Test parameters
      const baseStat = 1000000
      const happy = 500
      const gymName = 'Global Gym'
      const stat = 'str'
      
      // Expected calculation based on spreadsheet formula (M3):
      // (1/200000)*C3*D3*(K3)*(S*happyMult + 8*happy^1.05 + A*(1-(happy/99999)^2) + B)
      // Note: C component should NOT be included in main calculation
      
      const result = computeGain(baseStat, happy, gymName, stat)
      
      // Manual calculation to verify
      const { A, B, C } = STAT_CONSTANTS[stat]
      const S = baseStat // No stat cap for this test
      const G = 4.00 // Global Gym strength dots
      const energyUsed = 5 // Global Gym energy
      
      // Happy multiplier calculation
      const lnComponent = Math.round((Math.log(1 + happy / 250)) * 10000) / 10000
      const happyMult = Math.round((1 + 0.07 * lnComponent) * 10000) / 10000
      
      // Core calculation (without C component)
      const core = S * happyMult + 8 * Math.pow(happy, 1.05) + (1 - Math.pow(happy / 99_999, 2)) * A + B
      const expected = (core * G * energyUsed) / 200_000
      
      expect(result).toBeCloseTo(expected, 6)
    })

    it('should not include random component C in base calculation', () => {
      const baseStat = 500000
      const happy = 750
      const gymName = 'Deep Burn'
      const stat = 'def'
      
      const result = computeGain(baseStat, happy, gymName, stat)
      
      // Verify that C component is not included by checking the calculation
      const { A, B, C } = STAT_CONSTANTS[stat]
      const S = baseStat
      const G = 6.00 // Deep Burn defense dots
      const energyUsed = 10
      
      const lnComponent = Math.round((Math.log(1 + happy / 250)) * 10000) / 10000
      const happyMult = Math.round((1 + 0.07 * lnComponent) * 10000) / 10000
      
      // Calculation WITHOUT C component (correct)
      const coreWithoutC = S * happyMult + 8 * Math.pow(happy, 1.05) + (1 - Math.pow(happy / 99_999, 2)) * A + B
      const expectedWithoutC = (coreWithoutC * G * energyUsed) / 200_000
      
      // Calculation WITH C component (incorrect - what we fixed)
      const coreWithC = S * happyMult + 8 * Math.pow(happy, 1.05) + (1 - Math.pow(happy / 99_999, 2)) * A + B
      const randomComponent = C * G * energyUsed / 200_000
      const expectedWithC = expectedWithoutC + randomComponent
      
      // Result should match the calculation WITHOUT C component
      expect(result).toBeCloseTo(expectedWithoutC, 6)
      // Result should NOT match the calculation WITH C component
      expect(result).not.toBeCloseTo(expectedWithC, 6)
    })

    it('should handle different stats correctly without C component', () => {
      const testCases = [
        { stat: 'str' as const, gym: 'Atlas', expected: 'no C component' },
        { stat: 'def' as const, gym: 'Last Round', expected: 'no C component' },
        { stat: 'spd' as const, gym: 'The Edge', expected: 'no C component' },
        { stat: 'dex' as const, gym: "George's", expected: 'no C component' }
      ]
      
      testCases.forEach(({ stat, gym }) => {
        const result = computeGain(1000000, 600, gym, stat)
        
        // Verify calculation matches expected formula without C
        const { A, B } = STAT_CONSTANTS[stat]
        const gymData = {
          'Atlas': { energyPerTrain: 10, str: 7.00, def: 6.40, spd: 6.40, dex: 6.60 },
          'Last Round': { energyPerTrain: 10, str: 6.80, def: 7.00, spd: 6.60, dex: 6.60 },
          'The Edge': { energyPerTrain: 10, str: 6.80, def: 7.00, spd: 7.00, dex: 6.80 },
          "George's": { energyPerTrain: 10, str: 7.30, def: 7.30, spd: 7.30, dex: 7.30 }
        }
        
        const G = gymData[gym as keyof typeof gymData][stat]
        const energyUsed = gymData[gym as keyof typeof gymData].energyPerTrain
        const S = 1000000
        const happy = 600
        
        const lnComponent = Math.round((Math.log(1 + happy / 250)) * 10000) / 10000
        const happyMult = Math.round((1 + 0.07 * lnComponent) * 10000) / 10000
        
        const core = S * happyMult + 8 * Math.pow(happy, 1.05) + (1 - Math.pow(happy / 99_999, 2)) * A + B
        const expected = (core * G * energyUsed) / 200_000
        
        expect(result).toBeCloseTo(expected, 6)
      })
    })

    it('should match spreadsheet formula structure exactly', () => {
      // Test with specific values that would show the difference clearly
      const baseStat = 2000000
      const happy = 800
      const gymName = 'Sports Science Lab'
      const stat = 'str'
      
      const result = computeGain(baseStat, happy, gymName, stat)
      
      // Spreadsheet formula: (1/200000)*C3*D3*(K3)*(S*happyMult + 8*happy^1.05 + A*(1-(happy/99999)^2) + B)
      // Where C3=energyUsed, D3=G (gym dots), K3=gymMult (1 for no perks)
      // Note: K3 (gymMult) is applied INSIDE the calculation, not after
      
      const { A, B } = STAT_CONSTANTS[stat]
      const S = baseStat
      const G = 9.00 // Sports Science Lab strength dots
      const energyUsed = 25 // Sports Science Lab energy
      const gymMult = 1 // No perks
      
      const lnComponent = Math.round((Math.log(1 + happy / 250)) * 10000) / 10000
      const happyMult = Math.round((1 + 0.07 * lnComponent) * 10000) / 10000
      
      // This is the exact spreadsheet formula structure with correct multiplier order
      const core = S * happyMult + 8 * Math.pow(happy, 1.05) + A * (1 - Math.pow(happy/99999, 2)) + B
      const spreadsheetResult = (energyUsed * G * gymMult * core) / 200000
      
      expect(result).toBeCloseTo(spreadsheetResult, 6)
    })
  })
})
