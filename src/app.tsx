import React, { useState, useEffect } from 'react';
import { gyms } from './data/gyms';
import { computeGain, calculateMultipleTrains, TrainingPerks, getGymEnergy } from './utils/calc';

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
  const [darkMode, setDarkMode] = useState(() => getInitialState('gymCalc_darkMode', true)); // Default to dark

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
  
  // Faction steadfast bonuses
  const [steadfastBonus, setSteadfastBonus] = useState(() => getInitialState('gymCalc_steadfastBonus', {
    str: 0,
    def: 0,
    spd: 0,
    dex: 0
  }));

  const [allocationResults, setAllocationResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');

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
    const totalBonus = (Number(propertyPerks) || 0) + (Number(educationStatSpecific) || 0) + (Number(educationGeneral) || 0) + (Number(jobPerks) || 0) + (Number(bookPerks) || 0);
    
    return {
      manualGymBonusPercent: {
        str: totalBonus,
        def: totalBonus,
        spd: totalBonus,
        dex: totalBonus
      },
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

      let maxSingleStatGain = 0;
      
      (['str', 'def', 'spd', 'dex'] as const).forEach((key) => {
        const gymData = gyms.find(g => g.name === gym.name);
        const gymHasStat = gymData && gymData.dots[key] > 0;
        
        if (trains > 0 && gymHasStat) {
          let singleStatGain = 0;
          
          if (dynamicHappy) {
            const result = calculateMultipleTrains(
              stats[key],
              happy,
              gym.name,
              trains,
              key,
              perks
            );
            singleStatGain = result.totalGain;
          } else {
            const gain = computeGain(stats[key], happy, gym.name, key, perks);
            singleStatGain = gain * trains;
          }
          
          perStat[key] = singleStatGain;
          maxSingleStatGain = Math.max(maxSingleStatGain, singleStatGain);
        }
      });

      const total = maxSingleStatGain;
      return { name: gym.name, perStat, total };
    });

    setResults(sessionResults);

    const selectedGymData = gyms.find(g => g.name === selectedGym);
    if (selectedGymData) {
      const allocationResult = calculateEnergyAllocation(selectedGymData, energyAllocation);
      setAllocationResults(allocationResult);
    }

    setShowResults(true);
    setActiveTab('results'); // Auto-navigate to results
  };

  const resetAllSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('gymCalc_')) {
          localStorage.removeItem(key);
        }
      });
      setStats({ str: 0, def: 0, spd: 0, dex: 0 });
      setHappy(0);
      setEnergy(0);
      setSelectedGym(gyms[0].name);
      setDynamicHappy(false);
      setDarkMode(true);
      setEnergyAllocation({ str: 25, def: 25, spd: 25, dex: 25 });
      setPropertyPerks(0);
      setEducationStatSpecific(0);
      setEducationGeneral(0);
      setJobPerks(0);
      setBookPerks(0);
      setSteadfastBonus({ str: 0, def: 0, spd: 0, dex: 0 });
      setResults([]);
      setAllocationResults(null);
      setShowResults(false);
    }
  };

  // Helper function for gym energy with fallback
  const getGymEnergyWithFallback = (gymName: string) => {
    try {
      return getGymEnergy(gymName);
    } catch {
      return 10; // Default fallback
    }
  };

  const StatInput = ({ label, value, onChange, color }: { label: string; value: number; onChange: (val: number) => void; color: string }) => (
    <div style={{
      backgroundColor: '#2a2a2a',
      border: '1px solid #444444',
      padding: '10px',
      margin: '5px',
      borderRadius: '8px'
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
        <span style={{color: color, fontSize: '20px'}}>
          {label === 'Strength' && '💪'}
          {label === 'Defense' && '🛡️'}
          {label === 'Speed' && '⚡'}
          {label === 'Dexterity' && '🎯'}
        </span>
        <div>
          <div style={{color: color, fontSize: '13px', fontWeight: 'bold'}}>
            {label.toUpperCase()}
          </div>
          <div style={{color: 'white', fontSize: '18px', fontWeight: 'bold'}}>
            {value.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div style={{color: '#999999', fontSize: '11px', marginBottom: '8px'}}>
        Current Level
      </div>
      
      <input
        type="text"
        value={value || ''}
        onChange={(e) => {
          const cleanValue = e.target.value.replace(/,/g, '');
          onChange(parseInt(cleanValue) || 0);
        }}
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
        style={{
          width: '100%',
          backgroundColor: '#222222',
          border: '1px solid #666666',
          color: 'white',
          padding: '4px 8px',
          fontSize: '12px'
        }}
        placeholder="e.g. 1,000,000"
      />
    </div>
  );

  const GymSquare = ({ gymName, selected, onClick }: { gymName: string; selected: boolean; onClick: () => void }) => {
    const energyCost = getGymEnergyWithFallback(gymName);
    const [isHovered, setIsHovered] = useState(false);
    
    // Get gym initials from name
    const getGymInitials = (name: string) => {
      const words = name.split(' ').filter(word => word.length > 0);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      } else if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };
    
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: '100%',
            height: '60px',
            backgroundColor: selected ? '#4a7c59' : '#3a3a3a',
            border: selected ? '2px solid #6b9b7a' : '1px solid #555555',
            cursor: 'pointer',
            fontSize: '16px',
            color: 'white',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            borderRadius: '4px'
          }}
        >
          <div style={{
            fontSize: '14px', 
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {getGymInitials(gymName)}
          </div>
          <div style={{
            position: 'absolute',
            bottom: '1px',
            right: '2px',
            fontSize: '8px',
            color: '#cccccc',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '1px 2px',
            borderRadius: '2px'
          }}>
            {energyCost}E
          </div>
          {selected && (
            <div style={{
              position: 'absolute',
              top: '1px',
              left: '2px',
              fontSize: '10px',
              color: '#4a7c59',
              fontWeight: 'bold'
            }}>
              ✓
            </div>
          )}
        </button>
        {isHovered && (
          <div style={{
            position: 'absolute',
            bottom: '55px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            border: '1px solid #555555',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            {gymName}
            <div style={{
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid rgba(0, 0, 0, 0.95)'
            }}></div>
          </div>
        )}
      </div>
    );
  };

  const sorted = [...results].sort((a, b) => b.total - a.total).slice(0, 10);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#191919',
      color: '#cccccc',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        backgroundColor: '#191919'
      }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #444444',
        borderBottom: '2px solid #444444',
        padding: '8px 12px',
        marginBottom: '12px'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{
              width: '100px',
              height: '40px',
              background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888888',
              fontWeight: 'bold',
              fontSize: '18px',
              border: '1px solid #333333',
              borderRadius: '2px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.5)',
              letterSpacing: '2px',
              textShadow: '0 1px 0 rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                pointerEvents: 'none'
              }}></div>
              TORN
            </div>
            <h1 style={{color: 'white', fontSize: '16px', fontWeight: 'bold', margin: 0}}>
              Gym Stats Calculator
            </h1>
          </div>
          <div style={{display: 'flex', gap: '8px'}}>
            <button 
              onClick={() => setActiveTab('calculator')}
              style={{
                padding: '4px 8px',
                backgroundColor: activeTab === 'calculator' ? '#88cc88' : '#444444',
                border: '1px solid #666666',
                color: 'white',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              📊 Calculator
            </button>
            <button 
              onClick={() => setActiveTab('results')}
              style={{
                padding: '4px 8px',
                backgroundColor: activeTab === 'results' ? '#88cc88' : '#444444',
                border: '1px solid #666666',
                color: 'white',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              📈 Results
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              style={{
                padding: '4px 8px',
                backgroundColor: activeTab === 'settings' ? '#88cc88' : '#444444',
                border: '1px solid #666666',
                color: 'white',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #555555',
        padding: '10px',
        fontSize: '12px',
        marginBottom: '12px'
      }}>
        <div style={{color: '#cccccc'}}>
          Training Prediction using <span style={{color: '#88cc88', fontWeight: 'bold'}}>Vladar Formula</span> • 2025
        </div>
      </div>

      {activeTab === 'calculator' && (
        <>
          {/* Current Stats */}
          <div style={{
            backgroundColor: '#2a2a2a',
            border: '1px solid #444444',
            padding: '8px 12px',
            marginBottom: '12px'
          }}>
            <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
              📊 Current Stats
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0px'
            }}>
              <StatInput 
                label="Strength" 
                value={stats.str} 
                onChange={(val) => setStats({...stats, str: val})}
                color="#88cc88"
              />
              <StatInput 
                label="Defense" 
                value={stats.def} 
                onChange={(val) => setStats({...stats, def: val})}
                color="#88cc88"
              />
              <StatInput 
                label="Speed" 
                value={stats.spd} 
                onChange={(val) => setStats({...stats, spd: val})}
                color="#88cc88"
              />
              <StatInput 
                label="Dexterity" 
                value={stats.dex} 
                onChange={(val) => setStats({...stats, dex: val})}
                color="#88cc88"
              />
            </div>
          </div>

          {/* Training Setup */}
          <div style={{
            backgroundColor: '#2a2a2a',
            border: '1px solid #444444',
            padding: '8px 12px',
            marginBottom: '12px'
          }}>
            <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
              ⚡ Training Setup
            </h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <div>
                <label style={{color: 'white', fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                  Happy Level
                </label>
                <input
                  type="number"
                  value={happy || ''}
                  onChange={(e) => setHappy(parseInt(e.target.value) || 0)}
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
                  style={{
                    width: '100%',
                    backgroundColor: '#222222',
                    border: '1px solid #666666',
                    color: 'white',
                    padding: '6px 8px',
                    fontSize: '12px'
                  }}
                />
              </div>
              <div>
                <label style={{color: 'white', fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                  Total Energy
                </label>
                <input
                  type="number"
                  value={energy || ''}
                  onChange={(e) => setEnergy(parseInt(e.target.value) || 0)}
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
                  style={{
                    width: '100%',
                    backgroundColor: '#222222',
                    border: '1px solid #666666',
                    color: 'white',
                    padding: '6px 8px',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Gym Selection */}
          <div style={{
            backgroundColor: '#333333',
            border: '1px solid #555555',
            padding: '12px',
            marginBottom: '12px'
          }}>
            <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0'}}>
              🏋️ Gym Selection
            </h2>
            
            {/* Current Selection Display */}
            <div style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #555555',
              padding: '8px 12px',
              marginBottom: '12px',
              borderRadius: '3px'
            }}>
              <span style={{color: '#cccccc', fontSize: '12px'}}>
                Selected: <span style={{color: '#4a7c59', fontWeight: 'bold'}}>{selectedGym}</span>
              </span>
            </div>
            
            {/* Gym Grid - Full width with proper spacing */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(16, 1fr)',
              gap: '2px',
              backgroundColor: '#2a2a2a',
              padding: '4px',
              border: '1px solid #555555',
              borderRadius: '2px'
            }}>
              {gyms.map((gym) => (
                <GymSquare 
                  key={gym.name}
                  gymName={gym.name}
                  selected={selectedGym === gym.name}
                  onClick={() => setSelectedGym(gym.name)}
                />
              ))}
            </div>
          </div>

          {/* Energy Allocation */}
          <div style={{
            backgroundColor: '#333333',
            border: '1px solid #555555',
            padding: '8px 12px',
            marginBottom: '12px'
          }}>
            <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
              ⚖️ Energy Allocation
            </h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '8px'}}>
              {(['str', 'def', 'spd', 'dex'] as const).map((stat) => (
                <div key={stat}>
                  <label style={{color: 'white', fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                    {stat.toUpperCase()} Energy (%)
                  </label>
                  <input
                    type="number"
                    value={energyAllocation[stat] || ''}
                    onChange={(e) => setEnergyAllocation({...energyAllocation, [stat]: parseInt(e.target.value) || 0})}
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
                    style={{
                      width: '100%',
                      backgroundColor: '#222222',
                      border: '1px solid #666666',
                      color: 'white',
                      padding: '4px 8px',
                      fontSize: '12px'
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{color: '#cccccc', fontSize: '11px'}}>
              Total Allocation: {energyAllocation.str + energyAllocation.def + energyAllocation.spd + energyAllocation.dex}%
              {(energyAllocation.str + energyAllocation.def + energyAllocation.spd + energyAllocation.dex) !== 100 && (
                <span style={{color: '#ffaa88'}}> (Should total 100%)</span>
              )}
            </div>
          </div>

          {/* Perks Bonuses */}
          <div style={{
            backgroundColor: '#333333',
            border: '1px solid #555555',
            padding: '8px 12px',
            marginBottom: '12px'
          }}>
            <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
              📈 Perks Bonuses
            </h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '8px'}}>
              <div>
                <label style={{color: 'white', fontSize: '11px', display: 'block', marginBottom: '4px'}}>
                  Property Perks (%)
                </label>
                <input
                  type="number"
                  value={propertyPerks || ''}
                  onChange={(e) => setPropertyPerks(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    backgroundColor: '#222222',
                    border: '1px solid #666666',
                    color: 'white',
                    padding: '4px 6px',
                    fontSize: '11px'
                  }}
                />
              </div>
              <div>
                <label style={{color: 'white', fontSize: '11px', display: 'block', marginBottom: '4px'}}>
                  Education (Stat) (%)
                </label>
                <input
                  type="number"
                  value={educationStatSpecific || ''}
                  onChange={(e) => setEducationStatSpecific(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    backgroundColor: '#222222',
                    border: '1px solid #666666',
                    color: 'white',
                    padding: '4px 6px',
                    fontSize: '11px'
                  }}
                />
              </div>
              <div>
                <label style={{color: 'white', fontSize: '11px', display: 'block', marginBottom: '4px'}}>
                  Education (General) (%)
                </label>
                <input
                  type="number"
                  value={educationGeneral || ''}
                  onChange={(e) => setEducationGeneral(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    backgroundColor: '#222222',
                    border: '1px solid #666666',
                    color: 'white',
                    padding: '4px 6px',
                    fontSize: '11px'
                  }}
                />
              </div>
              <div>
                <label style={{color: 'white', fontSize: '11px', display: 'block', marginBottom: '4px'}}>
                  Job Perks (%)
                </label>
                <input
                  type="number"
                  value={jobPerks || ''}
                  onChange={(e) => setJobPerks(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    backgroundColor: '#222222',
                    border: '1px solid #666666',
                    color: 'white',
                    padding: '4px 6px',
                    fontSize: '11px'
                  }}
                />
              </div>
              <div>
                <label style={{color: 'white', fontSize: '11px', display: 'block', marginBottom: '4px'}}>
                  Book Perks (%)
                </label>
                <input
                  type="number"
                  value={bookPerks || ''}
                  onChange={(e) => setBookPerks(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    backgroundColor: '#222222',
                    border: '1px solid #666666',
                    color: 'white',
                    padding: '4px 6px',
                    fontSize: '11px'
                  }}
                />
              </div>
            </div>
            <div style={{color: '#88cc88', fontSize: '11px'}}>
              Total Bonus: {(Number(propertyPerks) || 0) + (Number(educationStatSpecific) || 0) + (Number(educationGeneral) || 0) + (Number(jobPerks) || 0) + (Number(bookPerks) || 0)}% applied to all stats
            </div>
          </div>

          {/* Faction Steadfast */}
          <div style={{
            backgroundColor: '#333333',
            border: '1px solid #555555',
            padding: '8px 12px'
          }}>
            <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
              🏛️ Faction Steadfast
            </h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '8px'}}>
              {(['str', 'def', 'spd', 'dex'] as const).map((stat) => (
                <div key={stat}>
                  <label style={{color: 'white', fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                    {stat.toUpperCase()} Steadfast (%)
                  </label>
                  <input
                    type="number"
                    value={steadfastBonus[stat] || ''}
                    onChange={(e) => setSteadfastBonus({...steadfastBonus, [stat]: parseFloat(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      backgroundColor: '#222222',
                      border: '1px solid #666666',
                      color: 'white',
                      padding: '4px 8px',
                      fontSize: '12px'
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{color: '#cccccc', fontSize: '11px'}}>
              These bonuses are applied separately and stack multiplicatively.
            </div>
          </div>

          {/* Calculate Button */}
          <div style={{
            backgroundColor: '#333333',
            border: '1px solid #555555',
            padding: '12px',
            textAlign: 'center'
          }}>
            <button
              onClick={runSimulation}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4a7c59',
                border: '1px solid #6b9b7a',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#5a8c69';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#4a7c59';
              }}
            >
              🔥 Compute Maximum Gains 🔥
            </button>
          </div>
        </>
      )}

      {activeTab === 'results' && (
        <div style={{
          backgroundColor: '#333333',
          border: '1px solid #555555',
          padding: '8px 12px'
        }}>
          <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
            🏆 Training Results
          </h2>
          
          {!showResults ? (
            <div style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #555555',
              padding: '20px',
              textAlign: 'center',
              color: '#999999'
            }}>
              Click "Compute Maximum Gains" to see results
            </div>
          ) : (
            <>
              {/* Energy Allocation Results */}
              {allocationResults && (
                <div style={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #555555',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <h3 style={{color: '#88cc88', fontSize: '13px', margin: '0 0 8px 0'}}>
                    ⚖️ Energy Allocation Results - {selectedGym}
                  </h3>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px'}}>
                    {(['str', 'def', 'spd', 'dex'] as const).map((stat) => (
                      <div key={stat} style={{
                        backgroundColor: '#333333',
                        border: '1px solid #555555',
                        padding: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{color: '#88cc88', fontSize: '12px', fontWeight: 'bold'}}>{stat.toUpperCase()}</div>
                        <div style={{color: 'white', fontSize: '16px', fontWeight: 'bold'}}>+{allocationResults.gainsPerStat[stat].toFixed(2)}</div>
                        <div style={{color: '#999999', fontSize: '10px'}}>Energy: {allocationResults.energyPerStat[stat]} | Trains: {allocationResults.trainsPerStat[stat]}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    textAlign: 'center',
                    color: '#88cc88',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    Total Allocated Gain: +{allocationResults.totalGain.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Top Gyms */}
              <div style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #555555',
                padding: '12px'
              }}>
                <h3 style={{color: '#88cc88', fontSize: '13px', margin: '0 0 8px 0'}}>
                  🏆 Top 10 Gyms (All Energy)
                </h3>
                {sorted.map((gym, index) => (
                  <div key={gym.name} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '4px 8px',
                    backgroundColor: gym.name === selectedGym ? '#444444' : '#333333',
                    border: '1px solid #555555',
                    marginBottom: '2px'
                  }}>
                    <span style={{color: '#cccccc', fontSize: '12px'}}>
                      #{index + 1} {gym.name}
                    </span>
                    <span style={{color: '#88cc88', fontSize: '12px', fontWeight: 'bold'}}>
                      {gym.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{
          backgroundColor: '#333333',
          border: '1px solid #555555',
          padding: '8px 12px'
        }}>
          <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
            ⚙️ Settings
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span style={{color: '#cccccc', fontSize: '12px'}}>Dynamic Happy Loss</span>
              <button
                onClick={() => setDynamicHappy(!dynamicHappy)}
                style={{
                  width: '40px',
                  height: '20px',
                  backgroundColor: dynamicHappy ? '#88cc88' : '#444444',
                  border: '1px solid #666666',
                  cursor: 'pointer',
                  fontSize: '10px',
                  color: 'white'
                }}
              >
                {dynamicHappy ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span style={{color: '#cccccc', fontSize: '12px'}}>Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  width: '40px',
                  height: '20px',
                  backgroundColor: darkMode ? '#88cc88' : '#444444',
                  border: '1px solid #666666',
                  cursor: 'pointer',
                  fontSize: '10px',
                  color: 'white'
                }}
              >
                {darkMode ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span style={{color: '#cccccc', fontSize: '12px'}}>Reset All Settings</span>
              <button
                onClick={resetAllSettings}
                style={{
                  padding: '2px 8px',
                  backgroundColor: '#cc4444',
                  border: '1px solid #666666',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: 'white'
                }}
              >
                🗑️ Reset
              </button>
            </div>
          </div>
          <div style={{color: '#cccccc', fontSize: '10px', marginTop: '8px'}}>
            💾 Auto-Save: Settings are automatically saved between sessions.
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #555555',
        padding: '8px 12px',
        textAlign: 'center',
        fontSize: '10px',
        color: '#999999'
      }}>
        <div style={{marginBottom: '4px'}}>
          This page wouldn't be possible without <span style={{color: '#88cc88'}}>Vladar[1996140]</span> and his{' '}
          <a 
            href="https://www.torn.com/forums.php#/p=threads&f=61&t=16182535&b=0&a=0" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{color: '#88cc88', textDecoration: 'underline'}}
          >
            Training Gains Explained 2.0
          </a> - 
          <span style={{color: '#88cc88'}}> Same_Sura[2157732]</span> for extensive testing.
        </div>
        <div>
          Made with the help of <span style={{color: '#88cc88'}}>AI</span> • Created by <span style={{color: '#88cc88'}}>dv1sual[3616352]</span>
        </div>
      </div>
      </div>
    </div>
  );
}
