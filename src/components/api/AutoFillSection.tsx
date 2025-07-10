import React, { useState, useEffect } from 'react';
import TornApiService, { 
  validateApiKey, 
  encodeApiKey, 
  decodeApiKey,
  detectPropertyPerks,
  detectEducationPerks,
  detectJobPerks,
  TornUser,
  TornPerks
} from '../../services/tornApi';
import LoadingSpinner from '../LoadingSpinner';
import Tooltip from '../Tooltip';

interface AutoFillSectionProps {
  // Existing calculator state setters
  setStats: (stats: { str: number; def: number; spd: number; dex: number }) => void;
  setHappy: (happy: number) => void;
  setEnergy: (energy: number) => void;
  setPropertyPerks: (value: number) => void;
  setEducationStatSpecific: (value: number) => void;
  setEducationGeneral: (value: number) => void;
  setJobPerks: (value: number) => void;
  setBookPerks: (value: number) => void;
  setSteadfastBonus: (bonus: { str: number; def: number; spd: number; dex: number }) => void;
  // Notification system
  notifications: {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
  };
}

const AutoFillSection: React.FC<AutoFillSectionProps> = ({
  setStats,
  setHappy,
  setEnergy,
  setPropertyPerks,
  setEducationStatSpecific,
  setEducationGeneral,
  setJobPerks,
  setBookPerks,
  setSteadfastBonus,
  notifications
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [apiService, setApiService] = useState<TornApiService | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState({ remaining: 100, lastRequest: 0 });

  // Load saved API key on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem('tornApiKey');
    if (savedKey) {
      const decodedKey = decodeApiKey(savedKey);
      if (validateApiKey(decodedKey)) {
        setApiKey(decodedKey);
        initializeApiService(decodedKey);
      }
    }
  }, []);

  const initializeApiService = (key: string) => {
    const service = new TornApiService({ apiKey: key });
    setApiService(service);
    return service;
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value.trim();
    setApiKey(newKey);
    
    if (validateApiKey(newKey)) {
      // Save encoded key to localStorage
      localStorage.setItem('tornApiKey', encodeApiKey(newKey));
      initializeApiService(newKey);
    } else {
      setIsConnected(false);
      setUserName('');
      setApiService(null);
    }
  };

  const testConnection = async () => {
    if (!apiService || !validateApiKey(apiKey)) {
      notifications.showError('Please enter a valid 16-character API key');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.testConnection();
      
      if (response.success && response.data) {
        setIsConnected(true);
        setUserName(response.data.name);
        setRateLimitInfo(prev => ({ 
          ...prev, 
          remaining: response.rateLimitRemaining || prev.remaining 
        }));
        notifications.showSuccess(`Connected successfully! Welcome, ${response.data.name}`);
      } else {
        setIsConnected(false);
        notifications.showError(`Connection failed: ${response.error}`);
      }
    } catch (error) {
      setIsConnected(false);
      notifications.showError('Connection test failed. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!apiService || !isConnected) {
      notifications.showError('Please connect to the API first');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch user stats and perks in parallel
      const [statsResponse, perksResponse] = await Promise.all([
        apiService.getUserStats(),
        apiService.getUserPerks()
      ]);

      if (statsResponse.success && statsResponse.data) {
        const userData = statsResponse.data as TornUser;
        
        // Update stats
        setStats({
          str: userData.strength,
          def: userData.defense,
          spd: userData.speed,
          dex: userData.dexterity
        });

        // Update happy and energy
        setHappy(userData.happy.current);
        setEnergy(userData.energy.current);

        notifications.showSuccess('Stats updated successfully!');
      }

      if (perksResponse.success && perksResponse.data) {
        const perksData = perksResponse.data as TornPerks;
        
        // Auto-detect and set perks
        const propertyBonus = detectPropertyPerks(perksData.property_perks);
        const educationBonus = detectEducationPerks(perksData.education_perks);
        const jobBonus = detectJobPerks(perksData.job_perks);

        setPropertyPerks(propertyBonus);
        setEducationGeneral(educationBonus.general);
        setEducationStatSpecific(educationBonus.specific);
        setJobPerks(jobBonus);

        // Note: Book perks and steadfast bonuses would need additional API calls
        // or manual detection based on available data

        notifications.showInfo(`Auto-detected perks: Property +${propertyBonus}%, Education +${educationBonus.general + educationBonus.specific}%, Job +${jobBonus}%`);
      }

      setLastSync(new Date());
      
      // Update rate limit info
      const rateLimitStatus = apiService.getRateLimitStatus();
      setRateLimitInfo({
        remaining: statsResponse.rateLimitRemaining || rateLimitInfo.remaining,
        lastRequest: rateLimitStatus.lastRequestTime
      });

    } catch (error) {
      notifications.showError('Failed to fetch user data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearApiKey = () => {
    setApiKey('');
    setIsConnected(false);
    setUserName('');
    setApiService(null);
    setLastSync(null);
    localStorage.removeItem('tornApiKey');
    notifications.showInfo('API key cleared');
  };

  return (
    <div style={{
      backgroundColor: '#333333',
      border: '1px solid #555555',
      padding: '8px 12px',
      marginBottom: '12px'
    }}>
      <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
        🔗 Torn API Integration
      </h2>

      {/* API Key Input */}
      <div style={{marginBottom: '12px'}}>
        <label style={{color: 'white', fontSize: '12px', display: 'block', marginBottom: '4px'}}>
          API Key
          <Tooltip content="Enter your 16-character Torn API key. Get one from Settings > API Key in Torn.">
            <span style={{color: '#88cc88', marginLeft: '4px', cursor: 'help'}}>ℹ️</span>
          </Tooltip>
        </label>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <input
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your 16-character API key"
            style={{
              flex: 1,
              backgroundColor: '#222222',
              border: `1px solid ${validateApiKey(apiKey) ? '#88cc88' : '#666666'}`,
              color: 'white',
              padding: '6px 8px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
          />
          <button
            onClick={testConnection}
            disabled={!validateApiKey(apiKey) || isLoading}
            style={{
              padding: '6px 12px',
              backgroundColor: validateApiKey(apiKey) ? '#4a7c59' : '#666666',
              border: '1px solid #666666',
              color: 'white',
              fontSize: '11px',
              cursor: validateApiKey(apiKey) ? 'pointer' : 'not-allowed',
              borderRadius: '2px'
            }}
          >
            {isLoading ? '...' : 'Test'}
          </button>
          {apiKey && (
            <button
              onClick={clearApiKey}
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
        backgroundColor: isConnected ? '#1a4a2a' : '#4a1a1a',
        border: `1px solid ${isConnected ? '#4a7c59' : '#cc4444'}`,
        borderRadius: '2px'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span style={{fontSize: '12px'}}>
            {isConnected ? '🟢' : '🔴'} 
            {isConnected ? `Connected as ${userName}` : 'Not connected'}
          </span>
          {lastSync && (
            <span style={{fontSize: '10px', color: '#999999'}}>
              Last sync: {lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div style={{fontSize: '10px', color: '#999999'}}>
          Rate limit: {rateLimitInfo.remaining}/100
        </div>
      </div>

      {/* Auto-Fill Button */}
      <div style={{textAlign: 'center'}}>
        {isLoading ? (
          <LoadingSpinner text="Fetching data from Torn..." />
        ) : (
          <Tooltip content="Automatically fill in your current stats, happy, energy, and detected perks from Torn">
            <button
              onClick={fetchUserData}
              disabled={!isConnected || isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: isConnected ? '#4a7c59' : '#666666',
                border: '1px solid #6b9b7a',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (isConnected) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#5a8c69';
                }
              }}
              onMouseLeave={(e) => {
                if (isConnected) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#4a7c59';
                }
              }}
            >
              🔄 Auto-Fill from Torn
            </button>
          </Tooltip>
        )}
      </div>

      {/* API Key Instructions */}
      {!isConnected && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#2a2a2a',
          border: '1px solid #555555',
          borderRadius: '2px'
        }}>
          <div style={{color: '#cccccc', fontSize: '11px', marginBottom: '4px'}}>
            <strong>How to get your API key:</strong>
          </div>
          <ol style={{color: '#999999', fontSize: '10px', margin: 0, paddingLeft: '16px'}}>
            <li>Go to Torn.com → Settings → API Key</li>
            <li>Create a new key with "Public" permissions</li>
            <li>Copy the 16-character key and paste it above</li>
            <li>Click "Test" to verify the connection</li>
          </ol>
          <div style={{color: '#ffaa66', fontSize: '10px', marginTop: '4px'}}>
            ⚠️ Only use "Public" permissions - never share keys with higher permissions!
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoFillSection;
