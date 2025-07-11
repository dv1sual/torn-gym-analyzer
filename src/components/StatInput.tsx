import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

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
  const responsive = useResponsive();
  const fontSize = responsive.getMobileFontSize();

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
        padding: responsive.isMobile() ? '8px' : '10px',
        margin: responsive.isMobile() ? '3px' : '5px',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          gap: responsive.isMobile() ? '8px' : '8px', 
          marginBottom: responsive.isMobile() ? '4px' : '8px'
        }}>
          <span style={{
            color: color, 
            fontSize: responsive.isMobile() ? '16px' : '20px'
          }}>
            {label === 'Strength' && '💪'}
            {label === 'Defense' && '🛡️'}
            {label === 'Speed' && '⚡'}
            {label === 'Dexterity' && '🎯'}
          </span>
          <div style={{
            flex: 1,
            minWidth: 0
          }}>
            <div style={{
              color: color, 
              fontSize: responsive.isMobile() ? '11px' : fontSize.normal, 
              fontWeight: 'bold'
            }}>
              {responsive.isMobile() ? label.substring(0, 3).toUpperCase() : label.toUpperCase()}
            </div>
            <div style={{
              color: 'white', 
              fontSize: responsive.isMobile() ? '13px' : '18px', 
              fontWeight: 'bold',
              wordBreak: 'break-all'
            }}>
              {value.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div style={{
          color: '#999999', 
          fontSize: fontSize.small, 
          marginBottom: responsive.isMobile() ? '6px' : '8px'
        }}>
          Current Level
        </div>
        
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            width: '100%',
            backgroundColor: '#222222',
            border: '1px solid #666666',
            color: 'white',
            padding: responsive.isMobile() ? '8px 12px' : '4px 8px',
            fontSize: responsive.isMobile() ? '16px' : '12px', // 16px prevents zoom on iOS
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
          placeholder={responsive.isMobile() ? "1,000,000" : "e.g. 1,000,000"}
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
