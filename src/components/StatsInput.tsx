import React, { useState, useEffect } from 'react';

interface Props {
  stats: { str: number; def: number; spd: number; dex: number };
  onChange: (stats: { str: number; def: number; spd: number; dex: number }) => void;
}

const StatsInput: React.FC<Props> = ({ stats, onChange }) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [displayValues, setDisplayValues] = useState({
    str: stats.str.toString(),
    def: stats.def.toString(),
    spd: stats.spd.toString(),
    dex: stats.dex.toString()
  });

  useEffect(() => {
    if (!focusedField) {
      setDisplayValues({
        str: stats.str.toString(),
        def: stats.def.toString(),
        spd: stats.spd.toString(),
        dex: stats.dex.toString()
      });
    }
  }, [stats, focusedField]);

  const handleFocus = (key: string) => {
    setFocusedField(key);
    const currentValue = stats[key as keyof typeof stats];
    if (currentValue === 0) {
      setDisplayValues(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleBlur = (key: string) => {
    setFocusedField(null);
    const numValue = parseFloat(displayValues[key as keyof typeof displayValues]) || 0;
    onChange({ ...stats, [key]: numValue });
    setDisplayValues(prev => ({ ...prev, [key]: numValue.toString() }));
  };

  const handleChange = (key: string, value: string) => {
    setDisplayValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {(['str', 'def', 'spd', 'dex'] as const).map((key) => (
        <div key={key} className="relative">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide">
            {key.toUpperCase()}
          </label>
          <div className="relative">
            <input
              type="number"
              name={key}
              value={displayValues[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              onFocus={() => handleFocus(key)}
              onBlur={() => handleBlur(key)}
              className="w-full px-4 py-3 text-lg font-medium bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 transition-opacity duration-200 focus-within:opacity-100"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsInput;