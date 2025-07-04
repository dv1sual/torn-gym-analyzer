import React, { useState, useEffect } from 'react';
import { gyms } from './data/gyms';
import { computeGain, calculateMultipleTrains, TrainingPerks, getGymEnergy } from './utils/calc';
import GymSelector from './components/GymSelector';
import StatsInput from './components/StatsInput';
import HappyEnergyInput from './components/HappyEnergyInput';
import Results from './components/Results';
import ToggleSwitch from './components/ToggleSwitch';

type StatAllocation = {
  str: number;
  def: number;
  spd: number;
  dex: number;
};

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

  // Simple bonus inputs
  const [propertyPerks, setPropertyPerks] = useState(() => getInitialState('gymCalc_propertyPerks', 0));
  const [educationStatSpecific, setEducationStatSpecific] = useState(() => getInitialState('gymCalc_educationStatSpecific', 0));
  const [educationGeneral, setEducationGeneral] = useState(() => getInitialState('gymCalc_educationGeneral', 0));
  const [jobPerks, setJobPerks] = useState(() => getInitialState('gymCalc_jobPerks', 0));
  const [bookPerks, setBookPerks] = useState(() => getInitialState('gymCalc_bookPerks', 0));
  
  // Faction steadfast bonuses (separate from other perks)
  const [steadfastBonus, setSteadfastBonus] = useState(() => getInitialState('gymCalc_steadfastBonus', {
    str: 0,
    def: 0,
    spd: 0,
    dex: 0
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
    localStorage.setItem('gymCalc_propertyPerks', JSON.stringify(propertyPerks));
  }, [propertyPerks]);

  useEffect(() => {
    localStorage.setItem('gymCalc_educationStatSpecific', JSON.stringify(educationStatSpecific));
  }, [educationStatSpecific]);

  useEffect(() => {
    localStorage.setItem('gymCalc_educationGeneral', JSON.stringify(educationGeneral));
  }, [educationGeneral]);

  useEffect(() => {
    localStorage.setItem('gymCalc_jobPerks', JSON.stringify(jobPerks));
  }, [jobPerks]);

  useEffect(() => {
    localStorage.setItem('gymCalc_bookPerks', JSON.stringify(bookPerks));
  }, [bookPerks]);

  useEffect(() => {
    localStorage.setItem('gymCalc_steadfastBonus', JSON.stringify(steadfastBonus));
  }, [steadfastBonus]);

  // Convert bonus inputs to the perks format for calculations
  const createPerksObject = (): TrainingPerks => {
    // Apply all non-steadfast bonuses as a single manual gym bonus percentage
    const totalBonus = (Number(propertyPerks) || 0) + (Number(educationStatSpecific) || 0) + (Number(educationGeneral) || 0) + (Number(jobPerks) || 0) + (Number(bookPerks) || 0);
    
    return {
      // Apply all bonuses as manual gym bonus (this covers all multiplicative bonuses)
      manualGymBonusPercent: {
        str: totalBonus,
        def: totalBonus,
        spd: totalBonus,
        dex: totalBonus
      },
      
      // Faction steadfast bonuses (separate multiplicative bonuses)
      steadfast: steadfastBonus
    };
  };

  const calculateEnergyAllocation = (gym: any, allocation: any) => {
    const totalAllocation = allocation.str + allocation.def + allocation.spd + allocation.dex;
    const energyPerStat = {
      str: Math.floor((energy * allocation.str) / totalAllocation),
      def: Math.floor((energy * allocation.def) / totalAllocation),
      spd: Math.floor((energy * allocation.spd) / totalAllocation),
      dex: Math.floor((energy * allocation.dex) / totalAllocation)
    };

    const gymEnergy = getGymEnergy(gym.name);
    const trainsPerStat = {
      str: Math.floor(energyPerStat.str / gymEnergy),
      def: Math.floor(energyPerStat.def / gymEnergy),
      spd: Math.floor(energyPerStat.spd / gymEnergy),
      dex: Math.floor(energyPerStat.dex / gymEnergy)
    };

    const gainsPerStat = { str: 0, def: 0, spd: 0, dex: 0 };
    const perks = createPerksObject();

    (['str', 'def', 'spd', 'dex'] as const).forEach((key) => {
      if (trainsPerStat[key] > 0) {
        if (dynamicHappy) {
            // Use multiple trains calculation with dynamic happy loss
            const result = calculateMultipleTrains(
              stats[key],
              happy,
              gym.name,
              trainsPerStat[key],
              key,
              perks
            );
          gainsPerStat[key] = result.totalGain;
        } else {
          // Static happy calculation
            const gain = computeGain(stats[key], happy, gym.name, key, perks);
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
    const perks = createPerksObject();
    
    const sessionResults = gyms.map((gym) => {
      const gymEnergy = getGymEnergy(gym.name);
      const trains = Math.floor(energy / gymEnergy);
      const perStat = { str: 0, def: 0, spd: 0, dex: 0 };

      (['str', 'def', 'spd', 'dex'] as const).forEach((key) => {
        if (trains > 0) {
          if (dynamicHappy) {
            // Use multiple trains calculation with dynamic happy loss
            const result = calculateMultipleTrains(
              stats[key],
              happy,
              gym.name,
              trains,
              key,
              perks
            );
            perStat[key] = result.totalGain;
          } else {
            // Static happy calculation
            const gain = computeGain(stats[key], happy, gym.name, key, perks);
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
              Optimized training calculator
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
                      <strong>Energy Distribution:</strong> Allocate your total energy across stats as percentages.
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
                            onChange={(e) => setEnergyAllocation((prev: StatAllocation) => ({
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

              {/* Perks Bonuses Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  Perks Bonuses
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Property Perks (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={propertyPerks || ''}
                      onChange={(e) => setPropertyPerks(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-base bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Education (Stat Specific) (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={educationStatSpecific || ''}
                      onChange={(e) => setEducationStatSpecific(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-base bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Education (General) (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={educationGeneral || ''}
                      onChange={(e) => setEducationGeneral(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-base bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Job Perks (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={jobPerks || ''}
                      onChange={(e) => setJobPerks(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-base bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Book Perks (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={bookPerks || ''}
                      onChange={(e) => setBookPerks(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-base bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Total Bonus:</strong> {(Number(propertyPerks) || 0) + (Number(educationStatSpecific) || 0) + (Number(educationGeneral) || 0) + (Number(jobPerks) || 0) + (Number(bookPerks) || 0)}% applied to all stats
                  </p>
                </div>
              </div>

              {/* Faction Steadfast Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  Faction Steadfast
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['str', 'def', 'spd', 'dex'] as const).map((key) => (
                    <div key={key} className="relative">
                      <label className={`block text-sm font-semibold mb-2 uppercase tracking-wide ${
                        key === 'str' ? 'text-red-600 dark:text-red-400' :
                        key === 'def' ? 'text-green-600 dark:text-green-400' :
                        key === 'spd' ? 'text-blue-600 dark:text-blue-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`}>
                        {key.toUpperCase()} Steadfast (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={steadfastBonus[key] || ''}
                        onChange={(e) => setSteadfastBonus((prev: StatAllocation) => ({ 
                          ...prev, 
                          [key]: parseFloat(e.target.value) || 0 
                        }))}
                        className={`w-full px-3 py-2 text-base bg-white dark:bg-gray-800 border-2 ${
                          key === 'str' ? 'border-red-200 dark:border-red-800 focus:border-red-500' :
                          key === 'def' ? 'border-green-200 dark:border-green-800 focus:border-green-500' :
                          key === 'spd' ? 'border-blue-200 dark:border-blue-800 focus:border-blue-500' :
                          'border-purple-200 dark:border-purple-800 focus:border-purple-500'
                        } rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100`}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>Faction Steadfast:</strong> These bonuses are applied separately from other perks and stack multiplicatively.
                  </p>
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

            {/* Settings */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                Settings
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
                        setPropertyPerks(0);
                        setEducationStatSpecific(0);
                        setEducationGeneral(0);
                        setJobPerks(0);
                        setBookPerks(0);
                        setSteadfastBonus({ str: 0, def: 0, spd: 0, dex: 0 });
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
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              2025 - dv1sual
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              This page wouldn't be possible without <span className="text-blue-500 dark:text-blue-400">Vladar</span> and his{' '}
              <a 
                href="https://www.torn.com/forums.php#/p=threads&f=61&t=16182535&b=0&a=0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline"
              >
                Training Gains Explained 2.0
              </a>, 
              <span className="text-purple-500 dark:text-purple-400"> Same_Sura</span> for lots of testing. 
              Made with the help of <span className="text-emerald-500 dark:text-emerald-400">AI</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
