import { describe, it, expect } from 'vitest'
import { computeGain, calculateMultipleTrains, STAT_CONSTANTS } from '../calc'

describe('Debug Specific Case - SPD 303M with George\'s', () => {
  const testSettings = {
    stats: { str: 0, def: 0, spd: 303304576, dex: 0 },
    happy: 5100,
    energy: 400,
    selectedGym: "George's",
    energyAllocation: { str: 0, def: 0, spd: 100, dex: 0 },
    propertyPerks: 2,
    educationStatSpecific: 1,
    educationGeneral: 1,
    jobPerks: 0,
    bookPerks: 0,
    steadfastBonus: { str: 7, def: 7, spd: 7, dex: 7 },
    dynamicHappy: true
  }

  it('should debug the calculation step by step', () => {
    const baseStat = testSettings.stats.spd
    const happy = testSettings.happy
    const gymName = testSettings.selectedGym
    const stat = 'spd' as const
    
    // Create perks object
    const totalBonus = testSettings.propertyPerks + testSettings.educationStatSpecific + testSettings.educationGeneral + testSettings.jobPerks + testSettings.bookPerks
    const perks = {
      manualGymBonusPercent: {
        str: totalBonus,
        def: totalBonus,
        spd: totalBonus,
        dex: totalBonus
      },
      steadfast: testSettings.steadfastBonus
    }

    console.log('=== DEBUGGING CALCULATION ===')
    console.log('Base SPD stat:', baseStat.toLocaleString())
    console.log('Happy:', happy)
    console.log('Gym:', gymName)
    console.log('Total bonus from perks:', totalBonus + '%')
    console.log('Steadfast SPD bonus:', testSettings.steadfastBonus.spd + '%')

    // Test single train calculation
    const singleTrainGain = computeGain(baseStat, happy, gymName, stat, perks)
    console.log('Single train gain:', singleTrainGain)

    // Test multiple trains with dynamic happy
    const trains = Math.floor(testSettings.energy / 10) // George's uses 10 energy per train
    console.log('Number of trains:', trains)

    const multipleTrainsResult = calculateMultipleTrains(
      baseStat,
      happy,
      gymName,
      trains,
      stat,
      perks
    )

    console.log('Multiple trains total gain:', multipleTrainsResult.totalGain)
    console.log('Final happy after training:', multipleTrainsResult.finalHappy)

    // Let's also manually check the stat cap calculation
    const { A, B } = STAT_CONSTANTS[stat]
    console.log('SPD constants - A:', A, 'B:', B)
    
    // Stat cap formula: IF(H3<50000000,H3,(H3-50000000)/(8.77635*LOG(H3))+50000000)
    const effectiveBaseStat = baseStat // No education multipliers for SPD in this case
    const S = effectiveBaseStat < 50_000_000 
      ? effectiveBaseStat 
      : (effectiveBaseStat - 50_000_000) / (8.77635 * Math.log(effectiveBaseStat)) + 50_000_000
    
    console.log('Effective base stat (after stat cap):', S.toLocaleString())
    console.log('Stat cap reduction:', (baseStat - S).toLocaleString())

    // Happy multiplier calculation
    const lnComponent = Math.round((Math.log(1 + happy / 250)) * 10000) / 10000
    const happyMult = Math.round((1 + 0.07 * lnComponent) * 10000) / 10000
    console.log('Happy multiplier:', happyMult)

    // Gym multiplier calculation
    const gymMult = 1 + (totalBonus / 100) + (testSettings.steadfastBonus.spd / 100)
    console.log('Expected gym multiplier:', gymMult)

    // Expected vs actual
    console.log('\n=== RESULTS COMPARISON ===')
    console.log('Calculator result: +1,015,722.78')
    console.log('Spreadsheet result: +1,054,251.38')
    console.log('Difference: 38,528.60 (3.8% higher in spreadsheet)')
    console.log('Our calculation:', multipleTrainsResult.totalGain.toLocaleString())

    // The test should help us identify the discrepancy
    expect(multipleTrainsResult.totalGain).toBeGreaterThan(1000000)
  })

  it('should test individual components of the calculation', () => {
    // Test stat cap calculation specifically
    const baseStat = 303304576
    const S = baseStat < 50_000_000 
      ? baseStat 
      : (baseStat - 50_000_000) / (8.77635 * Math.log(baseStat)) + 50_000_000
    
    console.log('Stat cap test:')
    console.log('Original stat:', baseStat.toLocaleString())
    console.log('After stat cap:', S.toLocaleString())
    console.log('Reduction factor:', (S / baseStat).toFixed(6))

    // Test happy multiplier at 5100
    const happy = 5100
    const lnComponent = Math.round((Math.log(1 + happy / 250)) * 10000) / 10000
    const happyMult = Math.round((1 + 0.07 * lnComponent) * 10000) / 10000
    
    console.log('Happy multiplier test:')
    console.log('Happy:', happy)
    console.log('ln component:', lnComponent)
    console.log('Happy multiplier:', happyMult)

    expect(S).toBeLessThan(baseStat) // Stat cap should reduce the value
    expect(happyMult).toBeGreaterThan(1) // Happy should provide a bonus
  })
})
