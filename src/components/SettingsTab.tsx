import React, { useState } from 'react';
import { useApiContext } from '../hooks/useApiContext';
import { validateApiKey, validateAndStoreApiKey } from '../services/tornApi';
import LoadingSpinner from './LoadingSpinner';
import Tooltip from './Tooltip';

interface NotificationMethods {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

interface SettingsTabProps {
  notifications: NotificationMethods;
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
  notifications,
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
  const apiContext = useApiContext();

  const handleApiKeyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value.trim();
    apiContext.setApiKey(newKey);
    
    if (validateApiKey(newKey)) {
      // Save encrypted key to localStorage
      await validateAndStoreApiKey(newKey);
      apiContext.initializeApiService(newKey);
    } else {
      apiContext.setIsConnected(false);
      apiContext.setUserName('');
      apiContext.setApiService(null);
    }
  };

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
      notifications.showSuccess('Settings exported to clipboard! You can now paste this data to share your configuration.');
    }).catch(() => {
      // Fallback: show in a text area for manual copy
      const textarea = document.createElement('textarea');
      textarea.value = jsonString;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      notifications.showSuccess('Settings exported to clipboard! You can now paste this data to share your configuration.');
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

      notifications.showSuccess('Settings imported successfully!');
      setImportText('');
      setShowImport(false);
    } catch (error) {
      notifications.showError('Error importing settings: Invalid JSON format. Please check your data and try again.');
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

      {/* API Integration Section */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #555555',
        padding: '8px 12px',
        marginBottom: '8px'
      }}>
        <h3 style={{color: '#88cc88', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
          🔗 Torn API Integration
        </h3>

        {/* API Key Input */}
        <div style={{marginBottom: '12px'}}>
          <label style={{color: 'white', fontSize: '12px', display: 'block', marginBottom: '4px'}}>
            API Key
            <Tooltip content="Enter your 16-character Torn API key with Limited permissions. Get one from Settings > API Key in Torn.">
              <span style={{color: '#88cc88', marginLeft: '4px', cursor: 'help'}}>ℹ️</span>
            </Tooltip>
          </label>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <input
              type="password"
              value={apiContext.apiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter your 16-character API key"
              style={{
                flex: 1,
                backgroundColor: '#222222',
                border: `1px solid ${validateApiKey(apiContext.apiKey) ? '#88cc88' : '#666666'}`,
                color: 'white',
                padding: '6px 8px',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={() => apiContext.testConnection(notifications)}
              disabled={!validateApiKey(apiContext.apiKey) || apiContext.isLoading}
              style={{
                padding: '6px 12px',
                backgroundColor: validateApiKey(apiContext.apiKey) ? '#4a7c59' : '#666666',
                border: '1px solid #666666',
                color: 'white',
                fontSize: '11px',
                cursor: validateApiKey(apiContext.apiKey) ? 'pointer' : 'not-allowed',
                borderRadius: '2px'
              }}
            >
              {apiContext.isLoading ? '...' : 'Test'}
            </button>
            {apiContext.apiKey && (
              <button
                onClick={() => apiContext.clearApiKey(notifications)}
                style={{
                  padding: '6px 8px',
                  backgroundColor: '#cc4444',
                  border: '1px solid #666666',
                  color: 'white',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '6px 8px',
          backgroundColor: apiContext.isConnected ? '#1a4a2a' : '#4a1a1a',
          border: `1px solid ${apiContext.isConnected ? '#4a7c59' : '#cc4444'}`,
          borderRadius: '2px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{fontSize: '12px'}}>
              {apiContext.isConnected ? '🟢' : '🔴'} 
              {apiContext.isConnected ? `Connected as ${apiContext.userName}` : 'Not connected'}
            </span>
            {apiContext.lastSync && (
              <span style={{fontSize: '10px', color: '#999999'}}>
                Last sync: {apiContext.lastSync.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div style={{fontSize: '10px', color: '#999999'}}>
            Rate limit: {apiContext.rateLimitInfo.remaining}/100
          </div>
        </div>


        {/* API Key Instructions */}
        {!apiContext.isConnected && (
          <div style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#333333',
            border: '1px solid #555555',
            borderRadius: '2px'
          }}>
            <div style={{color: '#cccccc', fontSize: '11px', marginBottom: '4px'}}>
              <strong>How to get your API key:</strong>
            </div>
            <ol style={{color: '#999999', fontSize: '10px', margin: 0, paddingLeft: '16px'}}>
              <li>Go to Torn.com → Settings → API Key</li>
              <li>Create a new key with "Limited" permissions</li>
              <li>Copy the 16-character key and paste it above</li>
              <li>Click "Test" to verify the connection</li>
            </ol>
            <div style={{color: '#ffaa66', fontSize: '10px', marginTop: '4px'}}>
              ⚠️ Only use "Limited" permissions - never share keys with higher permissions!
            </div>
          </div>
        )}
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