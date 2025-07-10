import React, { useState, useEffect } from 'react';
import TornApiService, { 
  validateApiKey, 
  encodeApiKey, 
  decodeApiKey,
  detectPropertyPerks,
  detectEducationPerks,
  detectJobPerks,
  detectBookPerks,
  detectFactionSteadfast,
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
    console.log('🔄 Auto-fill button clicked!'); // Debug log
    
    if (!apiService || !isConnected) {
      console.log('❌ Not connected or no API service'); // Debug log
      notifications.showError('Please connect to the API first');
      return;
    }

    console.log('✅ Starting API fetch...'); // Debug log
    setIsLoading(true);
    
    try {
      console.log('📡 Making API calls...'); // Debug log
      
      // Fetch user stats and perks in parallel
      const [statsResponse, perksResponse] = await Promise.all([
        apiService.getUserStats(),
        apiService.getUserPerks()
      ]);

      console.log('📊 Stats Response:', statsResponse); // Debug log
      console.log('🎯 Perks Response:', perksResponse); // Debug log

      if (statsResponse.success && statsResponse.data) {
        const userData = statsResponse.data as any; // Use any to handle flexible API response
        
        console.log('🔍 Full API Response Data:', userData); // Debug log
        console.log('🔍 Response Keys:', Object.keys(userData)); // Debug log
        
        // Extract data from the API response
        console.log('💪 Available API fields:', Object.keys(userData)); // Debug log
        
        // Extract battle stats directly from the response (they're in the root object)
        const strength = userData.strength || 0;
        const defense = userData.defense || 0; 
        const speed = userData.speed || 0;
        const dexterity = userData.dexterity || 0;
        
        console.log('💪 Extracted Battle Stats:', { strength, defense, speed, dexterity }); // Debug log
        
        // Extract happy and energy directly from the response
        const currentHappy = userData.happy?.current || userData.happy || 0;
        const currentEnergy = userData.energy?.current || userData.energy || 0;
        
        console.log('😊 Extracted Bars:', { currentHappy, currentEnergy }); // Debug log
        
        // Show profile info
        if (userData.name) {
          notifications.showInfo(`Profile loaded for ${userData.name} (Level ${userData.level || 'Unknown'})`);
        }
        
        // Update stats if available
        if (strength || defense || speed || dexterity) {
          setStats({
            str: strength,
            def: defense,
            spd: speed,
            dex: dexterity
          });
          notifications.showSuccess(`Stats updated: STR ${strength.toLocaleString()}, DEF ${defense.toLocaleString()}, SPD ${speed.toLocaleString()}, DEX ${dexterity.toLocaleString()}`);
        } else {
          notifications.showWarning('No battle stats found. Make sure your API key has sufficient permissions.');
        }
        
        // Update happy and energy if available
        if (currentHappy || currentEnergy) {
          if (currentHappy) setHappy(currentHappy);
          if (currentEnergy) setEnergy(currentEnergy);
          notifications.showSuccess(`Updated: Happy ${currentHappy}, Energy ${currentEnergy}`);
        } else {
          notifications.showWarning('No happy/energy data found. Make sure your API key has sufficient permissions.');
        }
      } else {
        console.log('❌ Stats API call failed:', statsResponse.error); // Debug log
        notifications.showError(`Stats API failed: ${statsResponse.error}`);
      }

      if (perksResponse.success && perksResponse.data) {
        const perksData = perksResponse.data as any; // Use any for debugging
        console.log('🎯 Perks Data:', perksData); // Debug log
        
        // Auto-detect and set perks
        const propertyBonus = detectPropertyPerks(perksData.property_perks || []);
        const educationBonus = detectEducationPerks(perksData.education_perks || []);
        const jobBonus = detectJobPerks(perksData.job_perks || []);
        const bookBonus = detectBookPerks(perksData.book_perks || []);
        const factionSteadfast = detectFactionSteadfast(perksData.faction_perks || []);

        console.log('🏠 Detected Perks:', { propertyBonus, educationBonus, jobBonus, bookBonus, factionSteadfast }); // Debug log

        // Update all detected perks
        setPropertyPerks(propertyBonus);
        setEducationGeneral(educationBonus.general);
        setEducationStatSpecific(educationBonus.specific);
        setJobPerks(jobBonus);
        setBookPerks(bookBonus);
        setSteadfastBonus(factionSteadfast);

        // Show comprehensive perk detection results
        const totalEducation = educationBonus.general + educationBonus.specific;
        const totalSteadfast = factionSteadfast.str + factionSteadfast.def + factionSteadfast.spd + factionSteadfast.dex;
        
        if (propertyBonus || totalEducation || jobBonus || bookBonus || totalSteadfast) {
          notifications.showSuccess(`Auto-detected perks: Property +${propertyBonus}%, Education +${totalEducation}%, Job +${jobBonus}%, Book +${bookBonus}%, Steadfast +${totalSteadfast}%`);
        } else {
          notifications.showInfo('No gym-related perks detected in your account.');
        }
      } else {
        console.log('❌ Perks API call failed:', perksResponse.error); // Debug log
        notifications.showWarning(`Perks API failed: ${perksResponse.error || 'Unknown error'}`);
      }

      setLastSync(new Date());
      
      // Update rate limit info
      const rateLimitStatus = apiService.getRateLimitStatus();
      setRateLimitInfo({
        remaining: statsResponse.rateLimitRemaining || rateLimitInfo.remaining,
        lastRequest: rateLimitStatus.lastRequestTime
      });

      console.log('✅ Auto-fill completed!'); // Debug log

    } catch (error) {
      console.error('💥 Auto-fill error:', error); // Debug log
      notifications.showError(`Failed to fetch user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <Tooltip content="Enter your 16-character Torn API key with Limited permissions. Get one from Settings > API Key in Torn.">
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
      <div style={{textAlign: 'center', marginTop: '16px'}}>
        {isLoading ? (
          <LoadingSpinner text="Fetching data from Torn..." />
        ) : (
          <Tooltip content="Automatically fill in your current stats, happy, energy, and detected perks from Torn">
            <button
              onClick={fetchUserData}
              disabled={!isConnected || isLoading}
              style={{
                padding: '24px 48px',
                backgroundColor: isConnected ? '#22c55e' : '#666666',
                border: isConnected ? '3px solid #16a34a' : '3px solid #888888',
                color: 'white',
                fontSize: '22px',
                fontWeight: 'bold',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                boxShadow: isConnected ? '0 8px 16px rgba(34, 197, 94, 0.4)' : 'none',
                minWidth: '450px',
                width: '100%',
                maxWidth: '600px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: isConnected ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : '#666666'
              }}
              onMouseEnter={(e) => {
                if (isConnected) {
                  (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-3px)';
                  (e.target as HTMLButtonElement).style.boxShadow = '0 12px 24px rgba(34, 197, 94, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (isConnected) {
                  (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0px)';
                  (e.target as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(34, 197, 94, 0.4)';
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
  );
};

export default AutoFillSection;
