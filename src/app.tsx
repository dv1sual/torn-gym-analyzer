import React, { useState, useEffect } from 'react';
import { gyms } from './data/gyms';
import { computeGain } from './utils/calc';
import GymSelector from './components/GymSelector';
import StatsInput from './components/StatsInput';
import HappyEnergyInput from './components/HappyEnergyInput';
import MultipliersInput from './components/MultipliersInput';
import Results from './components/Results';
import ToggleSwitch from './components/ToggleSwitch';

export default function App() {
  const [stats, setStats] = useState({ str: 0, def: 0, spd: 0, dex: 0 });
  const [multipliers, setMultipliers] = useState({ str: 1, def: 1, spd: 1, dex: 1 });
  const [happy, setHappy] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [selectedGym, setSelectedGym] = useState(gyms[0].name);
  const [results, setResults] = useState<any[]>([]);
  const [dynamicHappy, setDynamicHappy] = useState(false);
  const [ecstasy, setEcstasy] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [darkMode]);

  const runSimulation = () => {
    const sessionResults = gyms.map((gym) => {
      const trains = Math.floor(energy / gym.energy);
      let currentHappy = ecstasy ? happy * 2 : happy;
      const perStat = { str: 0, def: 0, spd: 0, dex: 0 };
      let total = 0;

      for (let i = 0; i < trains; i++) {
        (['str', 'def', 'spd', 'dex'] as const).forEach((key) => {
          const gain = computeGain(stats[key], currentHappy, gym.dots[key], gym.energy) * multipliers[key];
          perStat[key] += gain;
          total += gain;
        });
        if (dynamicHappy) {
          currentHappy = Math.max(0, currentHappy - gym.energy * 5);
        }
      }

      return { name: gym.name, perStat, total };
    });

    setResults(sessionResults);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              💪 Torn Gym Analyzer
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Calculate and optimize your gym training gains with precision
            </p>
          </div>

          {/* Main Form */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-600 p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Current Stats
                  </h3>
                  <StatsInput stats={stats} onChange={setStats} />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    Training Setup
                  </h3>
                  <HappyEnergyInput happy={happy} energy={energy} onChange={(h, e) => { setHappy(h); setEnergy(e); }} />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    Multipliers
                  </h3>
                  <MultipliersInput multipliers={multipliers} onChange={setMultipliers} />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🏋️</span>
                    Gym Selection
                  </h3>
                  <GymSelector gyms={gyms} selected={selectedGym} onChange={setSelectedGym} />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                Settings
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <ToggleSwitch label="Dark Mode" enabled={darkMode} onToggle={setDarkMode} />
                <ToggleSwitch label="Ecstasy (×2 Happy)" enabled={ecstasy} onToggle={setEcstasy} />
              </div>
            </div>

            {/* Compute Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={runSimulation}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 text-lg"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🔥</span>
                  Compute Maximum Gains
                  <span className="text-2xl">🔥</span>
                </span>
              </button>
            </div>
          </div>

          {/* Results */}
          <Results results={results} selected={selectedGym} />
          
          {/* Footer Credit */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
              2025 - dv1sual
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}