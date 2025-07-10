import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import TornApiService, { 
  validateApiKey, 
  encodeApiKey, 
  decodeApiKey,
  detectPropertyPerks,
  detectEducationPerks,
  detectJobPerks,
  detectBookPerks,
  detectFactionSteadfast
} from '../services/tornApi';

interface ApiContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  lastSync: Date | null;
  setLastSync: (date: Date | null) => void;
  apiService: TornApiService | null;
  setApiService: (service: TornApiService | null) => void;
  rateLimitInfo: { remaining: number; lastRequest: number };
  setRateLimitInfo: (info: { remaining: number; lastRequest: number }) => void;
  initializeApiService: (key: string) => TornApiService;
  testConnection: (notifications: any) => Promise<void>;
  fetchUserData: (
    setStats: any,
    setHappy: any,
    setEnergy: any,
    setPropertyPerks: any,
    setEducationStatSpecific: any,
    setEducationGeneral: any,
    setJobPerks: any,
    setBookPerks: any,
    setSteadfastBonus: any,
    notifications: any
  ) => Promise<void>;
  clearApiKey: (notifications: any) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  const testConnection = async (notifications: any) => {
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

  const fetchUserData = async (
    setStats: any,
    setHappy: any,
    setEnergy: any,
    setPropertyPerks: any,
    setEducationStatSpecific: any,
    setEducationGeneral: any,
    setJobPerks: any,
    setBookPerks: any,
    setSteadfastBonus: any,
    notifications: any
  ) => {
    console.log('🔄 Auto-fill button clicked!');
    
    if (!apiService || !isConnected) {
      console.log('❌ Not connected or no API service');
      notifications.showError('Please connect to the API first');
      return;
    }

    console.log('✅ Starting API fetch...');
    setIsLoading(true);
    
    try {
      console.log('📡 Making API calls...');
      
      const [statsResponse, perksResponse] = await Promise.all([
        apiService.getUserStats(),
        apiService.getUserPerks()
      ]);

      console.log('📊 Stats Response:', statsResponse);
      console.log('🎯 Perks Response:', perksResponse);

      if (statsResponse.success && statsResponse.data) {
        const userData = statsResponse.data as any;
        
        console.log('🔍 Full API Response Data:', userData);
        console.log('🔍 Response Keys:', Object.keys(userData));
        
        const strength = userData.strength || 0;
        const defense = userData.defense || 0; 
        const speed = userData.speed || 0;
        const dexterity = userData.dexterity || 0;
        
        console.log('💪 Extracted Battle Stats:', { strength, defense, speed, dexterity });
        
        const currentHappy = userData.happy?.current || userData.happy || 0;
        const currentEnergy = userData.energy?.current || userData.energy || 0;
        
        console.log('😊 Extracted Bars:', { currentHappy, currentEnergy });
        
        if (userData.name) {
          notifications.showInfo(`Profile loaded for ${userData.name} (Level ${userData.level || 'Unknown'})`);
        }
        
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
        
        if (currentHappy || currentEnergy) {
          if (currentHappy) setHappy(currentHappy);
          if (currentEnergy) setEnergy(currentEnergy);
          notifications.showSuccess(`Updated: Happy ${currentHappy}, Energy ${currentEnergy}`);
        } else {
          notifications.showWarning('No happy/energy data found. Make sure your API key has sufficient permissions.');
        }
      } else {
        console.log('❌ Stats API call failed:', statsResponse.error);
        notifications.showError(`Stats API failed: ${statsResponse.error}`);
      }

      if (perksResponse.success && perksResponse.data) {
        const perksData = perksResponse.data as any;
        console.log('🎯 Perks Data:', perksData);
        
        const propertyBonus = detectPropertyPerks(perksData.property_perks || []);
        const educationBonus = detectEducationPerks(perksData.education_perks || []);
        const jobBonus = detectJobPerks(perksData.job_perks || []);
        const bookBonus = detectBookPerks(perksData.book_perks || []);
        const factionSteadfast = detectFactionSteadfast(perksData.faction_perks || []);

        console.log('🏠 Detected Perks:', { propertyBonus, educationBonus, jobBonus, bookBonus, factionSteadfast });

        setPropertyPerks(propertyBonus);
        setEducationGeneral(educationBonus.general);
        setEducationStatSpecific(educationBonus.specific);
        setJobPerks(jobBonus);
        setBookPerks(bookBonus);
        setSteadfastBonus(factionSteadfast);

        const totalEducation = educationBonus.general + educationBonus.specific;
        const totalSteadfast = factionSteadfast.str + factionSteadfast.def + factionSteadfast.spd + factionSteadfast.dex;
        
        if (propertyBonus || totalEducation || jobBonus || bookBonus || totalSteadfast) {
          notifications.showSuccess(`Auto-detected perks: Property +${propertyBonus}%, Education +${totalEducation}%, Job +${jobBonus}%, Book +${bookBonus}%, Steadfast +${totalSteadfast}%`);
        } else {
          notifications.showInfo('No gym-related perks detected in your account.');
        }
      } else {
        console.log('❌ Perks API call failed:', perksResponse.error);
        notifications.showWarning(`Perks API failed: ${perksResponse.error || 'Unknown error'}`);
      }

      setLastSync(new Date());
      
      const rateLimitStatus = apiService.getRateLimitStatus();
      setRateLimitInfo({
        remaining: statsResponse.rateLimitRemaining || rateLimitInfo.remaining,
        lastRequest: rateLimitStatus.lastRequestTime
      });

      console.log('✅ Auto-fill completed!');

    } catch (error) {
      console.error('💥 Auto-fill error:', error);
      notifications.showError(`Failed to fetch user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearApiKey = (notifications: any) => {
    setApiKey('');
    setIsConnected(false);
    setUserName('');
    setApiService(null);
    setLastSync(null);
    localStorage.removeItem('tornApiKey');
    notifications.showInfo('API key cleared');
  };

  const value = {
    apiKey,
    setApiKey,
    isConnected,
    setIsConnected,
    isLoading,
    setIsLoading,
    userName,
    setUserName,
    lastSync,
    setLastSync,
    apiService,
    setApiService,
    rateLimitInfo,
    setRateLimitInfo,
    initializeApiService,
    testConnection,
    fetchUserData,
    clearApiKey
  };

  return React.createElement(ApiContext.Provider, { value }, children);
};
