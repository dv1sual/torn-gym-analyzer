import React, { useState } from 'react';
import { gyms } from '../data/gyms';
import { getGymEnergy } from '../utils/calc';

interface GymSelectorProps {
  selectedGym: string;
  onGymSelect: (gymName: string) => void;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  getGymGridColumns: () => string;
}

const GymSelector: React.FC<GymSelectorProps> = ({ selectedGym, onGymSelect, screenSize, getGymGridColumns }) => {
  // Helper function for gym energy with fallback
  const getGymEnergyWithFallback = (gymName: string) => {
    try {
      return getGymEnergy(gymName);
    } catch {
      return 10; // Default fallback
    }
  };

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

    // Responsive sizing
    const buttonHeight = screenSize === 'mobile' ? '50px' : '60px';
    const fontSize = screenSize === 'mobile' ? '12px' : '16px';
    
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: '100%',
            height: buttonHeight,
            backgroundColor: selected ? '#4a7c59' : '#3a3a3a',
            border: selected ? '2px solid #6b9b7a' : '1px solid #555555',
            cursor: 'pointer',
            fontSize: fontSize,
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
            fontSize: screenSize === 'mobile' ? '12px' : '14px', 
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
        {isHovered && screenSize !== 'mobile' && (
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
      
      {/* Gym Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: getGymGridColumns(),
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
            onClick={() => onGymSelect(gym.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default GymSelector;
