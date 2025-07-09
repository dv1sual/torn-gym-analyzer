import React from 'react';

interface Result {
  name: string;
  perStat: { str: number; def: number; spd: number; dex: number };
  total: number;
}

interface AllocationResult {
  energyPerStat: { str: number; def: number; spd: number; dex: number };
  trainsPerStat: { str: number; def: number; spd: number; dex: number };
  gainsPerStat: { str: number; def: number; spd: number; dex: number };
  totalGain: number;
}

interface ResultsOriginalProps {
  results: Result[];
  selectedGym: string;
  allocationResults: AllocationResult | null;
  showResults: boolean;
  getStatGridColumns: () => string;
}

const ResultsOriginal: React.FC<ResultsOriginalProps> = ({
  results,
  selectedGym,
  allocationResults,
  showResults,
  getStatGridColumns
}) => {
  const sorted = [...results].sort((a, b) => b.total - a.total).slice(0, 10);

  if (!showResults) {
    return (
      <div style={{
        backgroundColor: '#333333',
        border: '1px solid #555555',
        padding: '8px 12px'
      }}>
        <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
          🏆 Training Results
        </h2>
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #555555',
          padding: '20px',
          textAlign: 'center',
          color: '#999999'
        }}>
          Click "Compute Maximum Gains" to see results
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#333333',
      border: '1px solid #555555',
      padding: '8px 12px'
    }}>
      <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
        🏆 Training Results
      </h2>
      
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
          <div style={{display: 'grid', gridTemplateColumns: getStatGridColumns(), gap: '8px', marginBottom: '12px'}}>
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
    </div>
  );
};

export default ResultsOriginal;
