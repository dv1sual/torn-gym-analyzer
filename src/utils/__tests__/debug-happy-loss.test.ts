import { describe, it, expect } from 'vitest'
import { calculateHappyLoss } from '../calc'

describe('Debug Happy Loss Calculation', () => {
  it('should test happy loss for George\'s gym', () => {
    const energyPerTrain = 10 // George's uses 10 energy per train
    
    // Test the happy loss calculation
    const happyLoss = calculateHappyLoss(energyPerTrain, true) // useAverage = true
    console.log('Happy loss per train (George\'s):', happyLoss)
    
    // The formula is: Math.round(0.1 * energyPerTrain * factor)
    // Where factor = 5 for average
    const expectedHappyLoss = Math.round(0.1 * 10 * 5)
    console.log('Expected happy loss:', expectedHappyLoss)
    
    expect(happyLoss).toBe(expectedHappyLoss)
    expect(happyLoss).toBe(5) // Should be 5 for George's
  })

  it('should test happy progression over 40 trains', () => {
    let happy = 5100
    const energyPerTrain = 10
    const trains = 40
    
    console.log('Happy progression:')
    console.log('Initial happy:', happy)
    
    for (let i = 0; i < trains; i++) {
      const loss = calculateHappyLoss(energyPerTrain, true)
      happy = Math.max(0, happy - loss)
      if (i < 5 || i >= trains - 5) { // Show first and last 5 trains
        console.log(`Train ${i + 1}: Happy = ${happy} (lost ${loss})`)
      } else if (i === 5) {
        console.log('... (middle trains)')
      }
    }
    
    console.log('Final happy after 40 trains:', happy)
    expect(happy).toBe(4900) // Should match our debug output
  })
})
