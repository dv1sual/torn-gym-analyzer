import React from 'react';

interface SettingsTabProps {
  dynamicHappy: boolean;
  setDynamicHappy: (value: boolean) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  resetAllSettings: () => void;
  getSettingsGridColumns: () => string;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  dynamicHappy,
  setDynamicHappy,
  darkMode,
  setDarkMode,
  resetAllSettings,
  getSettingsGridColumns
}) => {
  return (
    <div style={{
      backgroundColor: '#333333',
      border: '1px solid #555555',
      padding: '8px 12px'
    }}>
      <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
        ⚙️ Settings
      </h2>
      <div style={{display: 'grid', gridTemplateColumns: getSettingsGridColumns(), gap: '12px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span style={{color: '#cccccc', fontSize: '12px'}}>Dynamic Happy Loss</span>
          <button
            onClick={() => setDynamicHappy(!dynamicHappy)}
            style={{
              width: '40px',
              height: '20px',
              backgroundColor: dynamicHappy ? '#88cc88' : '#444444',
              border: '1px solid #666666',
              cursor: 'pointer',
              fontSize: '10px',
              color: 'white'
            }}
          >
            {dynamicHappy ? 'ON' : 'OFF'}
          </button>
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span style={{color: '#cccccc', fontSize: '12px'}}>Dark Mode</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              width: '40px',
              height: '20px',
              backgroundColor: darkMode ? '#88cc88' : '#444444',
              border: '1px solid #666666',
              cursor: 'pointer',
              fontSize: '10px',
              color: 'white'
            }}
          >
            {darkMode ? 'ON' : 'OFF'}
          </button>
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span style={{color: '#cccccc', fontSize: '12px'}}>Reset All Settings</span>
          <button
            onClick={resetAllSettings}
            style={{
              padding: '2px 8px',
              backgroundColor: '#cc4444',
              border: '1px solid #666666',
              cursor: 'pointer',
              fontSize: '11px',
              color: 'white'
            }}
          >
            🗑️ Reset
          </button>
        </div>
      </div>
      <div style={{color: '#cccccc', fontSize: '10px', marginTop: '8px'}}>
        💾 Auto-Save: Settings are automatically saved between sessions.
      </div>
    </div>
  );
};

export default SettingsTab;
