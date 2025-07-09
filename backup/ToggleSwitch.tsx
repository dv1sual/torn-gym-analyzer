import React from 'react';

interface Props {
  label: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
}

const ToggleSwitch: React.FC<Props> = ({ label, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer" onClick={() => onToggle(!enabled)}>
    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer flex-1 pr-3">{label}</label>
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(!enabled);
      }}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export default ToggleSwitch;