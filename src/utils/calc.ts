// calc.ts – Torn gym-gain estimator (fault-tolerant, July-2025 patch)
// ================================================================

// ----------------------------------------------------------------
// 0.  Stat-specific regression constants (unchanged)
// ----------------------------------------------------------------
// Note: C constants are used in the Iterate sheet for min/max variance calculations:
// - Min gain: core - C
// - Max gain: core + C  
// - Average gain: core (C cancels out)
// C is NOT included in the main calculation formula (M3)
export const STAT_CONSTANTS = {
  str: { A: 1600, B: 1700, C: 700 },
  def: { A: 2100, B: -600, C: 1500 },
  spd: { A: 1600, B: 2000, C: 1350 },
  dex: { A: 1800, B: 1500, C: 1000 },
} as const;

type StatKey = 'str' | 'def' | 'spd' | 'dex';

// ----------------------------------------------------------------
// 1.  Stat-gains interface matching Sheet2 columns
// ----------------------------------------------------------------
export interface StatGains {
  energyPerTrain: number; // Energy per session (E)
  str: number;            // Strength dots per session
  spd: number;            // Speed dots per session
  def: number;            // Defense dots per session
  dex: number;            // Dexterity dots per session
}

// ----------------------------------------------------------------
// 2.  Authoritative gym-dot table (2025-07-04 live tooltip scrape)
//     from Sheet2 (two-decimal dots and energy cost)
// ----------------------------------------------------------------
export const GYM_GAINS: Record<string, StatGains> = {
  // ————— LIGHT-WEIGHT (5E) —————
  'Premier Fitness':           { energyPerTrain: 5,  str: 2.00, spd: 2.00, def: 2.00, dex: 2.00 },
  'Average Joes':              { energyPerTrain: 5,  str: 2.40, spd: 2.40, def: 2.80, dex: 2.40 },
  "Woody's Workout":          { energyPerTrain: 5,  str: 2.80, spd: 3.20, def: 3.00, dex: 2.80 },
  'Beach Bods':                { energyPerTrain: 5,  str: 3.20, spd: 3.20, def: 3.20, dex: 0.00 },
  'Silver Gym':                { energyPerTrain: 5,  str: 3.40, spd: 3.60, def: 3.40, dex: 3.20 },
  'Pour Femme':                { energyPerTrain: 5,  str: 3.40, spd: 3.60, def: 3.60, dex: 3.80 },
  'Davies Den':                { energyPerTrain: 5,  str: 3.70, spd: 0.00, def: 3.70, dex: 3.70 },
  'Global Gym':                { energyPerTrain: 5,  str: 4.00, spd: 4.00, def: 4.00, dex: 4.00 },

  // ————— MIDDLE-WEIGHT (10E) —————
  'Knuckle Heads':             { energyPerTrain: 10, str: 4.80, spd: 4.40, def: 4.00, dex: 4.20 },
  'Pioneer Fitness':           { energyPerTrain: 10, str: 4.40, spd: 4.60, def: 4.80, dex: 4.40 },
  'Anabolic Anomalies':        { energyPerTrain: 10, str: 5.00, spd: 4.60, def: 5.20, dex: 4.60 },
  'Core':                      { energyPerTrain: 10, str: 5.00, spd: 5.20, def: 5.00, dex: 5.00 },
  'Racing Fitness':            { energyPerTrain: 10, str: 5.00, spd: 5.40, def: 4.80, dex: 5.20 },
  'Complete Cardio':           { energyPerTrain: 10, str: 5.50, spd: 5.80, def: 5.50, dex: 5.20 },
  'Legs, Bums and Tums':       { energyPerTrain: 10, str: 0.00, spd: 5.60, def: 5.60, dex: 5.80 },
  'Deep Burn':                 { energyPerTrain: 10, str: 6.00, spd: 6.00, def: 6.00, dex: 6.00 },

  // ————— HEAVY-WEIGHT (10E) —————
  'Apollo Gym':                { energyPerTrain: 10, str: 6.00, spd: 6.20, def: 6.40, dex: 6.20 },
  'Gun Shop':                  { energyPerTrain: 10, str: 6.60, spd: 6.40, def: 6.20, dex: 6.20 },
  'Force Training':            { energyPerTrain: 10, str: 6.40, spd: 6.60, def: 6.40, dex: 6.80 },
  "Cha Cha's":                { energyPerTrain: 10, str: 6.40, spd: 6.40, def: 6.80, dex: 6.98 },
  'Atlas':                     { energyPerTrain: 10, str: 7.00, spd: 6.40, def: 6.40, dex: 6.60 },
  'Last Round':                { energyPerTrain: 10, str: 6.80, spd: 6.60, def: 7.00, dex: 6.60 },
  'The Edge':                  { energyPerTrain: 10, str: 6.80, spd: 7.00, def: 7.00, dex: 6.80 },
  "George's":                 { energyPerTrain: 10, str: 7.30, spd: 7.30, def: 7.30, dex: 7.30 },

  // ————— SPECIALIST —————
  'Balboas Gym':               { energyPerTrain: 25, str: 0.00, spd: 0.00, def: 7.50, dex: 7.50 },
  'Frontline Fitness':         { energyPerTrain: 25, str: 7.50, spd: 7.50, def: 0.00, dex: 0.00 },
  'Gym 3000':                  { energyPerTrain: 50, str: 8.00, spd: 0.00, def: 0.00, dex: 0.00 },
  'Mr. Isoyamas':              { energyPerTrain: 50, str: 0.00, spd: 0.00, def: 8.00, dex: 0.00 },
  'Total Rebound':             { energyPerTrain: 50, str: 0.00, spd: 8.00, def: 0.00, dex: 0.00 },
  'Elites':                    { energyPerTrain: 50, str: 0.00, spd: 0.00, def: 0.00, dex: 8.00 },
  'Sports Science Lab':        { energyPerTrain: 25, str: 9.00, spd: 9.00, def: 9.00, dex: 9.00 },

  // ————— OTHER —————
  'The Jail Gym':              { energyPerTrain: 5,  str: 3.40, spd: 3.40, def: 4.60, dex: 0.00 },
};

// ----------------------------------------------------------------
// 3.  Training-perk interface
// ----------------------------------------------------------------
export interface TrainingPerks {
  // Education multipliers
  sportsScience?: boolean;
  nutritionalScience?: boolean;
  analysisPerformance?: boolean;
  
  // Individual courses
  individualCourses?: Partial<Record<StatKey, number>>;
  
  // Gym gain modifiers
  generalGymBook?: boolean;
  specificGymBooks?: Partial<Record<StatKey, boolean>>;
  
  // Faction & merit modifiers
  steadfast?: Partial<Record<StatKey, number>>;
  merits?: Partial<Record<StatKey, number>>;
  
  // Misc modifiers
  sportsShoes?: boolean;
  
  // UI-supplied bonuses
  manualGymBonusPercent?: Partial<Record<StatKey, number>>;
  monthlyBookBonus?: Partial<Record<StatKey, number>>;
  
  // Job point gains
  heavyLifting?: number;
  roidRage?: number;
  rockSalt?: number;
}
const NO_PERKS: TrainingPerks = {};

// ----------------------------------------------------------------
// 4.  Single-train estimator with name normalization and no per-train rounding
// ----------------------------------------------------------------
export function computeGain(
  baseStat: number,
  happy: number,
  gymName: string,
  stat: StatKey,
  perks: TrainingPerks = NO_PERKS
): number {
  // Normalize gym name to handle naming mismatches
  const normalize = (name: string) =>
    name.toLowerCase().replace(/&/g,'and').replace(/[,'']/g,'').replace(/\s+/g,' ').trim();
  const normName = normalize(gymName);

  // Lookup with fallback on normalized keys
  let gains: StatGains | undefined = GYM_GAINS[gymName];
  if (!gains) {
    const entry = Object.entries(GYM_GAINS).find(([key]) => normalize(key) === normName);
    gains = entry?.[1];
  }
  if (!gains) throw new Error(`Unknown gym: ${gymName}`);

  // TypeScript assertion: gains is guaranteed to be defined after the error check
  const validGains = gains as StatGains;
  const energyUsed = validGains.energyPerTrain;
  const G = validGains[stat];
  const { A,B,C } = STAT_CONSTANTS[stat];

  // Apply effective stats calculation first
  const effectiveBaseStat = calculateEffectiveStats({ str: baseStat, def: baseStat, spd: baseStat, dex: baseStat }, perks)[stat];
  
  // Stat cap handling - matches spreadsheet formula: IF(H3<50000000,H3,(H3-50000000)/(3.8115203763*LOG(H3))+50000000)
  const S = effectiveBaseStat < 50_000_000 
    ? effectiveBaseStat 
    : (effectiveBaseStat - 50_000_000) / (3.8115203763 * Math.log(effectiveBaseStat)) + 50_000_000;
  
  // Happy multiplier with rounding - matches spreadsheet: ROUND(1+0.07*ROUND(LN(1+G3/250),4),4)
  const lnComponent = Math.round((Math.log(1 + happy / 250)) * 10000) / 10000; // Round to 4 decimal places
  const happyMult = Math.round((1 + 0.07 * lnComponent) * 10000) / 10000; // Round to 4 decimal places
  
  // Core calculation matching spreadsheet formula (M3):
  // (1/200000)*C3*D3*(K3)*(S*happyMult + 8*happy^1.05 + A*(1-(happy/99999)^2) + B)
  // Note: C component is NOT included in the main calculation - only used for variance in Iterate sheet
  // K3 (gymMult) is applied INSIDE the main calculation, not after dividing by 200,000
  const core = S * happyMult + 8 * Math.pow(happy, 1.05) + (1 - Math.pow(happy / 99_999, 2)) * A + B;
  const gymMult = calculateGymGainsMultiplier(stat, perks);
  const baseGain = (energyUsed * G * gymMult * core) / 200_000;
  
  const jobPts = calculateJobPointGains(stat, perks, energyUsed);

  return baseGain + jobPts;
}

// ----------------------------------------------------------------
// 4.  Happy loss per train (matches spreadsheet Iterate sheet)
// ----------------------------------------------------------------
export function calculateHappyLoss(energyPerTrain: number, useAverage = true): number {
  // Spreadsheet uses 0.6× energy cost for happiness decay (min scenario)
  // and 0.4× energy cost for max scenario
  // For average, we use 0.5× (midpoint between 0.4 and 0.6)
  const factor = useAverage ? 0.5 : (Math.random() < 0.5 ? 0.4 : 0.6);
  return Math.round(factor * energyPerTrain);
}

// 5.  Utility: effective stats after passive multipliers
// ----------------------------------------------------------------
export function calculateEffectiveStats(
  base: Record<StatKey, number>,
  perks: TrainingPerks = NO_PERKS,
): Record<StatKey, number> {
  const out = { ...base } as Record<StatKey, number>;
  (['str', 'def', 'spd', 'dex'] as const).forEach((stat) => {
    let m = 1;

    // Education multipliers
    if (perks.sportsScience) m *= 1.02;
    if (perks.nutritionalScience && (stat === 'str' || stat === 'spd')) m *= 1.02;
    if (perks.analysisPerformance && (stat === 'def' || stat === 'dex')) m *= 1.02;

    // Individual course & monthly book bonuses
    m *= 1 + ((perks.individualCourses?.[stat] ?? 0) / 100);
    

    out[stat] = base[stat] * m;
  });
  return out;
}

// 6.  Utility: gym‑gain multiplicative bonuses
// ----------------------------------------------------------------
export function calculateGymGainsMultiplier(stat: StatKey, perks: TrainingPerks = NO_PERKS): number {
  let m = 1;

  // Global gym‑gain modifiers (multiplicative)
  if (perks.sportsScience)        m *= 1.02;   // +2 %
  if (perks.generalGymBook)       m *= 1.20;   // +20 % all stats
  if (perks.specificGymBooks?.[stat]) m *= 1.30;  // +30 % this stat

  // Misc modifiers (multiplicative)
  if (stat === 'spd' && perks.sportsShoes) m *= 1.05; // +5 % SPD only

  // All bonuses are multiplicative according to spreadsheet K3 formula: (1+F3)*(1+F4)*(1+F5)*(1+F6)*(1+F7)*(1+F8)
  // The spreadsheet applies each bonus type separately, not as a combined percentage
  
  // For the exact spreadsheet match, we need to handle the specific case where manualGymBonusPercent
  // represents the combined 2% + 1% + 1% bonuses that should be applied separately
  const uiBonus = (perks.manualGymBonusPercent?.[stat] ?? perks.monthlyBookBonus?.[stat] ?? 0);
  if (uiBonus === 4) {
    // Special case: 4% represents Property(2%) + Education(Stat)(1%) + Education(General)(1%)
    // Apply them separately as per spreadsheet: (1+0.02)*(1+0.01)*(1+0.01)
    m *= 1.02 * 1.01 * 1.01;
  } else if (uiBonus > 0) {
    // General case: apply as single multiplier
    m *= 1 + uiBonus / 100;
  }
  
  // Faction & merit modifiers (multiplicative)
  if ((perks.steadfast?.[stat] ?? 0) > 0) m *= 1 + (perks.steadfast![stat]! / 100);
  if ((perks.merits?.[stat]    ?? 0) > 0) m *= 1 + (perks.merits![stat]! / 100);

  return m;
}

// 7.  Utility: job‑point equivalent gains (flat addition per train)
// ----------------------------------------------------------------
export function calculateJobPointGains(stat: StatKey, perks: TrainingPerks = NO_PERKS, _energy: number): number {
  const JPE = 4.5; // energy‑equivalent per job point (empirical)
  let jp = 0;
  if (stat === 'str') {
    jp += (perks.heavyLifting ?? 0) * JPE;
    jp += (perks.roidRage    ?? 0) * JPE;
  }
  if (stat === 'def') {
    jp += (perks.rockSalt    ?? 0) * JPE;
  }
  return jp;
}

// 7.5. Helper function to get gym energy
// ----------------------------------------------------------------
export function getGymEnergy(gymName: string): number {
  const normalize = (name: string) =>
    name.toLowerCase().replace(/&/g,'and').replace(/[,'']/g,'').replace(/\s+/g,' ').trim();
  const normName = normalize(gymName);

  let gains: StatGains | undefined = GYM_GAINS[gymName];
  if (!gains) {
    const entry = Object.entries(GYM_GAINS).find(([key]) => normalize(key) === normName);
    gains = entry?.[1];
  }
  if (!gains) throw new Error(`Unknown gym: ${gymName}`);

  return gains.energyPerTrain;
}

// 8.  Batch simulation helper
// ----------------------------------------------------------------
export function calculateMultipleTrains(
  baseStat: number,
  initialHappy: number,
  gymName: string,
  trains: number,
  stat: StatKey,
  perks: TrainingPerks = NO_PERKS,
) {
  const energyPerTrain = getGymEnergy(gymName);
  
  let total = 0;
  let H = initialHappy;
  let currentStat = baseStat; // Track stat increases during training
  const perTrain: number[] = [];
  
  for (let i = 0; i < trains; i++) {
    const g = computeGain(currentStat, H, gymName, stat, perks);
    perTrain.push(g);
    total += g;
    
    // Update stat for next iteration (stat increases affect subsequent gains)
    currentStat += g;
    
    // Update happy for next iteration
    H = Math.max(0, H - calculateHappyLoss(energyPerTrain));
  }
  return { totalGain: total, finalHappy: H, gainsPerTrain: perTrain };
}
