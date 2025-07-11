import React from 'react';
import { useGymCalculator } from './hooks/useGymCalculator';
import { useResponsive } from './hooks/useResponsive';
import { ApiProvider } from './hooks/useApiContext';
import StatInput from './components/StatInput';
import TrainingSetup from './components/TrainingSetup';
import GymSelector from './components/GymSelector';
import EnergyAllocation from './components/EnergyAllocation';
import PerksBonuses from './components/PerksBonuses';
import FactionSteadfast from './components/FactionSteadfast';
import Results from './components/Results';
import SettingsTab from './components/SettingsTab';
import Tooltip from './components/Tooltip';
import LoadingSpinner from './components/LoadingSpinner';
import NotificationSystem, { useNotifications } from './components/NotificationSystem';
import { useApiContext } from './hooks/useApiContext';
import tornLogo from './assets/torn_logo.webp';


function AppContent() {
  const calculator = useGymCalculator();
  const responsive = useResponsive();
  const notifications = useNotifications();
  const apiContext = useApiContext();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#191919',
      color: '#cccccc',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        backgroundColor: '#191919',
        padding: responsive.screenSize === 'mobile' ? '10px' : '20px 0'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #444444',
          borderBottom: '2px solid #444444',
          padding: '8px 12px',
          marginBottom: '12px'
        }}>
          <div style={{
            display: 'flex', 
            flexDirection: responsive.screenSize === 'mobile' ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: responsive.screenSize === 'mobile' ? '8px' : '0px'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <img
                src={tornLogo}
                alt="Torn logo"
                style={{
                  width: 'auto',
                  height: 40,
                  objectFit: 'contain',
                  border: '1px solid #333',
                  borderRadius: 2,
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.5)',
                }}
              />
              <h1 style={{color: 'white', fontSize: '16px', fontWeight: 'bold', margin: 0}}>
                TRAINING GAINS CALCULATOR
              </h1>
            </div>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
              <button 
                onClick={() => calculator.setActiveTab('calculator')}
                style={{
                  padding: '4px 8px',
                  backgroundColor: calculator.activeTab === 'calculator' ? '#88cc88' : '#444444',
                  border: '1px solid #666666',
                  color: 'white',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (calculator.activeTab !== 'calculator') {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#555555';
                  }
                }}
                onMouseLeave={(e) => {
                  if (calculator.activeTab !== 'calculator') {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#444444';
                  }
                }}
              >
                📊 Calculator
              </button>
              <button 
                onClick={() => calculator.setActiveTab('results')}
                style={{
                  padding: '4px 8px',
                  backgroundColor: calculator.activeTab === 'results' ? '#88cc88' : '#444444',
                  border: '1px solid #666666',
                  color: 'white',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (calculator.activeTab !== 'results') {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#555555';
                  }
                }}
                onMouseLeave={(e) => {
                  if (calculator.activeTab !== 'results') {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#444444';
                  }
                }}
              >
                📈 Results
              </button>
              <button 
                onClick={() => calculator.setActiveTab('settings')}
                style={{
                  padding: '4px 8px',
                  backgroundColor: calculator.activeTab === 'settings' ? '#88cc88' : '#444444',
                  border: '1px solid #666666',
                  color: 'white',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (calculator.activeTab !== 'settings') {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#555555';
                  }
                }}
                onMouseLeave={(e) => {
                  if (calculator.activeTab !== 'settings') {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#444444';
                  }
                }}
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #555555',
          padding: '10px',
          fontSize: '12px',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {apiContext.userStats ? (
            <strong style={{ color: '#ccc' /* ← full line in bold */ }}>
              {apiContext.userStats.name as string}
              {' · '}
              {apiContext.userStats.rank as string}
              {' · '}
              {(apiContext.userStats.faction as any).position} of&nbsp;
              {(apiContext.userStats.faction as any).faction_name}
            </strong>
          ) : (
            <span style={{ color: '#ccc' }}>
              Training Prediction using&nbsp;
              <span style={{ color: '#88cc88', fontWeight: 'bold' }}>
                Vladar Formula
              </span>
            </span>
          )}
          {calculator.activeTab === 'calculator' && apiContext.isConnected && (
            <Tooltip content="Auto-fill stats and perks from Torn API" position="top" maxWidth="300px">
              <button
                onClick={() => apiContext.fetchUserData(
                  calculator.setStats,
                  calculator.setHappy,
                  calculator.setEnergy,
                  calculator.setPropertyPerks,
                  calculator.setEducationStatSpecific,
                  calculator.setEducationGeneral,
                  calculator.setJobPerks,
                  calculator.setBookPerks,
                  calculator.setSteadfastBonus,
                  notifications
                )}
                disabled={apiContext.isLoading}
                style={{
                  padding: '8px 20px',
                  backgroundColor: apiContext.isLoading ? '#666666' : '#4a7c59',
                  border: '1px solid #6b9b7a',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: apiContext.isLoading ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  minWidth: '140px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!apiContext.isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#5a8c69';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!apiContext.isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#4a7c59';
                  }
                }}
              >
                {apiContext.isLoading ? '...' : '🔄 Auto-Fill'}
              </button>
            </Tooltip>
          )}
        </div>

        {calculator.activeTab === 'calculator' && (
          <>
            {/* Current Stats */}
            <div style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #444444',
              padding: '8px 12px',
              marginBottom: '12px'
            }}>
              <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
                📊 Current Stats
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: responsive.getStatGridColumns(),
                gap: '0px'
              }}>
                <StatInput 
                  stats={calculator.stats}
                  onChange={calculator.setStats}
                />
              </div>
            </div>

            {/* Training Setup */}
            <TrainingSetup
              happy={calculator.happy}
              setHappy={calculator.setHappy}
              energy={calculator.energy}
              setEnergy={calculator.setEnergy}
            />

            {/* Gym Selection */}
            <GymSelector
              selectedGym={calculator.selectedGym}
              onGymSelect={calculator.setSelectedGym}
              screenSize={responsive.screenSize}
              getGymGridColumns={responsive.getGymGridColumns}
            />

            {/* Energy Allocation */}
            <EnergyAllocation
              energyAllocation={calculator.energyAllocation}
              setEnergyAllocation={calculator.setEnergyAllocation}
              getStatGridColumns={responsive.getStatGridColumns}
            />

            {/* Perks Bonuses */}
            <PerksBonuses
              propertyPerks={calculator.propertyPerks}
              setPropertyPerks={calculator.setPropertyPerks}
              educationStatSpecific={calculator.educationStatSpecific}
              setEducationStatSpecific={calculator.setEducationStatSpecific}
              educationGeneral={calculator.educationGeneral}
              setEducationGeneral={calculator.setEducationGeneral}
              jobPerks={calculator.jobPerks}
              setJobPerks={calculator.setJobPerks}
              bookPerks={calculator.bookPerks}
              setBookPerks={calculator.setBookPerks}
              getPerksGridColumns={responsive.getPerksGridColumns}
            />

            {/* Faction Steadfast */}
            <FactionSteadfast
              steadfastBonus={calculator.steadfastBonus}
              setSteadfastBonus={calculator.setSteadfastBonus}
              getStatGridColumns={responsive.getStatGridColumns}
            />

            {/* Calculate Button */}
            <div style={{
              backgroundColor: '#333333',
              border: '1px solid #555555',
              padding: '12px',
              textAlign: 'center'
            }}>
              {calculator.isCalculating ? (
                <LoadingSpinner text="Calculating gains..." />
              ) : (
                <Tooltip content="Calculate training gains for all gyms and show optimal allocation results">
                  <button
                    onClick={async () => {
                      try {
                        await calculator.runSimulation();
                        notifications.showSuccess('Calculations completed successfully!');
                      } catch (error) {
                        notifications.showError('Failed to calculate gains. Please try again.');
                      }
                    }}
                    disabled={calculator.isCalculating}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: calculator.isCalculating ? '#666666' : '#4a7c59',
                      border: '1px solid #6b9b7a',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: calculator.isCalculating ? 'not-allowed' : 'pointer',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease',
                      opacity: calculator.isCalculating ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!calculator.isCalculating) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#5a8c69';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!calculator.isCalculating) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#4a7c59';
                      }
                    }}
                  >
                    🔥 Compute Maximum Gains 🔥
                  </button>
                </Tooltip>
              )}
            </div>
          </>
        )}

        {calculator.activeTab === 'results' && (
          <Results
            results={calculator.results}
            selectedGym={calculator.selectedGym}
            allocationResults={calculator.allocationResults}
            showResults={calculator.showResults}
            getStatGridColumns={responsive.getStatGridColumns}
          />
        )}

        {calculator.activeTab === 'settings' && (
          <SettingsTab
            notifications={notifications}
            dynamicHappy={calculator.dynamicHappy}
            setDynamicHappy={calculator.setDynamicHappy}
            darkMode={calculator.darkMode}
            setDarkMode={calculator.setDarkMode}
            resetAllSettings={calculator.resetAllSettings}
            getSettingsGridColumns={responsive.getSettingsGridColumns}
            stats={calculator.stats}
            setStats={calculator.setStats}
            happy={calculator.happy}
            setHappy={calculator.setHappy}
            energy={calculator.energy}
            setEnergy={calculator.setEnergy}
            selectedGym={calculator.selectedGym}
            setSelectedGym={calculator.setSelectedGym}
            energyAllocation={calculator.energyAllocation}
            setEnergyAllocation={calculator.setEnergyAllocation}
            propertyPerks={calculator.propertyPerks}
            setPropertyPerks={calculator.setPropertyPerks}
            educationStatSpecific={calculator.educationStatSpecific}
            setEducationStatSpecific={calculator.setEducationStatSpecific}
            educationGeneral={calculator.educationGeneral}
            setEducationGeneral={calculator.setEducationGeneral}
            jobPerks={calculator.jobPerks}
            setJobPerks={calculator.setJobPerks}
            bookPerks={calculator.bookPerks}
            setBookPerks={calculator.setBookPerks}
            steadfastBonus={calculator.steadfastBonus}
            setSteadfastBonus={calculator.setSteadfastBonus}
          />
        )}

        {/* Footer */}
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #555555',
          padding: '8px 12px',
          textAlign: 'center',
          fontSize: '10px',
          color: '#999999'
        }}>
          <div style={{marginBottom: '4px'}}>
            This page wouldn't be possible without <span style={{color: '#88cc88'}}>Vladar[1996140]</span> and his{' '}
            <a 
              href="https://www.torn.com/forums.php#/p=threads&f=61&t=16182535&b=0&a=0" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{color: '#88cc88', textDecoration: 'underline'}}
            >
              Training Gains Explained 2.0
            </a> - 
            <span style={{color: '#88cc88'}}> Same_Sura[2157732]</span> for extensive testing.
          </div>
          <div>
            Made with the help of <span style={{color: '#88cc88'}}>AI</span> • Created by <span style={{color: '#88cc88'}}>dv1sual[3616352]</span>
          </div>
        </div>
      </div>

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications.notifications}
        onRemove={notifications.removeNotification}
      />
    </div>
  );
}

export default function App() {
  return (
    <ApiProvider>
      <AppContent />
    </ApiProvider>
  );
}
