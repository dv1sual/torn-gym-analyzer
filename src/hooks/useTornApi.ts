import { useState, useEffect, useCallback } from 'react';
import TornApiService, { 
  TornUser, 
  TornPerks, 
  validateApiKey, 
  encodeApiKey, 
  decodeApiKey,
  detectPropertyPerks,
  detectEducationPerks,
  detectJobPerks
} from '../services/tornApi';

interface UseTornApiProps {
  // Notification system
  notifications: {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
  };
}

interface TornApiState {
  apiKey: string;
  isConnected: boolean;
  isLoading: boolean;
  userName: string;
  lastSync: Date | null;
  rateLimitInfo: {
    remaining: number;
    lastRequest: number;
  };
  userData: TornUser | null;
  perksData: TornPerks | null;
}

interface TornApiActions {
  setApiKey: (key: string) => void;
  testConnection: () => Promise<boolean>;
  fetchUserData: () => Promise<{
    stats?: { str: number; def: number; spd: number; dex: number };
    happy?: number;
    energy?: number;
    perks?: {
      property: number;
      educationGeneral: number;
      educationSpecific: number;
      job: number;
    };
  } | null>;
  clearApiKey: () => void;
  autoFillCalculator: (calculatorSetters: {
    setStats: (stats: { str: number; def: number; spd: number; dex: number }) => void;
    setHappy: (happy: number) => void;
    setEnergy: (energy: number) => void;
    setPropertyPerks: (value: number) => void;
    setEducationStatSpecific: (value: number) => void;
    setEducationGeneral: (value: number) => void;
    setJobPerks: (value: number) => void;
  }) => Promise<boolean>;
}

export const useTornApi = ({ notifications }: UseTornApiProps): TornApiState & TornApiActions => {
  const [state, setState] = useState<TornApiState>({
    apiKey: '',
    isConnected: false,
    isLoading: false,
    userName: '',
    lastSync: null,
    rateLimitInfo: { remaining: 100, lastRequest: 0 },
    userData: null,
    perksData: null
  });

  const [apiService, setApiService] = useState<TornApiService | null>(null);

  // Load saved API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('tornApiKey');
    if (savedKey) {
      const decodedKey = decodeApiKey(savedKey);
      if (validateApiKey(decodedKey)) {
        setState(prev => ({ ...prev, apiKey: decodedKey }));
        const service = new TornApiService({ apiKey: decodedKey });
        setApiService(service);
      }
    }
  }, []);

  const setApiKey = useCallback((key: string) => {
    setState(prev => ({ ...prev, apiKey: key }));
    
    if (validateApiKey(key)) {
      localStorage.setItem('tornApiKey', encodeApiKey(key));
      const service = new TornApiService({ apiKey: key });
      setApiService(service);
    } else {
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        userName: '', 
        userData: null, 
        perksData: null 
      }));
      setApiService(null);
    }
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!apiService || !validateApiKey(state.apiKey)) {
      notifications.showError('Please enter a valid 16-character API key');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await apiService.testConnection();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          userName: response.data!.name,
          rateLimitInfo: {
            ...prev.rateLimitInfo,
            remaining: response.rateLimitRemaining || prev.rateLimitInfo.remaining
          }
        }));
        notifications.showSuccess(`Connected successfully! Welcome, ${response.data.name}`);
        return true;
      } else {
        setState(prev => ({ ...prev, isConnected: false }));
        notifications.showError(`Connection failed: ${response.error}`);
        return false;
      }
    } catch (error) {
      setState(prev => ({ ...prev, isConnected: false }));
      notifications.showError('Connection test failed. Please check your API key.');
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [apiService, state.apiKey, notifications]);

  const fetchUserData = useCallback(async () => {
    if (!apiService || !state.isConnected) {
      notifications.showError('Please connect to the API first');
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const [statsResponse, perksResponse] = await Promise.all([
        apiService.getUserStats(),
        apiService.getUserPerks()
      ]);

      let result: any = {};

      if (statsResponse.success && statsResponse.data) {
        const userData = statsResponse.data as TornUser;
        setState(prev => ({ ...prev, userData }));
        
        result.stats = {
          str: userData.strength,
          def: userData.defense,
          spd: userData.speed,
          dex: userData.dexterity
        };
        result.happy = userData.happy.current;
        result.energy = userData.energy.current;
      }

      if (perksResponse.success && perksResponse.data) {
        const perksData = perksResponse.data as TornPerks;
        setState(prev => ({ ...prev, perksData }));
        
        result.perks = {
          property: detectPropertyPerks(perksData.property_perks),
          educationGeneral: detectEducationPerks(perksData.education_perks).general,
          educationSpecific: detectEducationPerks(perksData.education_perks).specific,
          job: detectJobPerks(perksData.job_perks)
        };
      }

      setState(prev => ({
        ...prev,
        lastSync: new Date(),
        rateLimitInfo: {
          remaining: statsResponse.rateLimitRemaining || prev.rateLimitInfo.remaining,
          lastRequest: apiService.getRateLimitStatus().lastRequestTime
        }
      }));

      return result;
    } catch (error) {
      notifications.showError('Failed to fetch user data. Please try again.');
      return null;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [apiService, state.isConnected, notifications]);

  const autoFillCalculator = useCallback(async (calculatorSetters: {
    setStats: (stats: { str: number; def: number; spd: number; dex: number }) => void;
    setHappy: (happy: number) => void;
    setEnergy: (energy: number) => void;
    setPropertyPerks: (value: number) => void;
    setEducationStatSpecific: (value: number) => void;
    setEducationGeneral: (value: number) => void;
    setJobPerks: (value: number) => void;
  }): Promise<boolean> => {
    const data = await fetchUserData();
    
    if (!data) {
      return false;
    }

    try {
      // Update calculator state
      if (data.stats) {
        calculatorSetters.setStats(data.stats);
        notifications.showSuccess('Stats updated successfully!');
      }

      if (typeof data.happy === 'number') {
        calculatorSetters.setHappy(data.happy);
      }

      if (typeof data.energy === 'number') {
        calculatorSetters.setEnergy(data.energy);
      }

      if (data.perks) {
        calculatorSetters.setPropertyPerks(data.perks.property);
        calculatorSetters.setEducationGeneral(data.perks.educationGeneral);
        calculatorSetters.setEducationStatSpecific(data.perks.educationSpecific);
        calculatorSetters.setJobPerks(data.perks.job);

        const totalPerks = data.perks.property + data.perks.educationGeneral + 
                          data.perks.educationSpecific + data.perks.job;
        
        if (totalPerks > 0) {
          notifications.showInfo(
            `Auto-detected perks: Property +${data.perks.property}%, ` +
            `Education +${data.perks.educationGeneral + data.perks.educationSpecific}%, ` +
            `Job +${data.perks.job}%`
          );
        }
      }

      return true;
    } catch (error) {
      notifications.showError('Failed to update calculator with API data');
      return false;
    }
  }, [fetchUserData, notifications]);

  const clearApiKey = useCallback(() => {
    setState({
      apiKey: '',
      isConnected: false,
      isLoading: false,
      userName: '',
      lastSync: null,
      rateLimitInfo: { remaining: 100, lastRequest: 0 },
      userData: null,
      perksData: null
    });
    setApiService(null);
    localStorage.removeItem('tornApiKey');
    notifications.showInfo('API key cleared');
  }, [notifications]);

  return {
    ...state,
    setApiKey,
    testConnection,
    fetchUserData,
    clearApiKey,
    autoFillCalculator
  };
};

export default useTornApi;

// Utility hook for training history data
export const useTrainingHistory = (apiService: TornApiService | null, days: number = 30) => {
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainingHistory = useCallback(async () => {
    if (!apiService) {
      setError('API service not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getTrainingHistory(days);
      
      if (response.success && response.data) {
        // Process the training data into chart-friendly format
        const processedData = processTrainingData(response.data);
        setTrainingData(processedData);
      } else {
        setError(response.error || 'Failed to fetch training history');
      }
    } catch (err) {
      setError('Error fetching training history');
    } finally {
      setIsLoading(false);
    }
  }, [apiService, days]);

  useEffect(() => {
    if (apiService) {
      fetchTrainingHistory();
    }
  }, [fetchTrainingHistory]);

  return {
    trainingData,
    isLoading,
    error,
    refetch: fetchTrainingHistory
  };
};

// Helper function to process training data
const processTrainingData = (rawData: any) => {
  // This would process the raw API response into chart-friendly format
  // Implementation depends on the actual API response structure
  return [];
};
