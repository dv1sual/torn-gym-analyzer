import React, { useState } from 'react';
import { gyms } from '../data/gyms';
import { getGymEnergy } from '../utils/calc';
import Tooltip from './Tooltip';

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
    const gymData = gyms.find(g => g.name === gymName);
    
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

    // Create tooltip content with gym stats
    const getTooltipContent = () => {
      if (!gymData) return gymName;
      
      const statIcons = { str: '💪', def: '🛡️', spd: '⚡', dex: '🎯' };
      const statNames = { str: 'STR', def: 'DEF', spd: 'SPD', dex: 'DEX' };
      
      return (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontWeight: 'bold', 
            marginBottom: '4px' 
          }}>
            <span>{gymName}</span>
            <span style={{ fontSize: '11px', fontWeight: 'normal' }}>Energy: {energyCost}</span>
          </div>
          <div style={{ 
            fontSize: '11px', 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'nowrap', 
            gap: '12px',
            justifyContent: 'flex-start',
            alignItems: 'center'
          }}>
            {Object.entries(gymData.dots).map(([stat, dots]) => (
              <span key={stat} style={{ whiteSpace: 'nowrap' }}>
                {statIcons[stat as keyof typeof statIcons]}{statNames[stat as keyof typeof statNames]}:{dots}
              </span>
            ))}
          </div>
        </div>
      );
    };

    // Responsive sizing
    const buttonHeight = screenSize === 'mobile' ? '50px' : '60px';
    const fontSize = screenSize === 'mobile' ? '12px' : '16px';
    
    const button = (
      <button
        onClick={onClick}
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
        onMouseEnter={(e) => {
          if (!selected) {
            (e.target as HTMLButtonElement).style.backgroundColor = '#4a4a4a';
          }
        }}
        onMouseLeave={(e) => {
          if (!selected) {
            (e.target as HTMLButtonElement).style.backgroundColor = '#3a3a3a';
          }
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
    );

    // Only show tooltip on desktop
    if (screenSize === 'mobile') {
      return button;
    }

    return (
      <Tooltip content={getTooltipContent()} position="top" delay={300}>
        {button}
      </Tooltip>
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
