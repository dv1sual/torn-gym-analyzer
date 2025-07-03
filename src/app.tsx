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

  // Faction bonuses state
  const [factionBonuses, setFactionBonuses] = useState({
    str: 0,
    def: 0,
    spd: 0,
    dex: 0
  });

  // Energy allocation state
  const [energyAllocation, setEnergyAllocation] = useState({
    str: 25,
    def: 25,
    spd: 25,
    dex: 25
  });

  const [allocationResults, setAllocationResults] = useState<any>(null);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [darkMode]);

  const calculateEnergyAllocation = (gym: any, allocation: any) => {
    const totalAllocation = allocation.str + allocation.def + allocation.spd + allocation.dex;
    const energyPerStat = {
      str: Math.floor((energy * allocation.str) / totalAllocation),
      def: Math.floor((energy * allocation.def) / totalAllocation),
      spd: Math.floor((energy * allocation.spd) / totalAllocation),
      dex: Math.floor((energy * allocation.dex) / totalAllocation)
    };

    const trainsPerStat = {
      str: Math.floor(energyPerStat.str / gym.energy),
      def: Math.floor(energyPerStat.def / gym.energy),
      spd: Math.floor(energyPerStat.spd / gym.energy),
      dex: Math.floor(energyPerStat.dex / gym.energy)
    };

    const gainsPerStat = { str: 0, def: 0, spd: 0, dex: 0 };
    let currentHappy = ecstasy ? happy * 2 : happy;

    (['str', 'def', 'spd', 'dex'] as const).forEach((key) => {
      for (let i = 0; i < trainsPerStat[key]; i++) {
        const baseGain = computeGain(stats[key], currentHappy, gym.dots[key], gym.energy);
        const meritMultiplier = multipliers[key];
        const factionBonus = 1 + (factionBonuses[key] / 100);
        const totalGain = baseGain * meritMultiplier * factionBonus;
        gainsPerStat[key] += totalGain;
        
        if (dynamicHappy) {
          currentHappy = Math.max(0, currentHappy - gym.energy * 5);
        }
      }
    });

    return {
      energyPerStat,
      trainsPerStat,
      gainsPerStat,
      totalGain: gainsPerStat.str + gainsPerStat.def + gainsPerStat.spd + gainsPerStat.dex
    };
  };

  const runSimulation = () => {
    const sessionResults = gyms.map((gym) => {
      const trains = Math.floor(energy / gym.energy);
      let currentHappy = ecstasy ? happy * 2 : happy;
      const perStat = { str: 0, def: 0, spd: 0, dex: 0 };
      let total = 0;

      for (let i = 0; i < trains; i++) {
        (['str', 'def', 'spd', 'dex'] as const).forEach((key) => {
          const baseGain = computeGain(stats[key], currentHappy, gym.dots[key], gym.energy);
          // Apply both merit multipliers and faction bonuses
          const meritMultiplier = multipliers[key];
          const factionBonus = 1 + (factionBonuses[key] / 100);
          const totalGain = baseGain * meritMultiplier * factionBonus;
          perStat[key] += totalGain;
          total += totalGain;
        });
        if (dynamicHappy) {
          currentHappy = Math.max(0, currentHappy - gym.energy * 5);
        }
      }

      return { name: gym.name, perStat, total };
    });

    setResults(sessionResults);

    // Calculate allocation for selected gym
    const selectedGymData = gyms.find(g => g.name === selectedGym);
    if (selectedGymData) {
      const allocationResult = calculateEnergyAllocation(selectedGymData, energyAllocation);
      setAllocationResults(allocationResult);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              💪 Gym Stats Calculator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Calculate and optimize your gym training gains with precision
            </p>
          </div>

          {/* Main Form */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-600 p-8 mb-8">
            <div className="space-y-8">
              {/* Top Row - Stats and Training Setup */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

              {/* Middle Row - Merit Bonuses */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  Merit Bonuses
                </h3>
                <MultipliersInput multipliers={multipliers} onChange={setMultipliers} />
              </div>

              {/* Energy Allocation Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚖️</span>
                  Energy Allocation
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      <strong>Energy Distribution:</strong> Allocate your total energy across stats as percentages. The calculator will determine optimal training splits for your selected gym.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(['str', 'def', 'spd', 'dex'] as const).map((key) => (
                      <div key={key} className="relative">
                        <label className={`block text-sm font-semibold mb-2 uppercase tracking-wide ${
                          key === 'str' ? 'text-red-600 dark:text-red-400' :
                          key === 'def' ? 'text-green-600 dark:text-green-400' :
                          key === 'spd' ? 'text-blue-600 dark:text-blue-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`}>
                          {key.toUpperCase()} Energy
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={energyAllocation[key]}
                            onChange={(e) => setEnergyAllocation(prev => ({
                              ...prev,
                              [key]: parseInt(e.target.value) || 0
                            }))}
                            className={`w-full px-3 py-2.5 pr-8 text-base font-medium bg-white dark:bg-gray-800 border-2 ${
                              key === 'str' ? 'border-red-200 dark:border-red-800 focus:border-red-500' :
                              key === 'def' ? 'border-green-200 dark:border-green-800 focus:border-green-500' :
                              key === 'spd' ? 'border-blue-200 dark:border-blue-800 focus:border-blue-500' :
                              'border-purple-200 dark:border-purple-800 focus:border-purple-500'
                            } rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100`}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className={`text-sm font-bold ${
                              key === 'str' ? 'text-red-600 dark:text-red-400' :
                              key === 'def' ? 'text-green-600 dark:text-green-400' :
                              key === 'spd' ? 'text-blue-600 dark:text-blue-400' :
                              'text-purple-600 dark:text-purple-400'
                            }`}>%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Total Allocation:</strong> {energyAllocation.str + energyAllocation.def + energyAllocation.spd + energyAllocation.dex}%
                      {(energyAllocation.str + energyAllocation.def + energyAllocation.spd + energyAllocation.dex) !== 100 && (
                        <span className="text-amber-600 dark:text-amber-400 ml-2">
                          (Should total 100% for optimal results)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Gym Selection */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏋️</span>
                  Gym Selection
                </h3>
                <GymSelector gyms={gyms} selected={selectedGym} onChange={setSelectedGym} />
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

            {/* Faction Bonuses */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                🎯 Faction Gym Gains (Steadfast)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Steadfast STR Slider */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
                  <label className="block text-lg font-bold text-red-700 dark:text-red-300 mb-4">
                    Steadfast STR Gym Gains: {factionBonuses.str}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={factionBonuses.str}
                    onChange={(e) => setFactionBonuses(prev => ({ 
                      ...prev, 
                      str: parseInt(e.target.value) 
                    }))}
                    className="w-full h-6 bg-red-200 rounded-lg appearance-none cursor-pointer dark:bg-red-700"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${factionBonuses.str * 5}%, #fca5a5 ${factionBonuses.str * 5}%, #fca5a5 100%)`
                    }}
                  />
                  <div className="flex justify-between text-sm font-medium text-red-600 dark:text-red-400 mt-3">
                    <span>0%</span>
                    <span>20%</span>
                  </div>
                </div>

                {/* Steadfast DEF Slider */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
                  <label className="block text-lg font-bold text-green-700 dark:text-green-300 mb-4">
                    Steadfast DEF Gym Gains: {factionBonuses.def}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={factionBonuses.def}
                    onChange={(e) => setFactionBonuses(prev => ({ 
                      ...prev, 
                      def: parseInt(e.target.value) 
                    }))}
                    className="w-full h-6 bg-green-200 rounded-lg appearance-none cursor-pointer dark:bg-green-700"
                    style={{
                      background: `linear-gradient(to right, #22c55e 0%, #22c55e ${factionBonuses.def * 5}%, #86efac ${factionBonuses.def * 5}%, #86efac 100%)`
                    }}
                  />
                  <div className="flex justify-between text-sm font-medium text-green-600 dark:text-green-400 mt-3">
                    <span>0%</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>

              {/* Add SPD/DEX sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Steadfast SPD Slider */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                  <label className="block text-lg font-bold text-blue-700 dark:text-blue-300 mb-4">
                    Steadfast SPD Gym Gains: {factionBonuses.spd}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={factionBonuses.spd}
                    onChange={(e) => setFactionBonuses(prev => ({ 
                      ...prev, 
                      spd: parseInt(e.target.value) 
                    }))}
                    className="w-full h-6 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${factionBonuses.spd * 5}%, #93c5fd ${factionBonuses.spd * 5}%, #93c5fd 100%)`
                    }}
                  />
                  <div className="flex justify-between text-sm font-medium text-blue-600 dark:text-blue-400 mt-3">
                    <span>0%</span>
                    <span>20%</span>
                  </div>
                </div>

                {/* Steadfast DEX Slider */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                  <label className="block text-lg font-bold text-purple-700 dark:text-purple-300 mb-4">
                    Steadfast DEX Gym Gains: {factionBonuses.dex}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={factionBonuses.dex}
                    onChange={(e) => setFactionBonuses(prev => ({ 
                      ...prev, 
                      dex: parseInt(e.target.value) 
                    }))}
                    className="w-full h-6 bg-purple-200 rounded-lg appearance-none cursor-pointer dark:bg-purple-700"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${factionBonuses.dex * 5}%, #c4b5fd ${factionBonuses.dex * 5}%, #c4b5fd 100%)`
                    }}
                  />
                  <div className="flex justify-between text-sm font-medium text-purple-600 dark:text-purple-400 mt-3">
                    <span>0%</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Note:</strong> Steadfast bonuses are gym gains multipliers (typically 0-10%, but can go up to 20%). Each level in a Steadfast sub-branch increases that specific stat's gym gains by 1%. Only one stat can be upgraded above 10% at a time - factions usually rotate between stats.
                </p>
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
          <Results results={results} selected={selectedGym} allocationResults={allocationResults} />
          
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