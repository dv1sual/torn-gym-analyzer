import React from 'react';

type StatAllocation = {
  str: number;
  def: number;
  spd: number;
  dex: number;
};

interface StatInputProps {
  stats: StatAllocation;
  onChange: (stats: StatAllocation) => void;
}

const StatInput: React.FC<StatInputProps> = ({ stats, onChange }) => {
  const StatInputField = ({ label, value, onChange, color }: { label: string; value: number; onChange: (val: number) => void; color: string }) => {
    const [inputValue, setInputValue] = React.useState(value.toString());
    const [isFocused, setIsFocused] = React.useState(false);

    // Update input value when prop changes (but not when focused)
    React.useEffect(() => {
      if (!isFocused) {
        setInputValue(value.toString());
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (e.target.value === '0') {
        setInputValue('');
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const cleanValue = e.target.value.replace(/,/g, '');
      const numValue = parseInt(cleanValue) || 0;
      onChange(numValue);
      setInputValue(numValue.toString());
    };

    return (
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
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
  };

  return (
    <>
      <StatInputField 
        label="Strength" 
        value={stats.str} 
        onChange={(val) => onChange({...stats, str: val})}
        color="#88cc88"
      />
      <StatInputField 
        label="Defense" 
        value={stats.def} 
        onChange={(val) => onChange({...stats, def: val})}
        color="#88cc88"
      />
      <StatInputField 
        label="Speed" 
        value={stats.spd} 
        onChange={(val) => onChange({...stats, spd: val})}
        color="#88cc88"
      />
      <StatInputField 
        label="Dexterity" 
        value={stats.dex} 
        onChange={(val) => onChange({...stats, dex: val})}
        color="#88cc88"
      />
    </>
  );
};

export default StatInput;
