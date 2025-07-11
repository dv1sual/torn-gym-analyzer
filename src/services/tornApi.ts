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
  private requestHistory: number[] = []; // Track request timestamps
  private readonly MIN_REQUEST_INTERVAL = 600; // 100 requests per minute = 600ms between requests
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
  private readonly MAX_REQUESTS_PER_MINUTE = 100;

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

          const url = `${this.config.baseUrl}/${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${this.config.apiKey}`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });

          clearTimeout(timeoutId);
          const requestTime = Date.now();
          this.lastRequestTime = requestTime;

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error.error || 'API Error');
          }

          // Track this request in our history
          this.requestHistory.push(requestTime);
          
          // Clean up old requests (older than 1 minute)
          const cutoffTime = requestTime - this.RATE_LIMIT_WINDOW;
          this.requestHistory = this.requestHistory.filter(time => time > cutoffTime);
          
          // Calculate remaining requests based on actual usage
          const requestsInLastMinute = this.requestHistory.length;
          const rateLimitRemaining = Math.max(0, this.MAX_REQUESTS_PER_MINUTE - requestsInLastMinute);

          resolve({
            success: true,
            data,
            rateLimitRemaining
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
    // Request profile, battlestats, and bars (energy/happy) data
    return this.makeRequest('user/?selections=profile,battlestats,bars');
  }

  async getUserPerks(): Promise<ApiResponse<TornPerks>> {
    // Request perks data
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

  getRateLimitStatus(): { requestsInQueue: number; lastRequestTime: number; remaining: number; requestsInLastMinute: number } {
    // Clean up old requests
    const now = Date.now();
    const cutoffTime = now - this.RATE_LIMIT_WINDOW;
    this.requestHistory = this.requestHistory.filter(time => time > cutoffTime);
    
    const requestsInLastMinute = this.requestHistory.length;
    const remaining = Math.max(0, this.MAX_REQUESTS_PER_MINUTE - requestsInLastMinute);
    
    return {
      requestsInQueue: this.requestQueue.length,
      lastRequestTime: this.lastRequestTime,
      remaining,
      requestsInLastMinute
    };
  }
}

export default TornApiService;

// Utility functions for API key management
export const validateApiKey = (apiKey: string): boolean => {
  // Torn API keys are typically 16 characters long and alphanumeric
  return /^[a-zA-Z0-9]{16}$/.test(apiKey);
};

/**
 * Derives a consistent encryption key from browser fingerprint
 */
async function deriveEncryptionKey(): Promise<CryptoKey> {
  // Create a consistent seed from browser characteristics
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString(),
    'torn-gym-calc-v1' // App-specific salt
  ].join('|');

  // Hash the fingerprint to create key material
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Import as AES key
  return crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export const encodeApiKey = async (apiKey: string): Promise<string> => {
  try {
    const key = await deriveEncryptionKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    
    // Generate random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the API key
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine IV + encrypted data and encode as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.warn('AES encryption failed, falling back to base64:', error);
    // Graceful fallback to base64 if crypto fails
    return 'fallback:' + btoa(apiKey);
  }
};

export const decodeApiKey = async (encodedKey: string): Promise<string> => {
  try {
    // Handle fallback case
    if (encodedKey.startsWith('fallback:')) {
      return atob(encodedKey.substring(9));
    }

    const key = await deriveEncryptionKey();
    const combined = new Uint8Array(
      atob(encodedKey).split('').map(char => char.charCodeAt(0))
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.warn('AES decryption failed:', error);
    // Try base64 fallback for old keys
    try {
      return atob(encodedKey);
    } catch {
      return '';
    }
  }
};

// Convenience functions for easier usage
export async function validateAndStoreApiKey(apiKey: string): Promise<boolean> {
  if (!validateApiKey(apiKey)) {
    return false;
  }

  try {
    const encoded = await encodeApiKey(apiKey);
    localStorage.setItem('tornApiKey', encoded);
    return true;
  } catch (error) {
    console.error('Failed to store API key:', error);
    return false;
  }
}

export async function loadStoredApiKey(): Promise<string> {
  try {
    const stored = localStorage.getItem('tornApiKey');
    if (!stored) return '';
    
    return await decodeApiKey(stored);
  } catch (error) {
    console.error('Failed to load API key:', error);
    return '';
  }
}

// Migration utility to upgrade existing base64 keys
export async function migrateOldApiKey(): Promise<boolean> {
  try {
    const stored = localStorage.getItem('tornApiKey');
    if (!stored || stored.includes('fallback:')) return false;

    // Try to decode as base64 (old format)
    const decoded = atob(stored);
    if (validateApiKey(decoded)) {
      // Re-encode with AES
      const newEncoded = await encodeApiKey(decoded);
      localStorage.setItem('tornApiKey', newEncoded);
      console.log('API key migrated to AES encryption');
      return true;
    }
  } catch {
    // Not old format or migration failed
  }
  return false;
}

// Perk detection utilities
export const detectPropertyPerks = (propertyPerks: any[]): number => {
  if (!Array.isArray(propertyPerks)) return 0;
  
  let totalBonus = 0;

  propertyPerks.forEach(perk => {
    const perkText = typeof perk === 'string' ? perk : perk?.name || perk?.description || '';
    
    // Look for gym gains percentage in the perk description
    // Examples: "+ 2% gym gains", "+ 5% gym gains", etc.
    const gymGainsMatch = perkText.match(/\+\s*(\d+(?:\.\d+)?)%\s+gym\s+gains/i);
    
    if (gymGainsMatch) {
      const percentage = parseFloat(gymGainsMatch[1]);
      totalBonus += percentage;
    }
  });

  return totalBonus;
};

export const detectEducationPerks = (educationPerks: any[]): { general: number; specific: number } => {
  if (!Array.isArray(educationPerks)) return { general: 0, specific: 0 };
  
  let general = 0;
  let specific = 0;

  educationPerks.forEach(perk => {
    const perkText = typeof perk === 'string' ? perk : perk?.name || perk?.description || '';
    
    // Look for gym gains percentage in education perks
    // Examples: "+ 5% gym gains", "+ 10% strength gym gains", etc.
    const gymGainsMatch = perkText.match(/\+\s*(\d+(?:\.\d+)?)%\s+(?:(\w+)\s+)?gym\s+gains/i);
    
    if (gymGainsMatch) {
      const percentage = parseFloat(gymGainsMatch[1]);
      const statSpecific = gymGainsMatch[2]; // Could be "strength", "defense", etc.
      
      if (statSpecific) {
        // Stat-specific education perk
        specific += percentage;
      } else {
        // General gym gains perk
        general += percentage;
      }
    }
  });

  return { general, specific };
};

export const detectJobPerks = (jobPerks: any[]): number => {
  if (!Array.isArray(jobPerks)) return 0;
  
  let totalBonus = 0;

  jobPerks.forEach(perk => {
    const perkText = typeof perk === 'string' ? perk : perk?.name || perk?.description || '';
    
    // Look for gym gains percentage in job perks
    // Examples: "+ 5% gym gains", etc.
    const gymGainsMatch = perkText.match(/\+\s*(\d+(?:\.\d+)?)%\s+gym\s+gains/i);
    
    if (gymGainsMatch) {
      const percentage = parseFloat(gymGainsMatch[1]);
      totalBonus += percentage;
    }
  });

  return totalBonus;
};

export const detectBookPerks = (bookPerks: any[]): number => {
  if (!Array.isArray(bookPerks)) return 0;
  
  let totalBonus = 0;

  bookPerks.forEach(book => {
    const bookText = typeof book === 'string' ? book : book?.name || book?.description || '';
    
    // Look for gym gains percentage in book perks
    // Examples: "+ 5% gym gains", etc.
    const gymGainsMatch = bookText.match(/\+\s*(\d+(?:\.\d+)?)%\s+gym\s+gains/i);
    
    if (gymGainsMatch) {
      const percentage = parseFloat(gymGainsMatch[1]);
      totalBonus += percentage;
    }
  });

  return totalBonus;
};

export const detectFactionSteadfast = (
  factionPerks: any[]
): { str: number; def: number; spd: number; dex: number } => {
  const result = { str: 0, def: 0, spd: 0, dex: 0 };
  if (!Array.isArray(factionPerks)) return result;

  const re = /(\d+)%\s+(\w+)\s+gym gains/i;

  factionPerks.forEach(raw => {
    const perk = typeof raw === 'string' ? raw : raw?.name || '';
    const match = perk.match(re);
    if (!match) return;

    const [, pct, stat] = match;
    switch (stat.toLowerCase()) {
      case 'strength':
      case 'str':
        result.str = Number(pct);
        break;
      case 'defense':
      case 'def':
        result.def = Number(pct);
        break;
      case 'speed':
      case 'spd':
        result.spd = Number(pct);
        break;
      case 'dexterity':
      case 'dex':
        result.dex = Number(pct);
        break;
    }
  });

  return result;
};
