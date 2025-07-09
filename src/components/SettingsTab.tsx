import React, { useState } from 'react';

interface SettingsTabProps {
  dynamicHappy: boolean;
  setDynamicHappy: (value: boolean) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  resetAllSettings: () => void;
  getSettingsGridColumns: () => string;
  // All calculator state for export/import
  stats: { str: number; def: number; spd: number; dex: number };
  setStats: (stats: { str: number; def: number; spd: number; dex: number }) => void;
  happy: number;
  setHappy: (happy: number) => void;
  energy: number;
  setEnergy: (energy: number) => void;
  selectedGym: string;
  setSelectedGym: (gym: string) => void;
  energyAllocation: { str: number; def: number; spd: number; dex: number };
  setEnergyAllocation: (allocation: { str: number; def: number; spd: number; dex: number }) => void;
  propertyPerks: number;
  setPropertyPerks: (value: number) => void;
  educationStatSpecific: number;
  setEducationStatSpecific: (value: number) => void;
  educationGeneral: number;
  setEducationGeneral: (value: number) => void;
  jobPerks: number;
  setJobPerks: (value: number) => void;
  bookPerks: number;
  setBookPerks: (value: number) => void;
  steadfastBonus: { str: number; def: number; spd: number; dex: number };
  setSteadfastBonus: (bonus: { str: number; def: number; spd: number; dex: number }) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  dynamicHappy,
  setDynamicHappy,
  darkMode,
  setDarkMode,
  resetAllSettings,
  getSettingsGridColumns,
  stats,
  setStats,
  happy,
  setHappy,
  energy,
  setEnergy,
  selectedGym,
  setSelectedGym,
  energyAllocation,
  setEnergyAllocation,
  propertyPerks,
  setPropertyPerks,
  educationStatSpecific,
  setEducationStatSpecific,
  educationGeneral,
  setEducationGeneral,
  jobPerks,
  setJobPerks,
  bookPerks,
  setBookPerks,
  steadfastBonus,
  setSteadfastBonus
}) => {
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const exportSettings = () => {
    const settingsData = {
      stats,
      happy,
      energy,
      selectedGym,
      energyAllocation,
      propertyPerks,
      educationStatSpecific,
      educationGeneral,
      jobPerks,
      bookPerks,
      steadfastBonus,
      dynamicHappy,
      darkMode,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const jsonString = JSON.stringify(settingsData, null, 2);
    
    // Copy to clipboard
    navigator.clipboard.writeText(jsonString).then(() => {
      alert('Settings exported to clipboard! You can now paste this data to share your configuration.');
    }).catch(() => {
      // Fallback: show in a text area for manual copy
      const textarea = document.createElement('textarea');
      textarea.value = jsonString;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Settings exported to clipboard! You can now paste this data to share your configuration.');
    });
  };

  const importSettings = () => {
    try {
      const settingsData = JSON.parse(importText);
      
      // Validate the data structure
      if (!settingsData || typeof settingsData !== 'object') {
        throw new Error('Invalid settings format');
      }

      // Apply settings with validation
      if (settingsData.stats) setStats(settingsData.stats);
      if (typeof settingsData.happy === 'number') setHappy(settingsData.happy);
      if (typeof settingsData.energy === 'number') setEnergy(settingsData.energy);
      if (settingsData.selectedGym) setSelectedGym(settingsData.selectedGym);
      if (settingsData.energyAllocation) setEnergyAllocation(settingsData.energyAllocation);
      if (typeof settingsData.propertyPerks === 'number') setPropertyPerks(settingsData.propertyPerks);
      if (typeof settingsData.educationStatSpecific === 'number') setEducationStatSpecific(settingsData.educationStatSpecific);
      if (typeof settingsData.educationGeneral === 'number') setEducationGeneral(settingsData.educationGeneral);
      if (typeof settingsData.jobPerks === 'number') setJobPerks(settingsData.jobPerks);
      if (typeof settingsData.bookPerks === 'number') setBookPerks(settingsData.bookPerks);
      if (settingsData.steadfastBonus) setSteadfastBonus(settingsData.steadfastBonus);
      if (typeof settingsData.dynamicHappy === 'boolean') setDynamicHappy(settingsData.dynamicHappy);
      if (typeof settingsData.darkMode === 'boolean') setDarkMode(settingsData.darkMode);

      alert('Settings imported successfully!');
      setImportText('');
      setShowImport(false);
    } catch (error) {
      alert('Error importing settings: Invalid JSON format. Please check your data and try again.');
    }
  };
  return (
    <div style={{
      backgroundColor: '#333333',
      border: '1px solid #555555',
      padding: '8px 12px'
    }}>
      <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
        ⚙️ Settings
      </h2>
      
      {/* Basic Settings */}
      <div style={{display: 'grid', gridTemplateColumns: getSettingsGridColumns(), gap: '12px', marginBottom: '12px'}}>
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

      {/* Export/Import Section */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #555555',
        padding: '8px 12px',
        marginBottom: '8px'
      }}>
        <h3 style={{color: '#88cc88', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
          📤 Export/Import Settings
        </h3>
        
        <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
          <button
            onClick={exportSettings}
            style={{
              padding: '4px 8px',
              backgroundColor: '#4a7c59',
              border: '1px solid #6b9b7a',
              cursor: 'pointer',
              fontSize: '11px',
              color: 'white',
              borderRadius: '2px'
            }}
          >
            📋 Export to Clipboard
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            style={{
              padding: '4px 8px',
              backgroundColor: showImport ? '#7c7c4a' : '#4a5c7c',
              border: '1px solid #666666',
              cursor: 'pointer',
              fontSize: '11px',
              color: 'white',
              borderRadius: '2px'
            }}
          >
            📥 {showImport ? 'Cancel Import' : 'Import Settings'}
          </button>
        </div>

        {showImport && (
          <div style={{marginTop: '8px'}}>
            <label style={{color: '#cccccc', fontSize: '11px', display: 'block', marginBottom: '4px'}}>
              Paste exported settings JSON:
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your exported settings here..."
              style={{
                width: '100%',
                height: '80px',
                backgroundColor: '#222222',
                border: '1px solid #666666',
                color: 'white',
                padding: '4px 6px',
                fontSize: '10px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
            <div style={{display: 'flex', gap: '8px', marginTop: '4px'}}>
              <button
                onClick={importSettings}
                disabled={!importText.trim()}
                style={{
                  padding: '4px 8px',
                  backgroundColor: importText.trim() ? '#4a7c59' : '#444444',
                  border: '1px solid #666666',
                  cursor: importText.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '10px',
                  color: 'white',
                  borderRadius: '2px'
                }}
              >
                ✅ Apply Settings
              </button>
            </div>
          </div>
        )}

        <div style={{color: '#999999', fontSize: '10px', marginTop: '8px'}}>
          💡 Use export/import to share your configuration for debugging or backup purposes.
        </div>
      </div>

      <div style={{color: '#cccccc', fontSize: '10px'}}>
        💾 Auto-Save: Settings are automatically saved between sessions.
      </div>
    </div>
  );
};

export default SettingsTab;
