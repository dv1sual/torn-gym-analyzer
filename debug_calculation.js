// Debug calculation for the specific case provided
const settings = {
  "stats": {
    "str": 0,
    "def": 0,
    "spd": 303304576,
    "dex": 0
  },
  "happy": 5100,
  "energy": 400,
  "selectedGym": "George's",
  "energyAllocation": {
    "str": 0,
    "def": 0,
    "spd": 100,
    "dex": 0
  },
  "propertyPerks": 2,
  "educationStatSpecific": 1,
  "educationGeneral": 1,
  "jobPerks": 0,
  "bookPerks": 0,
  "steadfastBonus": {
    "str": 7,
    "def": 7,
    "spd": 7,
    "dex": 7
  },
  "dynamicHappy": true,
  "darkMode": true
};

// Expected results:
// Calculator: +1,015,722.78
// Spreadsheet: +1,054,251.38
// Difference: 38,528.60 (3.8% higher in spreadsheet)

console.log('Settings:', JSON.stringify(settings, null, 2));
console.log('Calculator result: +1,015,722.78');
console.log('Spreadsheet result: +1,054,251.38');
console.log('Difference: 38,528.60 (spreadsheet is 3.8% higher)');

// Let's analyze the key parameters:
console.log('\nKey parameters:');
console.log('- Speed stat: 303,304,576 (very high, will hit stat cap)');
console.log('- Happy: 5,100');
console.log('- Energy: 400');
console.log('- Gym: George\'s (7.30 SPD dots, 10 energy per train)');
console.log('- Energy allocation: 100% to SPD');
console.log('- Total bonuses: 2% + 1% + 1% = 4% from perks');
console.log('- Steadfast: 7% SPD bonus');
console.log('- Dynamic happy: true (happy decreases during training)');

// Trains calculation:
console.log('\nTrains calculation:');
console.log('- Trains per session: 400 energy / 10 energy = 40 trains');
console.log('- All energy goes to SPD (100% allocation)');

// This suggests the issue might be in:
// 1. Stat cap calculation at very high stats
// 2. Happy multiplier precision
// 3. Steadfast bonus application
// 4. Dynamic happy loss calculation
