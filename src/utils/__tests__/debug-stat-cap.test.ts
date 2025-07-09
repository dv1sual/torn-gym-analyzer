import { describe, it, expect } from 'vitest'

describe('Debug Stat Cap Calculation', () => {
  it('should test stat cap formula precision', () => {
    const baseStat = 303304576
    
    // Our current formula: IF(H3<50000000,H3,(H3-50000000)/(8.77635*LOG(H3))+50000000)
    const S = baseStat < 50_000_000 
      ? baseStat 
      : (baseStat - 50_000_000) / (8.77635 * Math.log(baseStat)) + 50_000_000
    
    console.log('=== STAT CAP ANALYSIS ===')
    console.log('Original stat:', baseStat.toLocaleString())
    console.log('Math.log(baseStat):', Math.log(baseStat))
    console.log('8.77635 * Math.log(baseStat):', 8.77635 * Math.log(baseStat))
    console.log('(baseStat - 50_000_000):', (baseStat - 50_000_000).toLocaleString())
    console.log('Division result:', (baseStat - 50_000_000) / (8.77635 * Math.log(baseStat)))
    console.log('Final S (after stat cap):', S.toLocaleString())
    console.log('Reduction factor:', (S / baseStat).toFixed(8))
    
    // Let's also test with different logarithm bases or constants
    console.log('\n=== ALTERNATIVE FORMULAS ===')
    
    // Test with LOG10 instead of LN
    const S_log10 = baseStat < 50_000_000 
      ? baseStat 
      : (baseStat - 50_000_000) / (8.77635 * Math.log10(baseStat)) + 50_000_000
    console.log('With LOG10:', S_log10.toLocaleString())
    
    // Test with slightly different constant
    const S_alt1 = baseStat < 50_000_000 
      ? baseStat 
      : (baseStat - 50_000_000) / (8.776 * Math.log(baseStat)) + 50_000_000
    console.log('With 8.776:', S_alt1.toLocaleString())
    
    const S_alt2 = baseStat < 50_000_000 
      ? baseStat 
      : (baseStat - 50_000_000) / (8.777 * Math.log(baseStat)) + 50_000_000
    console.log('With 8.777:', S_alt2.toLocaleString())
    
    expect(S).toBeGreaterThan(50_000_000)
    expect(S).toBeLessThan(baseStat)
  })

  it('should test the impact of stat cap on final calculation', () => {
    const baseStat = 303304576
    const happy = 5100
    
    // Test different stat cap values to see impact on final result
    const testStatCaps = [
      51477819.325, // Our current result
      51500000,     // Slightly higher
      51450000,     // Slightly lower
      52000000,     // Much higher
      51000000      // Much lower
    ]
    
    console.log('\n=== STAT CAP IMPACT ON CALCULATION ===')
    
    testStatCaps.forEach((S, index) => {
      // Happy multiplier
      const lnComponent = Math.round((Math.log(1 + happy / 250)) * 10000) / 10000
      const happyMult = Math.round((1 + 0.07 * lnComponent) * 10000) / 10000
      
      // SPD constants
      const A = 1600
      const B = 2000
      
      // Core calculation
      const core = S * happyMult + 8 * Math.pow(happy, 1.05) + (1 - Math.pow(happy / 99_999, 2)) * A + B
      
      // George's gym: 7.30 SPD dots, 10 energy, 1.11 multiplier
      const G = 7.30
      const energyUsed = 10
      const gymMult = 1.11
      
      const singleTrainGain = (energyUsed * G * gymMult * core) / 200_000
      const totalGain = singleTrainGain * 40 // Approximate for 40 trains
      
      console.log(`Test ${index + 1}: S = ${S.toLocaleString()}, Single gain = ${singleTrainGain.toFixed(2)}, Total ≈ ${totalGain.toLocaleString()}`)
    })
  })
})
