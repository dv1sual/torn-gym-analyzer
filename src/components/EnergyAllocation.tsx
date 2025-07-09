import React from 'react';

type StatAllocation = {
  str: number;
  def: number;
  spd: number;
  dex: number;
};

interface EnergyAllocationProps {
  energyAllocation: StatAllocation;
  setEnergyAllocation: (allocation: StatAllocation) => void;
  getStatGridColumns: () => string;
}

const EnergyAllocation: React.FC<EnergyAllocationProps> = ({ 
  energyAllocation, 
  setEnergyAllocation, 
  getStatGridColumns 
}) => {
  const totalAllocation = energyAllocation.str + energyAllocation.def + energyAllocation.spd + energyAllocation.dex;

  return (
    <div style={{
      backgroundColor: '#333333',
      border: '1px solid #555555',
      padding: '8px 12px',
      marginBottom: '12px'
    }}>
      <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
        ⚖️ Energy Allocation
      </h2>
      <div style={{display: 'grid', gridTemplateColumns: getStatGridColumns(), gap: '12px', marginBottom: '8px'}}>
        {(['str', 'def', 'spd', 'dex'] as const).map((stat) => (
          <div key={stat}>
            <label style={{color: 'white', fontSize: '12px', display: 'block', marginBottom: '4px'}}>
              {stat.toUpperCase()} Energy (%)
            </label>
            <input
              type="number"
              value={energyAllocation[stat] || ''}
              onChange={(e) => setEnergyAllocation({...energyAllocation, [stat]: parseInt(e.target.value) || 0})}
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
        Total Allocation: {totalAllocation}%
        {totalAllocation !== 100 && (
          <span style={{color: '#ffaa88'}}> (Should total 100%)</span>
        )}
      </div>
    </div>
  );
};

export default EnergyAllocation;
