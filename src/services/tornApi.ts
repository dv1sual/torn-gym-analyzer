// Torn API Service Layer
// Handles all communication with the Torn API

export interface TornApiConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface TornUser {
  player_id: number;
  name: string;
  level: number;
  strength: number;
  defense: number;
  speed: number;
  dexterity: number;
  energy: {
    current: number;
    maximum: number;
  };
  happy: {
    current: number;
    maximum: number;
  };
  faction?: {
    faction_id: number;
    name: string;
  };
}

export interface TornPerks {
  job_perks: string[];
  property_perks: string[];
  education_perks: string[];
  book_perks: string[];
  faction_perks: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimitRemaining?: number;
}

class TornApiService {
  private config: TornApiConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 600; // 100 requests per minute = 600ms between requests

  constructor(config: TornApiConfig) {
    this.config = {
      baseUrl: 'https://api.torn.com',
      timeout: 10000,
      ...config
    };
  }

  private async makeRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      this.requestQueue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          
          if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            await new Promise(resolve => 
              setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
            );
          }

          const url = `${this.config.baseUrl}/${endpoint}&key=${this.config.apiKey}`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });

          clearTimeout(timeoutId);
          this.lastRequestTime = Date.now();

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error.error || 'API Error');
          }

          resolve({
            success: true,
            data,
            rateLimitRemaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0')
          });

        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
      }
    }

    this.isProcessingQueue = false;
  }

  async testConnection(): Promise<ApiResponse<{ player_id: number; name: string }>> {
    return this.makeRequest('user/?selections=profile');
  }

  async getUserStats(): Promise<ApiResponse<TornUser>> {
    return this.makeRequest('user/?selections=profile,battlestats');
  }

  async getUserPerks(): Promise<ApiResponse<TornPerks>> {
    return this.makeRequest('user/?selections=perks');
  }

  async getFactionInfo(): Promise<ApiResponse<{ faction_id: number; name: string }>> {
    return this.makeRequest('faction/?selections=basic');
  }

  async getTrainingHistory(days: number = 30): Promise<ApiResponse<any>> {
    return this.makeRequest(`user/?selections=personalstats&stat=trainingtimesstrength,trainingtimesdefense,trainingtimesspeed,trainingtimesdexterity&timestamp=${Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60)}`);
  }

  updateApiKey(newApiKey: string) {
    this.config.apiKey = newApiKey;
  }

  getRateLimitStatus(): { requestsInQueue: number; lastRequestTime: number } {
    return {
      requestsInQueue: this.requestQueue.length,
      lastRequestTime: this.lastRequestTime
    };
  }
}

export default TornApiService;

// Utility functions for API key management
export const validateApiKey = (apiKey: string): boolean => {
  // Torn API keys are typically 16 characters long and alphanumeric
  return /^[a-zA-Z0-9]{16}$/.test(apiKey);
};

export const encodeApiKey = (apiKey: string): string => {
  // Simple base64 encoding for storage (not for security, just obfuscation)
  return btoa(apiKey);
};

export const decodeApiKey = (encodedKey: string): string => {
  try {
    return atob(encodedKey);
  } catch {
    return '';
  }
};

// Perk detection utilities
export const detectPropertyPerks = (propertyPerks: string[]): number => {
  const perkValues: Record<string, number> = {
    'Pool': 5,
    'Sauna': 5,
    'Hot Tub': 2.5,
    'Gym': 5,
    'Shooting Range': 5,
    // Add more property perks as needed
  };

  return propertyPerks.reduce((total, perk) => total + (perkValues[perk] || 0), 0);
};

export const detectEducationPerks = (educationPerks: string[]): { general: number; specific: number } => {
  const generalPerks = ['Sports Science', 'Advanced Sports Science'];
  const specificPerks = ['Strength Training', 'Defense Training', 'Speed Training', 'Dexterity Training'];

  const general = educationPerks.filter(perk => generalPerks.includes(perk)).length * 5;
  const specific = educationPerks.filter(perk => specificPerks.includes(perk)).length * 10;

  return { general, specific };
};

export const detectJobPerks = (jobPerks: string[]): number => {
  const gymRelatedPerks = ['Gym Guru', 'Fitness Instructor', 'Personal Trainer'];
  return jobPerks.filter(perk => gymRelatedPerks.includes(perk)).length * 5;
};
