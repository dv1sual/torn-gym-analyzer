import React from 'react';
import { gyms } from '../data/gyms';
import { getGymEnergy } from '../utils/calc';

interface GymSelectorDropdownProps {
  selectedGym: string;
  onGymSelect: (gymName: string) => void;
}

const GymSelectorDropdown: React.FC<GymSelectorDropdownProps> = ({ selectedGym, onGymSelect }) => {
  // Helper function for gym energy with fallback
  const getGymEnergyWithFallback = (gymName: string) => {
    try {
      return getGymEnergy(gymName);
    } catch {
      return 10; // Default fallback
    }
  };

  // Group gyms by energy cost for better organization
  const groupedGyms = gyms.reduce((groups, gym) => {
    const energy = getGymEnergyWithFallback(gym.name);
    if (!groups[energy]) {
      groups[energy] = [];
    }
    groups[energy].push(gym);
    return groups;
  }, {} as Record<number, typeof gyms>);

  // Sort energy levels
  const energyLevels = Object.keys(groupedGyms).map(Number).sort((a, b) => a - b);

  const formatGymOption = (gym: typeof gyms[0]) => {
    const energy = getGymEnergyWithFallback(gym.name);
    return `${gym.name} (${energy}E)`;
  };

  return (
    <div style={{
      backgroundColor: '#333333',
      border: '1px solid #555555',
      padding: '12px',
      marginBottom: '12px'
    }}>
      <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0'}}>
        🏋️ Gym Selection
      </h2>
      
      <div style={{ marginBottom: '8px' }}>
        <label style={{color: 'white', fontSize: '12px', display: 'block', marginBottom: '4px'}}>
          Select Gym:
        </label>
        <select
          value={selectedGym}
          onChange={(e) => onGymSelect(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: '#222222',
            border: '1px solid #666666',
            color: 'white',
            padding: '8px 12px',
            fontSize: '14px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {energyLevels.map(energyLevel => (
            <optgroup 
              key={energyLevel} 
              label={`${energyLevel} Energy Gyms`}
              style={{ backgroundColor: '#333333', color: '#88cc88' }}
            >
              {groupedGyms[energyLevel]
                .sort((a, b) => Math.max(...Object.values(b.dots)) - Math.max(...Object.values(a.dots)))
                .map(gym => (
                  <option 
                    key={gym.name} 
                    value={gym.name}
                    style={{ backgroundColor: '#222222', color: 'white', padding: '4px' }}
                  >
                    {formatGymOption(gym)}
                  </option>
                ))
              }
            </optgroup>
          ))}
        </select>
      </div>

      {/* Selected gym details */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #555555',
        padding: '8px 12px',
        borderRadius: '3px',
        fontSize: '12px'
      }}>
        <div style={{ color: '#cccccc', marginBottom: '4px' }}>
          <span style={{ color: '#4a7c59', fontWeight: 'bold' }}>{selectedGym}</span>
          <span style={{ float: 'right', color: '#88cc88' }}>
            {getGymEnergyWithFallback(selectedGym)} Energy
          </span>
        </div>
        
        {(() => {
          const selectedGymData = gyms.find(g => g.name === selectedGym);
          if (!selectedGymData) return null;
          
          const statIcons = { str: '💪', def: '🛡️', spd: '⚡', dex: '🎯' };
          const statNames = { str: 'STR', def: 'DEF', spd: 'SPD', dex: 'DEX' };
          
          return (
            <div style={{ 
              display: 'flex', 
              gap: '12px',
              flexWrap: 'wrap',
              color: '#cccccc'
            }}>
              {Object.entries(selectedGymData.dots).map(([stat, dots]) => (
                <span key={stat} style={{ 
                  whiteSpace: 'nowrap',
                  opacity: dots === 0 ? 0.5 : 1
                }}>
                  {statIcons[stat as keyof typeof statIcons]}
                  {statNames[stat as keyof typeof statNames]}: {dots}
                </span>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default GymSelectorDropdown;
