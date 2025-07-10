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
   * Restore saved API key on boot
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const saved = localStorage.getItem('tornApiKey');
    if (!saved) return;

    const decoded = decodeApiKey(saved);
    if (!validateApiKey(decoded)) return;

    setApiKey(decoded);
    initializeApiService(decoded);
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
  ): Promise<void> => {
    if (!apiService || !isConnected) {
      notifications.showError('Please connect to the API first');
      return;
    }

    setIsLoading(true);
    try {
      const [statsRes, perksRes] = await Promise.all([
        apiService.getUserStats(),
        apiService.getUserPerks(),
      ]);

      /* stats */
      if (statsRes.success && statsRes.data) {
        const data = statsRes.data as any;
        setUserStats(data);

        const { strength = 0, defense = 0, speed = 0, dexterity = 0 } = data;
        setStats({ str: strength, def: defense, spd: speed, dex: dexterity });

        const happyVal = data.happy?.current ?? data.happy ?? 0;
        const energyVal = data.energy?.current ?? data.energy ?? 0;
        setHappy(happyVal);
        setEnergy(energyVal);
      }

      /* perks */
      if (perksRes.success && perksRes.data) {
        const perks = perksRes.data as any;

        setPropertyPerks(detectPropertyPerks(perks.property_perks ?? []));
        const edu = detectEducationPerks(perks.education_perks ?? []);
        setEducationGeneral(edu.general);
        setEducationStatSpecific(edu.specific);
        setJobPerks(detectJobPerks(perks.job_perks ?? []));
        setBookPerks(detectBookPerks(perks.book_perks ?? []));
        setSteadfastBonus(detectFactionSteadfast(perks.faction_perks ?? []));
      }

      /* bookkeeping */
      setLastSync(new Date());
      setRateLimitInfo(prev => ({
        ...prev,
        remaining: statsRes.rateLimitRemaining ?? prev.remaining,
        lastRequest: Date.now(),
      }));
      notifications.showSuccess('Auto‑fill completed!');
    } catch (err: any) {
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
