# Torn API Integration Example

This document shows exactly how to integrate the Torn API functionality into your existing gym calculator.

## 🚀 Quick Start Integration

### 1. Install Required Dependencies

```bash
# Core dependencies for API integration
npm install axios

# Optional: For advanced charts (choose one)
npm install recharts  # Recommended - React-specific charts
# OR
npm install chart.js react-chartjs-2  # Alternative option

# Optional: For enhanced date handling
npm install date-fns
```

### 2. Add API Integration to Your App

Here's how to modify your existing `src/app.tsx` to include the API functionality:

```tsx
// Add these imports to your existing app.tsx
import AutoFillSection from './components/api/AutoFillSection';
import { useTornApi } from './hooks/useTornApi';
import StatsProgressChart from './components/charts/StatsProgressChart';

export default function App() {
  const calculator = useGymCalculator();
  const responsive = useResponsive();
  const notifications = useNotifications();
  
  // Add the Torn API hook
  const tornApi = useTornApi({ notifications });

  return (
    <div style={{ /* existing styles */ }}>
      {/* Your existing header */}
      
      {calculator.activeTab === 'calculator' && (
        <>
          {/* Add the AutoFill section after your header but before stats */}
          <AutoFillSection
            setStats={calculator.setStats}
            setHappy={calculator.setHappy}
            setEnergy={calculator.setEnergy}
            setPropertyPerks={calculator.setPropertyPerks}
            setEducationStatSpecific={calculator.setEducationStatSpecific}
            setEducationGeneral={calculator.setEducationGeneral}
            setJobPerks={calculator.setJobPerks}
            setBookPerks={calculator.setBookPerks}
            setSteadfastBonus={calculator.setSteadfastBonus}
            notifications={notifications}
          />

          {/* Your existing components */}
          <StatInput stats={calculator.stats} onChange={calculator.setStats} />
          {/* ... rest of your existing calculator components */}
        </>
      )}

      {calculator.activeTab === 'results' && (
        <>
          {/* Your existing results */}
          <Results /* your existing props */ />
          
          {/* Add charts section */}
          <div style={{
            backgroundColor: '#333333',
            border: '1px solid #555555',
            padding: '8px 12px',
            marginTop: '12px'
          }}>
            <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
              📊 Training Analytics
            </h2>
            
            {/* Example chart with sample data */}
            <StatsProgressChart 
              data={[
                { date: '2024-01-01', strength: 1000000, defense: 800000, speed: 1200000, dexterity: 900000 },
                { date: '2024-01-02', strength: 1005000, defense: 803000, speed: 1208000, dexterity: 904000 },
                { date: '2024-01-03', strength: 1012000, defense: 807000, speed: 1215000, dexterity: 909000 },
              ]}
            />
          </div>
        </>
      )}

      {/* Your existing settings and footer */}
    </div>
  );
}
```

### 3. Add a New "API" Tab (Optional)

You can add a dedicated API tab to your navigation:

```tsx
// In your header navigation section
<div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
  <button onClick={() => calculator.setActiveTab('calculator')}>📊 Calculator</button>
  <button onClick={() => calculator.setActiveTab('results')}>📈 Results</button>
  <button onClick={() => calculator.setActiveTab('api')}>🔗 API</button>  {/* New tab */}
  <button onClick={() => calculator.setActiveTab('settings')}>⚙️ Settings</button>
</div>

// Add the API tab content
{calculator.activeTab === 'api' && (
  <div style={{
    backgroundColor: '#333333',
    border: '1px solid #555555',
    padding: '8px 12px'
  }}>
    <AutoFillSection
      setStats={calculator.setStats}
      setHappy={calculator.setHappy}
      setEnergy={calculator.setEnergy}
      setPropertyPerks={calculator.setPropertyPerks}
      setEducationStatSpecific={calculator.setEducationStatSpecific}
      setEducationGeneral={calculator.setEducationGeneral}
      setJobPerks={calculator.setJobPerks}
      setBookPerks={calculator.setBookPerks}
      setSteadfastBonus={calculator.setSteadfastBonus}
      notifications={notifications}
    />
    
    {/* API Status and Controls */}
    <div style={{
      backgroundColor: '#2a2a2a',
      border: '1px solid #555555',
      padding: '8px 12px',
      marginTop: '12px'
    }}>
      <h3 style={{color: '#88cc88', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
        🔄 Quick Actions
      </h3>
      <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
        <button
          onClick={() => tornApi.autoFillCalculator({
            setStats: calculator.setStats,
            setHappy: calculator.setHappy,
            setEnergy: calculator.setEnergy,
            setPropertyPerks: calculator.setPropertyPerks,
            setEducationStatSpecific: calculator.setEducationStatSpecific,
            setEducationGeneral: calculator.setEducationGeneral,
            setJobPerks: calculator.setJobPerks,
          })}
          disabled={!tornApi.isConnected}
          style={{
            padding: '6px 12px',
            backgroundColor: tornApi.isConnected ? '#4a7c59' : '#666666',
            border: '1px solid #666666',
            color: 'white',
            fontSize: '11px',
            cursor: tornApi.isConnected ? 'pointer' : 'not-allowed'
          }}
        >
          🔄 Sync All Data
        </button>
        
        <button
          onClick={() => calculator.setActiveTab('results')}
          style={{
            padding: '6px 12px',
            backgroundColor: '#4a5c7c',
            border: '1px solid #666666',
            color: 'white',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          📊 View Analytics
        </button>
      </div>
    </div>
  </div>
)}
```

## 🎯 Key Features You Get

### 1. **Auto-Fill Functionality**
- Users enter their Torn API key once
- One-click auto-fill of all stats, happy, energy
- Auto-detection of property, education, and job perks
- Secure local storage of API key

### 2. **Real-Time Data Sync**
- Always up-to-date calculations
- Rate limiting respect (100 requests/minute)
- Connection status indicators
- Error handling with user-friendly messages

### 3. **Data Visualization**
- Progress charts showing stat growth over time
- Training efficiency comparisons
- Goal tracking and projections
- Export capabilities

### 4. **Enhanced User Experience**
- Toast notifications for all actions
- Loading states during API calls
- Tooltips explaining features
- Mobile-responsive design

## 🔧 Customization Options

### 1. **Modify Perk Detection**

Edit `src/services/tornApi.ts` to add more perks:

```typescript
export const detectPropertyPerks = (propertyPerks: string[]): number => {
  const perkValues: Record<string, number> = {
    'Pool': 5,
    'Sauna': 5,
    'Hot Tub': 2.5,
    'Gym': 5,
    'Shooting Range': 5,
    'Your Custom Perk': 10,  // Add your own
  };
  return propertyPerks.reduce((total, perk) => total + (perkValues[perk] || 0), 0);
};
```

### 2. **Add More Chart Types**

Create new chart components in `src/components/charts/`:

```typescript
// TrainingEfficiencyChart.tsx
export const TrainingEfficiencyChart: React.FC<{data: any[]}> = ({ data }) => {
  // Bar chart comparing gym efficiency
  return <div>Your bar chart here</div>;
};

// GoalProjectionChart.tsx  
export const GoalProjectionChart: React.FC<{currentStats: any, targetStats: any}> = ({ currentStats, targetStats }) => {
  // Line chart showing projected time to reach goals
  return <div>Your projection chart here</div>;
};
```

### 3. **Extend API Functionality**

Add more API endpoints in `src/services/tornApi.ts`:

```typescript
class TornApiService {
  // Add faction data
  async getFactionData(): Promise<ApiResponse<any>> {
    return this.makeRequest('faction/?selections=basic,upgrades');
  }

  // Add company data
  async getCompanyData(): Promise<ApiResponse<any>> {
    return this.makeRequest('company/?selections=profile,employees');
  }

  // Add market data
  async getMarketData(): Promise<ApiResponse<any>> {
    return this.makeRequest('market/?selections=bazaar,itemmarket');
  }
}
```

## 🚀 Advanced Features (Future Enhancements)

### 1. **Training Recommendations**
```typescript
// Add to your calculator logic
const getTrainingRecommendations = (currentStats: any, goals: any) => {
  // AI-powered recommendations based on current stats and goals
  return {
    recommendedGym: 'Gym Name',
    recommendedAllocation: { str: 25, def: 25, spd: 25, dex: 25 },
    estimatedTimeToGoal: '2 weeks',
    efficiency: 95
  };
};
```

### 2. **Goal Tracking System**
```typescript
// Add goal tracking to your state
const [goals, setGoals] = useState({
  strength: 2000000,
  defense: 1500000,
  speed: 2500000,
  dexterity: 1800000,
  targetDate: '2024-12-31'
});
```

### 3. **Social Features**
```typescript
// Add sharing capabilities
const shareProgress = () => {
  const shareData = {
    stats: calculator.stats,
    progress: calculateProgress(),
    achievements: getAchievements()
  };
  
  navigator.share({
    title: 'My Torn Training Progress',
    text: `Check out my training progress: STR ${stats.str.toLocaleString()}`,
    url: window.location.href
  });
};
```

## 📊 Example API Response Handling

Here's how the system handles real Torn API responses:

```typescript
// Example: User stats response
{
  "player_id": 123456,
  "name": "YourUsername",
  "level": 50,
  "strength": 1000000,
  "defense": 800000,
  "speed": 1200000,
  "dexterity": 900000,
  "energy": {
    "current": 150,
    "maximum": 150
  },
  "happy": {
    "current": 5000,
    "maximum": 5000
  }
}

// Automatically becomes:
setStats({
  str: 1000000,
  def: 800000, 
  spd: 1200000,
  dex: 900000
});
setHappy(5000);
setEnergy(150);
```

## 🔒 Security Best Practices

1. **API Key Storage**: Keys are base64 encoded (not encrypted) in localStorage
2. **Permissions**: Only request "Public" API permissions
3. **Rate Limiting**: Automatic rate limiting to respect Torn's limits
4. **Error Handling**: Graceful degradation when API is unavailable
5. **No Logging**: API keys are never logged or sent to external services

## 🎯 Implementation Timeline

- **Phase 1** (2-3 hours): Basic auto-fill functionality
- **Phase 2** (1-2 hours): Enhanced perk detection
- **Phase 3** (3-4 hours): Data visualization and charts
- **Phase 4** (2-3 hours): Advanced features and polish

This integration transforms your gym calculator from a manual tool into a fully automated, data-driven training analytics platform that rivals professional fitness tracking applications!
