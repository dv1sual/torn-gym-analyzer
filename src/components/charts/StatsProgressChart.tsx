import React from 'react';

// Simple chart component without external dependencies
// In a real implementation, you'd use recharts or chart.js

interface StatsProgressChartProps {
  data: Array<{
    date: string;
    strength: number;
    defense: number;
    speed: number;
    dexterity: number;
  }>;
  width?: number;
  height?: number;
}

const StatsProgressChart: React.FC<StatsProgressChartProps> = ({ 
  data, 
  width = 600, 
  height = 300 
}) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        width,
        height,
        backgroundColor: '#2a2a2a',
        border: '1px solid #555555',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999999',
        fontSize: '14px'
      }}>
        No training data available
      </div>
    );
  }

  // Calculate chart dimensions
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  // Find min/max values for scaling
  const allValues = data.flatMap(d => [d.strength, d.defense, d.speed, d.dexterity]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;

  // Create SVG path for each stat
  const createPath = (statKey: keyof typeof data[0]) => {
    if (statKey === 'date') return '';
    
    const points = data.map((d, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((d[statKey] as number - minValue) / valueRange) * chartHeight;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const statColors = {
    strength: '#ff6b6b',
    defense: '#4ecdc4',
    speed: '#45b7d1',
    dexterity: '#96ceb4'
  };

  const statLabels = {
    strength: 'STR',
    defense: 'DEF', 
    speed: 'SPD',
    dexterity: 'DEX'
  };

  return (
    <div style={{
      backgroundColor: '#2a2a2a',
      border: '1px solid #555555',
      padding: '12px',
      borderRadius: '4px'
    }}>
      <h3 style={{
        color: '#88cc88',
        fontSize: '14px',
        fontWeight: 'bold',
        margin: '0 0 12px 0'
      }}>
        📈 Stats Progress Over Time
      </h3>

      <div style={{ position: 'relative' }}>
        <svg width={width} height={height} style={{ backgroundColor: '#1a1a1a' }}>
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="25" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#333333" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + chartHeight - (ratio * chartHeight);
            const value = minValue + (ratio * valueRange);
            return (
              <g key={index}>
                <line 
                  x1={padding - 5} 
                  y1={y} 
                  x2={padding} 
                  y2={y} 
                  stroke="#666666" 
                  strokeWidth="1"
                />
                <text 
                  x={padding - 10} 
                  y={y + 4} 
                  fill="#999999" 
                  fontSize="10" 
                  textAnchor="end"
                >
                  {value.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((d, index) => {
            if (index % Math.ceil(data.length / 5) === 0) {
              const x = padding + (index / (data.length - 1)) * chartWidth;
              return (
                <g key={index}>
                  <line 
                    x1={x} 
                    y1={height - padding} 
                    x2={x} 
                    y2={height - padding + 5} 
                    stroke="#666666" 
                    strokeWidth="1"
                  />
                  <text 
                    x={x} 
                    y={height - padding + 18} 
                    fill="#999999" 
                    fontSize="10" 
                    textAnchor="middle"
                  >
                    {new Date(d.date).toLocaleDateString()}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Stat lines */}
          {Object.entries(statColors).map(([stat, color]) => (
            <path
              key={stat}
              d={createPath(stat as keyof typeof data[0])}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Data points */}
          {data.map((d, dataIndex) => 
            Object.entries(statColors).map(([stat, color]) => {
              const x = padding + (dataIndex / (data.length - 1)) * chartWidth;
              const y = padding + chartHeight - ((d[stat as keyof typeof d] as number - minValue) / valueRange) * chartHeight;
              return (
                <circle
                  key={`${stat}-${dataIndex}`}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  stroke="#1a1a1a"
                  strokeWidth="1"
                />
              );
            })
          )}
        </svg>

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '8px',
          flexWrap: 'wrap'
        }}>
          {Object.entries(statColors).map(([stat, color]) => (
            <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '12px',
                height: '2px',
                backgroundColor: color
              }} />
              <span style={{ color: '#cccccc', fontSize: '11px' }}>
                {statLabels[stat as keyof typeof statLabels]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{
        marginTop: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '8px'
      }}>
        {Object.entries(statColors).map(([stat, color]) => {
          const currentValue = data[data.length - 1]?.[stat as keyof typeof data[0]] as number;
          const previousValue = data[data.length - 2]?.[stat as keyof typeof data[0]] as number;
          const change = currentValue - previousValue;
          const changePercent = previousValue ? ((change / previousValue) * 100) : 0;

          return (
            <div key={stat} style={{
              backgroundColor: '#333333',
              border: '1px solid #555555',
              padding: '6px 8px',
              borderRadius: '2px'
            }}>
              <div style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
                {statLabels[stat as keyof typeof statLabels]}
              </div>
              <div style={{ color: '#cccccc', fontSize: '12px' }}>
                {currentValue?.toLocaleString()}
              </div>
              {!isNaN(change) && (
                <div style={{ 
                  color: change >= 0 ? '#88cc88' : '#ff6666', 
                  fontSize: '9px' 
                }}>
                  {change >= 0 ? '+' : ''}{change.toLocaleString()} 
                  ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsProgressChart;

// Example usage component
export const StatsProgressExample: React.FC = () => {
  // Example data - in real implementation, this would come from API
  const exampleData = [
    { date: '2024-01-01', strength: 1000000, defense: 800000, speed: 1200000, dexterity: 900000 },
    { date: '2024-01-02', strength: 1005000, defense: 803000, speed: 1208000, dexterity: 904000 },
    { date: '2024-01-03', strength: 1012000, defense: 807000, speed: 1215000, dexterity: 909000 },
    { date: '2024-01-04', strength: 1018000, defense: 812000, speed: 1223000, dexterity: 915000 },
    { date: '2024-01-05', strength: 1025000, defense: 818000, speed: 1231000, dexterity: 921000 },
  ];

  return <StatsProgressChart data={exampleData} />;
};
