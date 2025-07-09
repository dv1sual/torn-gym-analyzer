import React from 'react';

type StatAllocation = {
  str: number;
  def: number;
  spd: number;
  dex: number;
};

interface FactionSteadfastProps {
  steadfastBonus: StatAllocation;
  setSteadfastBonus: (bonus: StatAllocation) => void;
  getStatGridColumns: () => string;
}

const FactionSteadfast: React.FC<FactionSteadfastProps> = ({
  steadfastBonus,
  setSteadfastBonus,
  getStatGridColumns
}) => {
  return (
    <div style={{
      backgroundColor: '#333333',
      border: '1px solid #555555',
      padding: '8px 12px'
    }}>
      <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
        🏛️ Faction Steadfast
      </h2>
      <div style={{display: 'grid', gridTemplateColumns: getStatGridColumns(), gap: '12px', marginBottom: '8px'}}>
        {(['str', 'def', 'spd', 'dex'] as const).map((stat) => (
          <div key={stat}>
            <label style={{color: 'white', fontSize: '12px', display: 'block', marginBottom: '4px'}}>
              {stat.toUpperCase()} Steadfast (%)
            </label>
            <input
              type="number"
              value={steadfastBonus[stat]}
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
  );
};

export default FactionSteadfast;
