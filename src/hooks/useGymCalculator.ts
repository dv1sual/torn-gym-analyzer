import { useLocalStorage } from './useLocalStorage';
import { gyms } from '../data/gyms';
import { computeGain, calculateMultipleTrains, TrainingPerks, getGymEnergy } from '../utils/calc';

type StatAllocation = {
  str: number;
  def: number;
  spd: number;
  dex: number;
};

export function useGymCalculator() {
  // State management with localStorage persistence
  const [stats, setStats] = useLocalStorage('gymCalc_stats', { str: 0, def: 0, spd: 0, dex: 0 });
  const [happy, setHappy] = useLocalStorage('gymCalc_happy', 0);
  const [energy, setEnergy] = useLocalStorage('gymCalc_energy', 0);
  const [selectedGym, setSelectedGym] = useLocalStorage('gymCalc_selectedGym', gyms[0].name);
  const [results, setResults] = useLocalStorage('gymCalc_results', [] as any[]);
  const [dynamicHappy, setDynamicHappy] = useLocalStorage('gymCalc_dynamicHappy', true);
  const [darkMode, setDarkMode] = useLocalStorage('gymCalc_darkMode', true);

  // Energy allocation state
  const [energyAllocation, setEnergyAllocation] = useLocalStorage('gymCalc_energyAllocation', {
    str: 25,
    def: 25,
    spd: 25,
    dex: 25
  });

  // Bonus inputs
  const [propertyPerks, setPropertyPerks] = useLocalStorage('gymCalc_propertyPerks', 0);
  const [educationStatSpecific, setEducationStatSpecific] = useLocalStorage('gymCalc_educationStatSpecific', 0);
  const [educationGeneral, setEducationGeneral] = useLocalStorage('gymCalc_educationGeneral', 0);
  const [jobPerks, setJobPerks] = useLocalStorage('gymCalc_jobPerks', 0);
  const [bookPerks, setBookPerks] = useLocalStorage('gymCalc_bookPerks', 0);
  
  // Faction steadfast bonuses
  const [steadfastBonus, setSteadfastBonus] = useLocalStorage('gymCalc_steadfastBonus', {
    str: 0,
    def: 0,
    spd: 0,
    dex: 0
  });

  const [allocationResults, setAllocationResults] = useLocalStorage('gymCalc_allocationResults', null as any);
  const [showResults, setShowResults] = useLocalStorage('gymCalc_showResults', false);
  const [activeTab, setActiveTab] = useLocalStorage('gymCalc_activeTab', 'calculator');
  const [isCalculating, setIsCalculating] = useLocalStorage('gymCalc_isCalculating', false);

  // Convert bonus inputs to the perks format for calculations
  const createPerksObject = (): TrainingPerks => {
    const totalBonus = (Number(propertyPerks) || 0) + (Number(educationStatSpecific) || 0) + (Number(educationGeneral) || 0) + (Number(jobPerks) || 0) + (Number(bookPerks) || 0);
    
    return {
      manualGymBonusPercent: {
        str: totalBonus,
        def: totalBonus,
        spd: totalBonus,
        dex: totalBonus
      },
      steadfast: steadfastBonus
    };
  };

  const calculateEnergyAllocation = (gym: any, allocation: any) => {
    const totalAllocation = allocation.str + allocation.def + allocation.spd + allocation.dex;
    const energyPerStat = {
      str: Math.floor((energy * allocation.str) / totalAllocation),
      def: Math.floor((energy * allocation.def) / totalAllocation),
      spd: Math.floor((energy * allocation.spd) / totalAllocation),
      dex: Math.floor((energy * allocation.dex) / totalAllocation)
    };

    const gymEnergy = getGymEnergy(gym.name);
    const trainsPerStat = {
      str: Math.floor(energyPerStat.str / gymEnergy),
      def: Math.floor(energyPerStat.def / gymEnergy),
      spd: Math.floor(energyPerStat.spd / gymEnergy),
      dex: Math.floor(energyPerStat.dex / gymEnergy)
    };

    const gainsPerStat = { str: 0, def: 0, spd: 0, dex: 0 };
    const perks = createPerksObject();

    (['str', 'def', 'spd', 'dex'] as const).forEach((key) => {
      if (trainsPerStat[key] > 0) {
        if (dynamicHappy) {
          const result = calculateMultipleTrains(
            stats[key],
            happy,
            gym.name,
            trainsPerStat[key],
            key,
            perks
          );
          gainsPerStat[key] = result.totalGain;
        } else {
          const gain = computeGain(stats[key], happy, gym.name, key, perks);
          gainsPerStat[key] = gain * trainsPerStat[key];
        }
      }
    });

    return {
      energyPerStat,
      trainsPerStat,
      gainsPerStat,
      totalGain: gainsPerStat.str + gainsPerStat.def + gainsPerStat.spd + gainsPerStat.dex
    };
  };

  const runSimulation = async () => {
    setIsCalculating(true);
    
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const perks = createPerksObject();
      
      const sessionResults = gyms.map((gym) => {
        const gymEnergy = getGymEnergy(gym.name);
        const trains = Math.floor(energy / gymEnergy);
        const perStat = { str: 0, def: 0, spd: 0, dex: 0 };

        let maxSingleStatGain = 0;
        
        (['str', 'def', 'spd', 'dex'] as const).forEach((key) => {
          const gymData = gyms.find(g => g.name === gym.name);
          const gymHasStat = gymData && gymData.dots[key] > 0;
          
          if (trains > 0 && gymHasStat) {
            let singleStatGain = 0;
            
            if (dynamicHappy) {
              const result = calculateMultipleTrains(
                stats[key],
                happy,
                gym.name,
                trains,
                key,
                perks
              );
              singleStatGain = result.totalGain;
            } else {
              const gain = computeGain(stats[key], happy, gym.name, key, perks);
              singleStatGain = gain * trains;
            }
            
            perStat[key] = singleStatGain;
            maxSingleStatGain = Math.max(maxSingleStatGain, singleStatGain);
          }
        });

        const total = maxSingleStatGain;
        return { name: gym.name, perStat, total };
      });

      setResults(sessionResults);

      const selectedGymData = gyms.find(g => g.name === selectedGym);
      if (selectedGymData) {
        const allocationResult = calculateEnergyAllocation(selectedGymData, energyAllocation);
        setAllocationResults(allocationResult);
      }

      setShowResults(true);
      setActiveTab('results'); // Auto-navigate to results
    } finally {
      setIsCalculating(false);
    }
  };

  const resetAllSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('gymCalc_')) {
          localStorage.removeItem(key);
        }
      });
      setStats({ str: 0, def: 0, spd: 0, dex: 0 });
      setHappy(0);
      setEnergy(0);
      setSelectedGym(gyms[0].name);
      setDynamicHappy(true);
      setDarkMode(true);
      setEnergyAllocation({ str: 25, def: 25, spd: 25, dex: 25 });
      setPropertyPerks(0);
      setEducationStatSpecific(0);
      setEducationGeneral(0);
      setJobPerks(0);
      setBookPerks(0);
      setSteadfastBonus({ str: 0, def: 0, spd: 0, dex: 0 });
      setResults([]);
      setAllocationResults(null);
      setShowResults(false);
    }
  };

  return {
    // State
    stats,
    setStats,
    happy,
    setHappy,
    energy,
    setEnergy,
    selectedGym,
    setSelectedGym,
    results,
    setResults,
    dynamicHappy,
    setDynamicHappy,
    darkMode,
    setDarkMode,
    energyAllocation,
    setEnergyAllocation,
    propertyPerks,
    setPropertyPerks,
    educationStatSpecific,
    setEducationStatSpecific,
    educationGeneral,
    setEducationGeneral,
    jobPerks,
    setJobPerks,
    bookPerks,
    setBookPerks,
    steadfastBonus,
    setSteadfastBonus,
    allocationResults,
    setAllocationResults,
    showResults,
    setShowResults,
    activeTab,
    setActiveTab,
    isCalculating,
    setIsCalculating,
    
    // Functions
    createPerksObject,
    calculateEnergyAllocation,
    runSimulation,
    resetAllSettings
  };
}
