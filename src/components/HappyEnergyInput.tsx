import React, { useState, useEffect } from 'react';

interface Props {
  happy: number;
  energy: number;
  onChange: (happy: number, energy: number) => void;
}

const HappyEnergyInput: React.FC<Props> = ({ happy, energy, onChange }) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [displayValues, setDisplayValues] = useState({
    happy: happy.toString(),
    energy: energy.toString()
  });

  useEffect(() => {
    if (!focusedField) {
      setDisplayValues({
        happy: happy.toString(),
        energy: energy.toString()
      });
    }
  }, [happy, energy, focusedField]);

  const handleFocus = (field: 'happy' | 'energy') => {
    setFocusedField(field);
    const currentValue = field === 'happy' ? happy : energy;
    if (currentValue === 0) {
      setDisplayValues(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: 'happy' | 'energy') => {
    setFocusedField(null);
    const numValue = parseFloat(displayValues[field]) || 0;
    
    if (field === 'happy') {
      onChange(numValue, energy);
    } else {
      onChange(happy, numValue);
    }
    
    setDisplayValues(prev => ({ ...prev, [field]: numValue.toString() }));
  };

  const handleChange = (field: 'happy' | 'energy', value: string) => {
    setDisplayValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide">
          Happy
        </label>
        <div className="relative">
          <input
            type="number"
            value={displayValues.happy}
            onChange={(e) => handleChange('happy', e.target.value)}
            onFocus={() => handleFocus('happy')}
            onBlur={() => handleBlur('happy')}
            className="w-full px-4 py-3 text-lg font-medium bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 transition-opacity duration-200 focus-within:opacity-100"></div>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide">
          Total Energy
        </label>
        <div className="relative">
          <input
            type="number"
            value={displayValues.energy}
            onChange={(e) => handleChange('energy', e.target.value)}
            onFocus={() => handleFocus('energy')}
            onBlur={() => handleBlur('energy')}
            className="w-full px-4 py-3 text-lg font-medium bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 transition-opacity duration-200 focus-within:opacity-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HappyEnergyInput;