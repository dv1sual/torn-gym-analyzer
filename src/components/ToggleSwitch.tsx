import React from 'react';

interface Props {
  label: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
}

const ToggleSwitch: React.FC<Props> = ({ label, enabled, onToggle }) => (
  <div className="flex items-center">
    <label className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[120px]">{label}</label>
    <button
      onClick={() => onToggle(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 ${
        enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`transform transition-transform inline-block w-4 h-4 bg-white rounded-full ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export default ToggleSwitch;