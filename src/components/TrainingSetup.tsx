import React from 'react';

interface TrainingSetupProps {
  happy: number;
  setHappy: (value: number) => void;
  energy: number;
  setEnergy: (value: number) => void;
}

const TrainingSetup: React.FC<TrainingSetupProps> = ({ happy, setHappy, energy, setEnergy }) => {
  return (
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
  );
};

export default TrainingSetup;
