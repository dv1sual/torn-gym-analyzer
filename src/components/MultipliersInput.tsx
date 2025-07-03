import React, { useState, useEffect } from 'react';

interface Props {
  multipliers: { str: number; def: number; spd: number; dex: number };
  onChange: (multipliers: { str: number; def: number; spd: number; dex: number }) => void;
}

const MultipliersInput: React.FC<Props> = ({ multipliers, onChange }) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [displayValues, setDisplayValues] = useState({
    str: Math.round((multipliers.str - 1) * 100).toString(),
    def: Math.round((multipliers.def - 1) * 100).toString(),
    spd: Math.round((multipliers.spd - 1) * 100).toString(),
    dex: Math.round((multipliers.dex - 1) * 100).toString()
  });

  useEffect(() => {
    if (!focusedField) {
      setDisplayValues({
        str: Math.round((multipliers.str - 1) * 100).toString(),
        def: Math.round((multipliers.def - 1) * 100).toString(),
        spd: Math.round((multipliers.spd - 1) * 100).toString(),
        dex: Math.round((multipliers.dex - 1) * 100).toString()
      });
    }
  }, [multipliers, focusedField]);

  const handleFocus = (key: string) => {
    setFocusedField(key);
    const currentValue = Math.round((multipliers[key as keyof typeof multipliers] - 1) * 100);
    if (currentValue === 0) {
      setDisplayValues(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleBlur = (key: string) => {
    setFocusedField(null);
    const percentValue = Math.round(parseFloat(displayValues[key as keyof typeof displayValues]) || 0);
    const multiplierValue = 1 + (percentValue / 100);
    onChange({ ...multipliers, [key]: multiplierValue });
    setDisplayValues(prev => ({ ...prev, [key]: percentValue.toString() }));
  };

  const handleChange = (key: string, value: string) => {
    setDisplayValues(prev => ({ ...prev, [key]: value }));
  };

  const getStatColor = (key: string) => {
    switch (key) {
      case 'str': return 'text-red-600 dark:text-red-400';
      case 'def': return 'text-green-600 dark:text-green-400';
      case 'spd': return 'text-blue-600 dark:text-blue-400';
      case 'dex': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatBorderColor = (key: string) => {
    switch (key) {
      case 'str': return 'border-red-200 dark:border-red-800 focus:border-red-500';
      case 'def': return 'border-green-200 dark:border-green-800 focus:border-green-500';
      case 'spd': return 'border-blue-200 dark:border-blue-800 focus:border-blue-500';
      case 'dex': return 'border-purple-200 dark:border-purple-800 focus:border-purple-500';
      default: return 'border-gray-200 dark:border-gray-600 focus:border-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Merit Bonuses:</strong> Enter the percentage bonus from your gym merits (e.g., 15% for 15% bonus gain). These are passive bonuses that multiply your base gym gains.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['str', 'def', 'spd', 'dex'] as const).map((key) => (
          <div key={key} className="relative">
            <label className={`block text-sm font-semibold mb-2 uppercase tracking-wide ${getStatColor(key)}`}>
              {key.toUpperCase()} Merit
            </label>
            <div className="relative">
              <input
                type="number"
                name={key}
                step="1"
                min="0"
                max="100"
                value={displayValues[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                onFocus={() => handleFocus(key)}
                onBlur={() => handleBlur(key)}
                placeholder="0"
                className={`w-full px-3 py-2.5 pr-8 text-base font-medium bg-white dark:bg-gray-800 border-2 ${getStatBorderColor(key)} rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className={`text-sm font-bold ${getStatColor(key)}`}>%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Current Multipliers:</strong> STR: {multipliers.str.toFixed(2)}x, DEF: {multipliers.def.toFixed(2)}x, SPD: {multipliers.spd.toFixed(2)}x, DEX: {multipliers.dex.toFixed(2)}x
        </p>
      </div>
    </div>
  );
};

export default MultipliersInput;