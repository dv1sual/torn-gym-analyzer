export interface Gym {
  name: string;
  energy: number;
  dots: { str: number; spd: number; def: number; dex: number };
}

export const gyms: Gym[] = [
  // Low Energy (5E) Gyms
  { name: 'Premier Fitness', energy: 5, dots: { str: 2.0, spd: 2.0, def: 2.0, dex: 2.0 } },
  { name: 'Average Joes', energy: 5, dots: { str: 2.4, spd: 2.4, def: 2.8, dex: 2.4 } },
  { name: "Woody's Workout", energy: 5, dots: { str: 2.8, spd: 3.2, def: 3.0, dex: 2.8 } },
  { name: 'Beach Bods', energy: 5, dots: { str: 3.2, spd: 3.2, def: 3.2, dex: 0.0 } },
  { name: 'Silver Gym', energy: 5, dots: { str: 3.4, spd: 3.6, def: 3.4, dex: 3.2 } },
  { name: 'Pour Femme', energy: 5, dots: { str: 3.4, spd: 3.6, def: 3.6, dex: 3.8 } },
  { name: 'Davies Den', energy: 5, dots: { str: 3.7, spd: 0.0, def: 3.7, dex: 3.7 } },
  { name: 'Global Gym', energy: 5, dots: { str: 4.0, spd: 4.0, def: 4.0, dex: 4.0 } },
  { name: 'The Jail Gym', energy: 5, dots: { str: 3.4, spd: 3.4, def: 4.6, dex: 0.0 } },
  
  // Medium Energy (10E) Gyms
  { name: 'Knuckle Heads', energy: 10, dots: { str: 4.8, spd: 4.4, def: 4.0, dex: 4.2 } },
  { name: 'Pioneer Fitness', energy: 10, dots: { str: 4.4, spd: 4.6, def: 4.8, dex: 4.4 } },
  { name: 'Anabolic Anomalies', energy: 10, dots: { str: 5.0, spd: 4.6, def: 5.2, dex: 4.6 } },
  { name: 'Core', energy: 10, dots: { str: 5.0, spd: 5.2, def: 5.0, dex: 5.0 } },
  { name: 'Racing Fitness', energy: 10, dots: { str: 5.0, spd: 5.4, def: 4.8, dex: 5.2 } },
  { name: 'Complete Cardio', energy: 10, dots: { str: 5.5, spd: 5.8, def: 5.5, dex: 5.2 } },
  { name: 'Legs Bums & Tums', energy: 10, dots: { str: 0.0, spd: 5.6, def: 5.6, dex: 5.8 } },
  { name: 'Deep Burn', energy: 10, dots: { str: 6.0, spd: 6.0, def: 6.0, dex: 6.0 } },
  { name: 'Apollo Gym', energy: 10, dots: { str: 6.0, spd: 6.2, def: 6.4, dex: 6.2 } },
  { name: 'Gun Shop', energy: 10, dots: { str: 6.6, spd: 6.4, def: 6.2, dex: 6.2 } },
  { name: 'Force Training', energy: 10, dots: { str: 6.4, spd: 6.6, def: 6.4, dex: 6.8 } },
  { name: "Cha Cha's", energy: 10, dots: { str: 6.4, spd: 6.4, def: 6.8, dex: 7.0 } },
  { name: 'Atlas', energy: 10, dots: { str: 7.0, spd: 6.4, def: 6.4, dex: 6.6 } },
  { name: 'Last Round', energy: 10, dots: { str: 6.8, spd: 6.6, def: 7.0, dex: 6.6 } },
  { name: 'The Edge', energy: 10, dots: { str: 6.8, spd: 7.0, def: 7.0, dex: 6.8 } },
  { name: "George's", energy: 10, dots: { str: 7.3, spd: 7.3, def: 7.3, dex: 7.3 } },
  
  // Special Energy (25E) Gyms
  { name: 'Balboas Gym', energy: 25, dots: { str: 0.0, spd: 0.0, def: 7.5, dex: 7.5 } },
  { name: 'Frontline Fitness', energy: 25, dots: { str: 7.5, spd: 7.5, def: 0.0, dex: 0.0 } },
  { name: 'Sports Science Lab', energy: 25, dots: { str: 9.0, spd: 9.0, def: 9.0, dex: 9.0 } },
  
  // Special Energy (50E) Gyms
  { name: 'Gym 3000', energy: 50, dots: { str: 8.0, spd: 0.0, def: 0.0, dex: 0.0 } },
  { name: 'Mr. Isoyamas', energy: 50, dots: { str: 0.0, spd: 0.0, def: 8.0, dex: 0.0 } },
  { name: 'Total Rebound', energy: 50, dots: { str: 0.0, spd: 8.0, def: 0.0, dex: 0.0 } },
  { name: 'Elites', energy: 50, dots: { str: 0.0, spd: 0.0, def: 0.0, dex: 8.0 } }
];