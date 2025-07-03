import React from 'react';
import { Gym } from '../data/gyms';

interface Props {
  gyms: Gym[];
  selected: string;
  onChange: (gymName: string) => void;
}

const GymSelector: React.FC<Props> = ({ gyms, selected, onChange }) => (
  <div className="relative">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide">
      Current Gym
    </label>
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-lg font-medium bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500 appearance-none cursor-pointer pr-12"
      >
        {gyms.map((g) => (
          <option key={g.name} value={g.name}>{g.name}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

export default GymSelector;