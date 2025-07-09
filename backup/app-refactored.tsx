import React from 'react';
import { useGymCalculator } from './hooks/useGymCalculator';
import { useResponsive } from './hooks/useResponsive';
import StatInputOriginal from './components/StatInputOriginal';
import TrainingSetup from './components/TrainingSetup';
import GymSelectorOriginal from './components/GymSelectorOriginal';
import EnergyAllocation from './components/EnergyAllocation';
import PerksBonuses from './components/PerksBonuses';
import FactionSteadfast from './components/FactionSteadfast';
import ResultsOriginal from './components/ResultsOriginal';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const calculator = useGymCalculator();
  const responsive = useResponsive();

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
              <div style={{
                width: '100px',
                height: '40px',
                background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888888',
                fontWeight: 'bold',
                fontSize: '18px',
                border: '1px solid #333333',
                borderRadius: '2px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.5)',
                letterSpacing: '2px',
                textShadow: '0 1px 0 rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                  pointerEvents: 'none'
                }}></div>
                TORN
              </div>
              <h1 style={{color: 'white', fontSize: '16px', fontWeight: 'bold', margin: 0}}>
                Gym Stats Calculator
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
                  cursor: 'pointer'
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
                  cursor: 'pointer'
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
                  cursor: 'pointer'
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
          marginBottom: '12px'
        }}>
          <div style={{color: '#cccccc'}}>
            Training Prediction using <span style={{color: '#88cc88', fontWeight: 'bold'}}>Vladar Formula</span>
          </div>
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
                <StatInputOriginal 
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
            <GymSelectorOriginal
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
              <button
                onClick={calculator.runSimulation}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4a7c59',
                  border: '1px solid #6b9b7a',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#5a8c69';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#4a7c59';
                }}
              >
                🔥 Compute Maximum Gains 🔥
              </button>
            </div>
          </>
        )}

        {calculator.activeTab === 'results' && (
          <ResultsOriginal
            results={calculator.results}
            selectedGym={calculator.selectedGym}
            allocationResults={calculator.allocationResults}
            showResults={calculator.showResults}
            getStatGridColumns={responsive.getStatGridColumns}
          />
        )}

        {calculator.activeTab === 'settings' && (
          <SettingsTab
            dynamicHappy={calculator.dynamicHappy}
            setDynamicHappy={calculator.setDynamicHappy}
            darkMode={calculator.darkMode}
            setDarkMode={calculator.setDarkMode}
            resetAllSettings={calculator.resetAllSettings}
            getSettingsGridColumns={responsive.getSettingsGridColumns}
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
    </div>
  );
}
