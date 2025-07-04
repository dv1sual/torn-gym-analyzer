// ================================================================
// calc.ts – Torn gym‑gain estimator (fault‑tolerant, July‑2025 patch)
// ================================================================

// ----------------------------------------------------------------
// 1.  Stat‑specific regression constants (unchanged)
// ----------------------------------------------------------------
const STAT_CONSTANTS = {
  str: { A: 1600, B: 1700, C: 700 },
  def: { A: 2100, B: -600, C: 1500 },
  spd: { A: 1600, B: 2000, C: 1350 },
  dex: { A: 1800, B: 1500, C: 1000 },
} as const;

type StatKey = 'str' | 'def' | 'spd' | 'dex';

// ----------------------------------------------------------------
// 1b.  Authoritative gym‑dot table (2025‑07‑04 live tooltip scrape)
//      Note: The in‑game tooltips now show **two‑decimal** gains. The
//      Wiki has not been fully updated – these figures are the real
//      ones currently shown in Torn.
// ----------------------------------------------------------------
export const GYM_GAINS: Record<string, Record<StatKey, number>> = {
  // ————— LIGHT‑WEIGHT (5E) —————
  'Premier Fitness':           { str: 2.00, spd: 2.00, def: 2.00, dex: 2.00 },
  'Average Joes':              { str: 2.40, spd: 2.40, def: 2.70, dex: 2.40 },
  "Woody's Workout":           { str: 2.70, spd: 3.20, def: 3.00, dex: 2.70 },
  'Beach Bods':                { str: 3.20, spd: 3.20, def: 3.20, dex: 0.00 },
  'Silver Gym':                { str: 3.40, spd: 3.60, def: 3.40, dex: 3.20 },
  'Pour Femme':                { str: 3.40, spd: 3.60, def: 3.60, dex: 3.80 },
  'Davies Den':                { str: 3.70, spd: 0.00, def: 3.70, dex: 3.70 },
  'Global Gym':                { str: 4.00, spd: 4.00, def: 4.00, dex: 4.00 },

  // ————— MIDDLE‑WEIGHT (10E) —————
  'Knuckle Heads':             { str: 4.67, spd: 4.25, def: 3.94, dex: 4.13 },
  'Pioneer Fitness':           { str: 4.38, spd: 4.60, def: 4.82, dex: 4.38 },
  'Anabolic Anomalies':        { str: 4.96, spd: 4.55, def: 5.23, dex: 4.55 },
  'Core':                      { str: 4.98, spd: 5.21, def: 4.98, dex: 4.98 },
  'Racing Fitness':            { str: 4.98, spd: 5.38, def: 4.78, dex: 5.18 },
  'Complete Cardio':           { str: 5.45, spd: 5.67, def: 5.46, dex: 5.17 },
  'Legs, Bums and Tums':       { str: 0.00, spd: 5.48, def: 5.48, dex: 5.67 },
  'Deep Burn':                 { str: 5.96, spd: 5.96, def: 5.96, dex: 5.96 },

  // ————— HEAVY‑WEIGHT (10E) —————
  'Apollo Gym':                { str: 5.97, spd: 6.17, def: 6.37, dex: 6.17 },
  'Gun Shop':                  { str: 6.46, spd: 6.37, def: 6.17, dex: 6.17 },
  'Force Training':            { str: 6.39, spd: 6.49, def: 6.39, dex: 6.75 },
  "Cha Cha's":                 { str: 6.38, spd: 6.38, def: 6.78, dex: 6.98 },
  'Atlas':                     { str: 6.98, spd: 6.38, def: 6.38, dex: 6.48 },
  'Last Round':                { str: 6.79, spd: 6.48, def: 6.98, dex: 6.48 },
  'The Edge':                  { str: 6.79, spd: 6.98, def: 6.98, dex: 6.79 },
  "George's":                  { str: 7.25, spd: 7.25, def: 7.25, dex: 7.25 },

  // ————— SPECIALIST —————
  'Balboas Gym':               { str: 0.00, spd: 0.00, def: 7.50, dex: 7.50 },
  'Frontline Fitness':         { str: 7.50, spd: 7.50, def: 0.00, dex: 0.00 },
  'Gym 3000':                  { str: 8.00, spd: 0.00, def: 0.00, dex: 0.00 },
  'Mr. Isoyamas':              { str: 0.00, spd: 0.00, def: 8.00, dex: 0.00 },
  'Total Rebound':             { str: 0.00, spd: 8.00, def: 0.00, dex: 0.00 },
  'Elites':                    { str: 0.00, spd: 0.00, def: 0.00, dex: 8.00 },
  'Sports Science Lab':        { str: 9.00, spd: 9.00, def: 9.00, dex: 9.00 },

  // ————— OTHER —————
  'The Jail Gym':              { str: 3.40, spd: 3.40, def: 4.60, dex: 0.00 },
};

// ----------------------------------------------------------------
// 2.  Training‑perk interface (unchanged – trimmed to save space)
// ----------------------------------------------------------------
export interface TrainingPerks {
  sportsScience?: boolean;
  nutritionalScience?: boolean;
  analysisPerformance?: boolean;
  individualCourses?: Partial<Record<StatKey, number>>;
  monthlyBookBonus?: Partial<Record<StatKey, number>>;
  generalGymBook?: boolean;
  specificGymBooks?: Partial<Record<StatKey, boolean>>;
  heavyLifting?: number;
  roidRage?: number;
  rockSalt?: number;
  steadfast?: Partial<Record<StatKey, number>>;
  merits?: Partial<Record<StatKey, number>>;
  sportsShoes?: boolean;
  manualGymBonusPercent?: Partial<Record<StatKey, number>>;
}
const NO_PERKS: TrainingPerks = {};

// ----------------------------------------------------------------
// 3.  Single‑train estimator (unchanged formula)
// ----------------------------------------------------------------
export function computeGain(
  baseStat: number,
  happy: number,
  gymName: string,
  energyUsed: number,
  stat: StatKey,
  perks: TrainingPerks = NO_PERKS,
): number {
  const S = Math.min(
    calculateEffectiveStats({ str: baseStat, def: baseStat, spd: baseStat, dex: baseStat }, perks)[stat],
    50_000_000,
  );
  const G = GYM_GAINS[gymName]?.[stat] ?? 4.0;
  const { A, B, C } = STAT_CONSTANTS[stat];
  const happyMult  = 1 + 0.07 * Math.log(1 + happy / 250);
  const core       = S * happyMult + 8 * happy ** 1.05 + (1 - (happy / 99_999) ** 2) * A + B;
  const baseGain   = (core * G * energyUsed) / 200_000;
  const avgRandom  = (C / 2) * G * energyUsed / 200_000;
  const gymMult    = calculateGymGainsMultiplier(stat, perks);
  const jobPts     = calculateJobPointGains(stat, perks, energyUsed);
  return +((baseGain + avgRandom) * gymMult + jobPts).toFixed(2);
}

// ----------------------------------------------------------------
// 4.  Happy loss per train (average or stochastic)
// ----------------------------------------------------------------
export function calculateHappyLoss(energyPerTrain: number, useAverage = true): number {
  const factor = useAverage ? 5 : (Math.floor(Math.random() * 3) + 4); // 4–6
  return Math.round(0.1 * energyPerTrain * factor);
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

  // Global gym‑gain modifiers
  if (perks.sportsScience)        m *= 1.02;   // +2 %
  if (perks.generalGymBook)       m *= 1.20;   // +20 % all stats
  if (perks.specificGymBooks?.[stat]) m *= 1.30;  // +30 % this stat

  // Faction & merit modifiers (multiplicative)
  if ((perks.steadfast?.[stat] ?? 0) > 0) m *= 1 + (perks.steadfast![stat]! / 100);
  if ((perks.merits?.[stat]    ?? 0) > 0) m *= 1 + (perks.merits![stat]! / 100);

  // Misc modifiers
  if (stat === 'spd' && perks.sportsShoes) m *= 1.05; // +5 % SPD only

  // UI‑supplied “red‑box” bonus: the greater of manualGymBonusPercent **or** monthlyBookBonus
  const uiBonus = (perks.manualGymBonusPercent?.[stat] ?? perks.monthlyBookBonus?.[stat] ?? 0);
  if (uiBonus > 0) m *= 1 + uiBonus / 100;

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

// 8.  Batch simulation helper
// ----------------------------------------------------------------
export function calculateMultipleTrains(
  baseStat: number,
  initialHappy: number,
  gymName: string,
  energyPerTrain: number,
  trains: number,
  stat: StatKey,
  perks: TrainingPerks = NO_PERKS,
) {
  let total = 0;
  let H = initialHappy;
  const perTrain: number[] = [];
  for (let i = 0; i < trains; i++) {
    const g = computeGain(baseStat, H, gymName, energyPerTrain, stat, perks);
    perTrain.push(g);
    total += g;
    H = Math.max(0, H - calculateHappyLoss(energyPerTrain));
  }
  return { totalGain: total, finalHappy: H, gainsPerTrain: perTrain };
}
