// Stat-specific constants from the latest research
const STAT_CONSTANTS = {
  str: { A: 1600, B: 1700, C: 700 },
  def: { A: 2100, B: -600, C: 1500 },
  spd: { A: 1600, B: 2000, C: 1350 },
  dex: { A: 1800, B: 1500, C: 1000 }
};

export interface TrainingPerks {
  // Education bonuses
  sportsScience: boolean; // +2% all stats passive + +2% all gym gains
  nutritionalScience: boolean; // +2% STR/SPD passive
  analysisPerformance: boolean; // +2% DEF/DEX passive
  individualCourses: { str: number; def: number; spd: number; dex: number }; // 1-3% per stat
  
  // Book bonuses (31-day temporary)
  allStatsBook: boolean; // +25% all stats passive
  individualStatBooks: { str: boolean; def: boolean; spd: boolean; dex: boolean }; // 100% bonus to one stat
  generalGymBook: boolean; // +20% all gym gains
  specificGymBooks: { str: boolean; def: boolean; spd: boolean; dex: boolean }; // 30% bonus to one stat
  
  // Faction bonuses
  aggression: number; // 0-20% STR/SPD passive
  suppression: number; // 0-20% DEF/DEX passive
  steadfast: { str: number; def: number; spd: number; dex: number }; // 0-20% gym gains per stat
  
  // Company & Job bonuses
  heavyLifting: number; // Job points for STR equivalent
  rockSalt: number; // Job points for DEF equivalent
  roidRage: number; // Job points for STR equivalent
  sportsShoes: boolean; // +5% SPD gym gains
  
  // Merit bonuses (from existing system)
  merits: { str: number; def: number; spd: number; dex: number }; // percentage bonuses
}

/**
 * Calculate effective stats (what you see in combat)
 */
export function calculateEffectiveStats(
  baseStats: { str: number; def: number; spd: number; dex: number },
  perks: TrainingPerks
): { str: number; def: number; spd: number; dex: number } {
  const result = { ...baseStats };
  
  (['str', 'def', 'spd', 'dex'] as const).forEach(stat => {
    let multiplier = 1;
    
    // Sports Science Bachelor: +2% all stats
    if (perks.sportsScience) {
      multiplier *= 1.02;
    }
    
    // Nutritional Science: +2% STR/SPD
    if (perks.nutritionalScience && (stat === 'str' || stat === 'spd')) {
      multiplier *= 1.02;
    }
    
    // Analysis & Performance: +2% DEF/DEX
    if (perks.analysisPerformance && (stat === 'def' || stat === 'dex')) {
      multiplier *= 1.02;
    }
    
    // Individual courses: 1-3% per stat
    multiplier *= (1 + perks.individualCourses[stat] / 100);
    
    // All Stats Book: +25% all stats
    if (perks.allStatsBook) {
      multiplier *= 1.25;
    }
    
    // Individual stat books: 100% bonus to one stat
    if (perks.individualStatBooks[stat]) {
      multiplier *= 2.0;
    }
    
    // Faction bonuses
    if (perks.aggression > 0 && (stat === 'str' || stat === 'spd')) {
      multiplier *= (1 + perks.aggression / 100);
    }
    
    if (perks.suppression > 0 && (stat === 'def' || stat === 'dex')) {
      multiplier *= (1 + perks.suppression / 100);
    }
    
    result[stat] = Math.round(baseStats[stat] * multiplier);
  });
  
  return result;
}

/**
 * Calculate gym gains multiplier from all perks
 */
export function calculateGymGainsMultiplier(
  stat: 'str' | 'def' | 'spd' | 'dex',
  perks: TrainingPerks
): number {
  let multiplier = 1;
  
  // Sports Science Bachelor: +2% all gym gains
  if (perks.sportsScience) {
    multiplier *= 1.02;
  }
  
  // General Gym Book: +20% all gym gains
  if (perks.generalGymBook) {
    multiplier *= 1.20;
  }
  
  // Specific Gym Books: +30% to one stat
  if (perks.specificGymBooks[stat]) {
    multiplier *= 1.30;
  }
  
  // Steadfast faction bonuses: 1% per level to specific stats
  if (perks.steadfast[stat] > 0) {
    multiplier *= (1 + perks.steadfast[stat] / 100);
  }
  
  // Merit bonuses (existing system)
  if (perks.merits[stat] > 0) {
    multiplier *= (1 + perks.merits[stat] / 100);
  }
  
  // Sports Shoes: +5% SPD gym gains
  if (stat === 'spd' && perks.sportsShoes) {
    multiplier *= 1.05;
  }
  
  return multiplier;
}

/**
 * Calculate job point equivalent gains
 */
export function calculateJobPointGains(
  stat: 'str' | 'def' | 'spd' | 'dex',
  perks: TrainingPerks,
  energyUsed: number
): number {
  const JOB_POINT_ENERGY_EQUIVALENT = 4.5; // ~4.5E worth of gains per job point
  
  let jobPointGains = 0;
  
  if (stat === 'str') {
    jobPointGains += perks.heavyLifting * JOB_POINT_ENERGY_EQUIVALENT;
    jobPointGains += perks.roidRage * JOB_POINT_ENERGY_EQUIVALENT;
  }
  
  if (stat === 'def') {
    jobPointGains += perks.rockSalt * JOB_POINT_ENERGY_EQUIVALENT;
  }
  
  // Convert to actual gains based on energy used
  return (jobPointGains / energyUsed) * energyUsed;
}

/**
 * The new cutting-edge training formula
 */
export function computeGain(
  baseStat: number,
  happy: number,
  dots: number,
  energyUsed: number,
  stat: 'str' | 'def' | 'spd' | 'dex',
  perks: TrainingPerks
): number {
  // Calculate effective stat (what the formula uses)
  const effectiveStats = calculateEffectiveStats(
    { str: baseStat, def: baseStat, spd: baseStat, dex: baseStat },
    perks
  );
  const S = Math.min(effectiveStats[stat], 50000000); // Cap at 50M for formula
  
  const H = happy;
  const G = dots; // Gym dots on scale of 10
  const E = energyUsed;
  
  // Get stat-specific constants
  const constants = STAT_CONSTANTS[stat];
  const A = constants.A;
  const B = constants.B;
  // C is for randomness, which we exclude from calculations
  
  // The cutting-edge formula (excluding randomness)
  const happyTerm = Math.log(1 + H / 250);
  const roundedHappyTerm1 = Math.round(happyTerm * 10000) / 10000; // Round to 4 decimal places
  const happyMultiplier = 1 + 0.07 * roundedHappyTerm1;
  const roundedHappyMultiplier = Math.round(happyMultiplier * 10000) / 10000; // Round to 4 decimal places
  
  const happyPowerTerm = 8 * Math.pow(H, 1.05);
  
  const highHappyAdjustment = (1 - Math.pow(H / 99999, 2)) * A;
  
  const baseGain = (
    S * roundedHappyMultiplier + 
    happyPowerTerm + 
    highHappyAdjustment + 
    B
  ) * (1 / 200000) * G * E;
  
  // Apply all gym gains multipliers
  const gymGainsMultiplier = calculateGymGainsMultiplier(stat, perks);
  const finalGain = baseGain * gymGainsMultiplier;
  
  // Add job point equivalent gains
  const jobPointGains = calculateJobPointGains(stat, perks, energyUsed);
  
  return finalGain + jobPointGains;
}

/**
 * Calculate happy loss per train with realistic variance
 */
export function calculateHappyLoss(energyPerTrain: number, useAverage: boolean = true): number {
  // dH = ROUND((1/10) * ENERGYPERTRAIN * RANDBETWEEN(4,6), 0)
  if (useAverage) {
    return Math.round((1/10) * energyPerTrain * 5); // Use average of 5
  } else {
    // For more accurate simulation, we could randomize, but that would make results inconsistent
    // In practice, the sequence of 4,5,6 values affects the final result
    return Math.round((1/10) * energyPerTrain * 5); 
  }
}

/**
 * Calculate multiple trains with dynamic happy loss
 */
export function calculateMultipleTrains(
  baseStat: number,
  initialHappy: number,
  dots: number,
  energyPerTrain: number,
  numberOfTrains: number,
  stat: 'str' | 'def' | 'spd' | 'dex',
  perks: TrainingPerks
): { totalGain: number; finalHappy: number; gainsPerTrain: number[] } {
  let currentHappy = initialHappy;
  let totalGain = 0;
  const gainsPerTrain: number[] = [];
  
  for (let i = 0; i < numberOfTrains; i++) {
    const gain = computeGain(baseStat, currentHappy, dots, energyPerTrain, stat, perks);
    totalGain += gain;
    gainsPerTrain.push(gain);
    
    // Apply happy loss
    const happyLoss = calculateHappyLoss(energyPerTrain);
    currentHappy = Math.max(0, currentHappy - happyLoss);
  }
  
  return {
    totalGain,
    finalHappy: currentHappy,
    gainsPerTrain
  };
}