import React, { useState, useEffect } from 'react';
import { gyms } from './data/gyms';
import { computeGain, calculateMultipleTrains, TrainingPerks } from './utils/calc';
import GymSelector from './components/GymSelector';
import StatsInput from './components/StatsInput';
import HappyEnergyInput from './components/HappyEnergyInput';
import Results from './components/Results';
import ToggleSwitch from './components/ToggleSwitch';

export default function App() {
  // Helper function to get initial state from localStorage or use defaults
  const getInitialState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [stats, setStats] = useState(() => getInitialState('gymCalc_stats', { str: 0, def: 0, spd: 0, dex: 0 }));
  const [happy, setHappy] = useState(() => getInitialState('gymCalc_happy', 0));
  const [energy, setEnergy] = useState(() => getInitialState('gymCalc_energy', 0));
  const [selectedGym, setSelectedGym] = useState(() => getInitialState('gymCalc_selectedGym', gyms[0].name));
  const [results, setResults] = useState<any[]>([]);
  const [dynamicHappy, setDynamicHappy] = useState(() => getInitialState('gymCalc_dynamicHappy', false));
  const [darkMode, setDarkMode] = useState(() => getInitialState('gymCalc_darkMode', false));

  // Energy allocation state
  const [energyAllocation, setEnergyAllocation] = useState(() => getInitialState('gymCalc_energyAllocation', {
    str: 25,
    def: 25,
    spd: 25,
    dex: 25
  }));

  // Comprehensive perks state
  const [perks, setPerks] = useState<TrainingPerks>(() => getInitialState('gymCalc_perks', {
    // Education bonuses
    sportsScience: false,
    nutritionalScience: false,
    analysisPerformance: false,
    individualCourses: { str: 0, def: 0, spd: 0, dex: 0 },
    
    // Book bonuses
    allStatsBook: false,
    individualStatBooks: { str: false, def: false, spd: false, dex: false },
    generalGymBook: false,
    specificGymBooks: { str: false, def: false, spd: false, dex: false },
    
    // Faction bonuses
    aggression: 0,
    suppression: 0,
    steadfast: { str: 0, def: 0, spd: 0, dex: 0 },
    
    // Company & Job bonuses
    heavyLifting: 0,
    rockSalt: 0,
    roidRage: 0,
    sportsShoes: false,
    
    // Merit bonuses (converted from old system)
    merits: { str: 0, def: 0, spd: 0, dex: 0 }
  }));

  const [allocationResults, setAllocationResults] = useState<any>(null);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [darkMode]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gymCalc_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('gymCalc_happy', JSON.stringify(happy));
  }, [happy]);

  useEffect(() => {
    localStorage.setItem('gymCalc_energy', JSON.stringify(energy));
  }, [energy]);

  useEffect(() => {
    localStorage.setItem('gymCalc_selectedGym', JSON.stringify(selectedGym));
  }, [selectedGym]);

  useEffect(() => {
    localStorage.setItem('gymCalc_dynamicHappy', JSON.stringify(dynamicHappy));
  }, [dynamicHappy]);

  useEffect(() => {
    localStorage.setItem('gymCalc_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('gymCalc_energyAllocation', JSON.stringify(energyAllocation));
  }, [energyAllocation]);

  useEffect(() => {
    localStorage.setItem('gymCalc_perks', JSON.stringify(perks));
  }, [perks]);

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

    (['str', 'def', 'spd', 'dex'] as const).forEach((key) => {
      if (trainsPerStat[key] > 0) {
        if (dynamicHappy) {
          // Use multiple trains calculation with dynamic happy loss
          const result = calculateMultipleTrains(
            stats[key],
            happy,
            gym.dots[key],
            gym.energy,
            trainsPerStat[key],
            key,
            perks
          );
          gainsPerStat[key] = result.totalGain;
        } else {
          // Static happy calculation
          const gain = computeGain(stats[key], happy, gym.dots[key], gym.energy, key, perks);
          gainsPerStat[key] = gain * trainsPerStat[key];
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
      const perStat = { str: 0, def: 0, spd: 0, dex: 0 };

      (['str', 'def', 'spd', 'dex'] as const).forEach((key) => {
        if (trains > 0) {
          if (dynamicHappy) {
            // Use multiple trains calculation with dynamic happy loss
            const result = calculateMultipleTrains(
              stats[key],
              happy,
              gym.dots[key],
              gym.energy,
              trains,
              key,
              perks
            );
            perStat[key] = result.totalGain;
          } else {
            // Static happy calculation
            const gain = computeGain(stats[key], happy, gym.dots[key], gym.energy, key, perks);
            perStat[key] = gain * trains;
          }
        }
      });

      const total = perStat.str + perStat.def + perStat.spd + perStat.dex;
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              💪 Gym Stats Calculator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Advanced training calculator and comprehensive perks system
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

              {/* Energy Allocation Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚖️</span>
                  Energy Allocation
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      <strong>Energy Distribution:</strong> Allocate your total energy across stats as percentages. The calculator uses the cutting-edge formula for maximum accuracy.
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
                            onFocus={(e) => {
                              if (e.target.value === '0') {
                                e.target.value = '';
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                e.target.value = '0';
                              }
                            }}
                            onChange={(e) => setEnergyAllocation((prev: { str: number; def: number; spd: number; dex: number }) => ({
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

              {/* Gym Selection */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏋️</span>
                  Gym Selection
                </h3>
                <GymSelector gyms={gyms} selected={selectedGym} onChange={setSelectedGym} />
              </div>
            </div>

            {/* Education Bonuses */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Education Bonuses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Passive Stat Bonuses</h4>
                  <ToggleSwitch 
                    label="Sports Science Bachelor (+2% all stats)" 
                    enabled={perks.sportsScience} 
                    onToggle={(val) => setPerks(prev => ({ ...prev, sportsScience: val }))} 
                  />
                  <ToggleSwitch 
                    label="Nutritional Science (+2% STR/SPD)" 
                    enabled={perks.nutritionalScience} 
                    onToggle={(val) => setPerks(prev => ({ ...prev, nutritionalScience: val }))} 
                  />
                  <ToggleSwitch 
                    label="Analysis & Performance (+2% DEF/DEX)" 
                    enabled={perks.analysisPerformance} 
                    onToggle={(val) => setPerks(prev => ({ ...prev, analysisPerformance: val }))} 
                  />
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Gym Gains Bonuses</h4>
                  <ToggleSwitch 
                    label="General Gym Book (+20% all gym gains)" 
                    enabled={perks.generalGymBook} 
                    onToggle={(val) => setPerks(prev => ({ ...prev, generalGymBook: val }))} 
                  />
                </div>
              </div>
            </div>

            {/* Book Bonuses */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                📖 Book Bonuses (31-day temporary)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Passive Stat Books</h4>
                  <ToggleSwitch 
                    label="All Stats +25%" 
                    enabled={perks.allStatsBook} 
                    onToggle={(val) => setPerks(prev => ({ ...prev, allStatsBook: val }))} 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {(['str', 'def', 'spd', 'dex'] as const).map((key) => (
                      <ToggleSwitch 
                        key={key}
                        label={`${key.toUpperCase()} +100%`} 
                        enabled={perks.individualStatBooks[key]} 
                        onToggle={(val) => setPerks(prev => ({ 
                          ...prev, 
                          individualStatBooks: { ...prev.individualStatBooks, [key]: val }
                        }))} 
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Gym Gains Books</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(['str', 'def', 'spd', 'dex'] as const).map((key) => (
                      <ToggleSwitch 
                        key={key}
                        label={`${key.toUpperCase()} Gym +30%`} 
                        enabled={perks.specificGymBooks[key]} 
                        onToggle={(val) => setPerks(prev => ({ 
                          ...prev, 
                          specificGymBooks: { ...prev.specificGymBooks, [key]: val }
                        }))} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Faction Bonuses */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                ⚔️ Faction Bonuses
              </h3>
              
              <div className="space-y-6">
                {/* Passive Stat Bonuses */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Passive Stat Bonuses</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800">
                      <label className="block text-lg font-bold text-orange-700 dark:text-orange-300 mb-4">
                        Aggression Branch (STR/SPD): {perks.aggression}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={perks.aggression}
                        onChange={(e) => setPerks(prev => ({ ...prev, aggression: parseInt(e.target.value) }))}
                        className="w-full h-6 bg-orange-200 rounded-lg appearance-none cursor-pointer dark:bg-orange-700"
                        style={{
                          background: `linear-gradient(to right, #f97316 0%, #f97316 ${perks.aggression * 5}%, #fed7aa ${perks.aggression * 5}%, #fed7aa 100%)`
                        }}
                      />
                      <div className="flex justify-between text-sm font-medium text-orange-600 dark:text-orange-400 mt-3">
                        <span>0%</span>
                        <span>20%</span>
                      </div>
                    </div>

                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-6 border-2 border-cyan-200 dark:border-cyan-800">
                      <label className="block text-lg font-bold text-cyan-700 dark:text-cyan-300 mb-4">
                        Suppression Branch (DEF/DEX): {perks.suppression}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={perks.suppression}
                        onChange={(e) => setPerks(prev => ({ ...prev, suppression: parseInt(e.target.value) }))}
                        className="w-full h-6 bg-cyan-200 rounded-lg appearance-none cursor-pointer dark:bg-cyan-700"
                        style={{
                          background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${perks.suppression * 5}%, #a5f3fc ${perks.suppression * 5}%, #a5f3fc 100%)`
                        }}
                      />
                      <div className="flex justify-between text-sm font-medium text-cyan-600 dark:text-cyan-400 mt-3">
                        <span>0%</span>
                        <span>20%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gym Gains Bonuses */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Steadfast Gym Gains</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(['str', 'def', 'spd', 'dex'] as const).map((key) => (
                      <div key={key} className={`${
                        key === 'str' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                        key === 'def' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                        key === 'spd' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                        'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                      } rounded-xl p-4 border-2`}>
                        <label className={`block text-sm font-bold mb-3 ${
                          key === 'str' ? 'text-red-700 dark:text-red-300' :
                          key === 'def' ? 'text-green-700 dark:text-green-300' :
                          key === 'spd' ? 'text-blue-700 dark:text-blue-300' :
                          'text-purple-700 dark:text-purple-300'
                        }`}>
                          {key.toUpperCase()}: {perks.steadfast[key]}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={perks.steadfast[key]}
                          onChange={(e) => setPerks(prev => ({ 
                            ...prev, 
                            steadfast: { ...prev.steadfast, [key]: parseInt(e.target.value) }
                          }))}
                          className="w-full h-4 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: key === 'str' ? `linear-gradient(to right, #ef4444 0%, #ef4444 ${perks.steadfast[key] * 5}%, #fca5a5 ${perks.steadfast[key] * 5}%, #fca5a5 100%)` :
                                      key === 'def' ? `linear-gradient(to right, #22c55e 0%, #22c55e ${perks.steadfast[key] * 5}%, #86efac ${perks.steadfast[key] * 5}%, #86efac 100%)` :
                                      key === 'spd' ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${perks.steadfast[key] * 5}%, #93c5fd ${perks.steadfast[key] * 5}%, #93c5fd 100%)` :
                                      `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${perks.steadfast[key] * 5}%, #c4b5fd ${perks.steadfast[key] * 5}%, #c4b5fd 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs font-medium mt-2 opacity-75">
                          <span>0%</span>
                          <span>20%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Company & Job Bonuses */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                🏢 Company & Job Bonuses
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Job Point Specials</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[100px]">Heavy Lifting (STR)</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={perks.heavyLifting}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = '';
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            e.target.value = '0';
                          }
                        }}
                        onChange={(e) => setPerks(prev => ({ ...prev, heavyLifting: parseInt(e.target.value) || 0 }))}
                        className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Job points"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[100px]">Rock Salt (DEF)</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={perks.rockSalt}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = '';
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            e.target.value = '0';
                          }
                        }}
                        onChange={(e) => setPerks(prev => ({ ...prev, rockSalt: parseInt(e.target.value) || 0 }))}
                        className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Job points"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[100px]">Roid Rage (STR)</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={perks.roidRage}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = '';
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            e.target.value = '0';
                          }
                        }}
                        onChange={(e) => setPerks(prev => ({ ...prev, roidRage: parseInt(e.target.value) || 0 }))}
                        className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Job points"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Items & Merit Bonuses</h4>
                  <div className="space-y-3">
                    <ToggleSwitch 
                      label="Sports Shoes (+5% SPD gym gains)" 
                      enabled={perks.sportsShoes} 
                      onToggle={(val) => setPerks(prev => ({ ...prev, sportsShoes: val }))} 
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      {(['str', 'def', 'spd', 'dex'] as const).map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <label className={`text-xs font-medium min-w-[40px] ${
                            key === 'str' ? 'text-red-600 dark:text-red-400' :
                            key === 'def' ? 'text-green-600 dark:text-green-400' :
                            key === 'spd' ? 'text-blue-600 dark:text-blue-400' :
                            'text-purple-600 dark:text-purple-400'
                          }`}>
                            {key.toUpperCase()} Merit
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={perks.merits[key]}
                            onFocus={(e) => {
                              if (e.target.value === '0') {
                                e.target.value = '';
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                e.target.value = '0';
                              }
                            }}
                            onChange={(e) => setPerks(prev => ({ 
                              ...prev, 
                              merits: { ...prev.merits, [key]: parseInt(e.target.value) || 0 }
                            }))}
                            className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-16"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                Advanced Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ToggleSwitch label="Dark Mode" enabled={darkMode} onToggle={setDarkMode} />
                <ToggleSwitch label="Dynamic Happy Loss" enabled={dynamicHappy} onToggle={setDynamicHappy} />
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 transition-colors">
                  <label className="text-sm font-medium text-red-700 dark:text-red-200 flex-1 pr-3">Reset All Settings</label>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all settings to defaults?')) {
                        // Clear localStorage
                        Object.keys(localStorage).forEach(key => {
                          if (key.startsWith('gymCalc_')) {
                            localStorage.removeItem(key);
                          }
                        });
                        // Reset all state to defaults
                        setStats({ str: 0, def: 0, spd: 0, dex: 0 });
                        setHappy(0);
                        setEnergy(0);
                        setSelectedGym(gyms[0].name);
                        setDynamicHappy(false);
                        setDarkMode(false);
                        setEnergyAllocation({ str: 25, def: 25, spd: 25, dex: 25 });
                        setPerks({
                          sportsScience: false,
                          nutritionalScience: false,
                          analysisPerformance: false,
                          individualCourses: { str: 0, def: 0, spd: 0, dex: 0 },
                          allStatsBook: false,
                          individualStatBooks: { str: false, def: false, spd: false, dex: false },
                          generalGymBook: false,
                          specificGymBooks: { str: false, def: false, spd: false, dex: false },
                          aggression: 0,
                          suppression: 0,
                          steadfast: { str: 0, def: 0, spd: 0, dex: 0 },
                          heavyLifting: 0,
                          rockSalt: 0,
                          roidRage: 0,
                          sportsShoes: false,
                          merits: { str: 0, def: 0, spd: 0, dex: 0 }
                        });
                        setResults([]);
                        setAllocationResults(null);
                      }
                    }}
                    className="inline-flex items-center justify-center px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800"
                  >
                    <span className="text-xs mr-1">🗑️</span>
                    Reset
                  </button>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>💾 Auto-Save:</strong> Your settings are automatically saved and will persist between browser sessions.
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