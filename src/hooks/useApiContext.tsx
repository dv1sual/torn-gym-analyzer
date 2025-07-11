import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import TornApiService, {
  validateApiKey,
  encodeApiKey,
  decodeApiKey,
  validateAndStoreApiKey,
  loadStoredApiKey,
  migrateOldApiKey,
  detectPropertyPerks,
  detectEducationPerks,
  detectJobPerks,
  detectBookPerks,
  detectFactionSteadfast,
} from '../services/tornApi';

/* ------------------------------------------------------------------
 * ApiContext – global access to the Torn API
 * ------------------------------------------------------------------ */

export interface ApiContextType {
  apiKey: string;
  setApiKey: (key: string) => void;

  isConnected: boolean;
  setIsConnected: (value: boolean) => void;

  isLoading: boolean;
  setIsLoading: (value: boolean) => void;

  userName: string;
  setUserName: (value: string) => void;

  lastSync: Date | null;
  setLastSync: (date: Date | null) => void;

  apiService: TornApiService | null;
  setApiService: (svc: TornApiService | null) => void;

  rateLimitInfo: { remaining: number; lastRequest: number };
  setRateLimitInfo: (info: { remaining: number; lastRequest: number }) => void;

  /* full stats object from last fetch */
  userStats: Record<string, unknown> | null;
  setUserStats: (stats: Record<string, unknown> | null) => void;

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

export const useApiContext = (): ApiContextType => {
  const ctx = useContext(ApiContext);
  if (ctx === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return ctx;
};

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [apiService, setApiService] = useState<TornApiService | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState({ remaining: 100, lastRequest: 0 });

  const [userStats, setUserStats] = useState<Record<string, unknown> | null>(null);

  /* ------------------------------------------------------------------
   * Restore saved API key on boot (now with async handling)
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const loadKey = async () => {
      try {
        const decoded = await loadStoredApiKey();
        if (!validateApiKey(decoded)) return;

        setApiKey(decoded);
        initializeApiService(decoded);
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };

    // Auto-migrate old keys and load current key
    migrateOldApiKey();
    loadKey();
  }, []);

  /* helper */
  const initializeApiService = (key: string): TornApiService => {
    const svc = new TornApiService({ apiKey: key });
    setApiService(svc);
    return svc;
  };

  /* test connection */
  const testConnection = async (notifications: any): Promise<void> => {
    if (!validateApiKey(apiKey)) {
      notifications.showError('Please enter a valid 16‑character API key');
      return;
    }

    const svc = apiService ?? initializeApiService(apiKey);

    setIsLoading(true);
    try {
      const res = await svc.testConnection();
      if (res.success && res.data) {
        setIsConnected(true);
        setUserName(res.data.name);
        setRateLimitInfo(prev => ({
          ...prev,
          remaining: res.rateLimitRemaining ?? prev.remaining,
        }));
        notifications.showSuccess(`Connected successfully! Welcome, ${res.data.name}`);
      } else {
        setIsConnected(false);
        notifications.showError(`Connection failed: ${res.error ?? 'Unknown error'}`);
      }
    } catch {
      setIsConnected(false);
      notifications.showError('Connection test failed. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  /* fetch user data */
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
      
      const [statsRes, perksRes] = await Promise.all([
        apiService.getUserStats(),
        apiService.getUserPerks(),
      ]);

      console.log('📊 Stats Response:', statsRes); // Debug log
      console.log('🎯 Perks Response:', perksRes); // Debug log

      /* stats */
      if (statsRes.success && statsRes.data) {
        const data = statsRes.data as any;
        setUserStats(data);

        console.log('🔍 Full API Response Data:', data); // Debug log
        console.log('🔍 Response Keys:', Object.keys(data)); // Debug log

        const { strength = 0, defense = 0, speed = 0, dexterity = 0 } = data;
        console.log('💪 Extracted Battle Stats:', { strength, defense, speed, dexterity }); // Debug log
        
        setStats({ str: strength, def: defense, spd: speed, dex: dexterity });

        const happyVal = data.happy?.current ?? data.happy ?? 0;
        const energyVal = data.energy?.current ?? data.energy ?? 0;
        console.log('😊 Extracted Bars:', { happyVal, energyVal }); // Debug log
        
        setHappy(happyVal);
        setEnergy(energyVal);
      }

      /* perks */
      if (perksRes.success && perksRes.data) {
        const perks = perksRes.data as any;
        console.log('🎯 Perks Data:', perks); // Debug log

        setPropertyPerks(detectPropertyPerks(perks.property_perks ?? []));
        const edu = detectEducationPerks(perks.education_perks ?? []);
        setEducationGeneral(edu.general);
        setEducationStatSpecific(edu.specific);
        setJobPerks(detectJobPerks(perks.job_perks ?? []));
        setBookPerks(detectBookPerks(perks.book_perks ?? []));
        setSteadfastBonus(detectFactionSteadfast(perks.faction_perks ?? []));
        
        console.log('🏠 Detected Perks:', { 
          property: detectPropertyPerks(perks.property_perks ?? []),
          education: edu,
          job: detectJobPerks(perks.job_perks ?? []),
          book: detectBookPerks(perks.book_perks ?? []),
          steadfast: detectFactionSteadfast(perks.faction_perks ?? [])
        }); // Debug log
      }

      /* bookkeeping */
      setLastSync(new Date());
      setRateLimitInfo(prev => ({
        ...prev,
        remaining: statsRes.rateLimitRemaining ?? prev.remaining,
        lastRequest: Date.now(),
      }));
      
      console.log('✅ Auto-fill completed!'); // Debug log
      notifications.showSuccess('Auto‑fill completed!');
    } catch (err: any) {
      console.error('💥 Auto-fill error:', err); // Debug log
      notifications.showError(
        `Failed to fetch user data: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* clear key */
  const clearApiKey = (notifications: any): void => {
    setApiKey('');
    setIsConnected(false);
    setUserName('');
    setApiService(null);
    setLastSync(null);
    setUserStats(null);
    localStorage.removeItem('tornApiKey');
    notifications.showInfo('API key cleared');
  };

  /* context value */
  const value: ApiContextType = {
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
    userStats,
    setUserStats,
    initializeApiService,
    testConnection,
    fetchUserData,
    clearApiKey,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};