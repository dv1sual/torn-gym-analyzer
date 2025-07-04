import React from 'react';
import { Gym } from '../data/gyms';
import { getGymEnergy } from '../utils/calc';

interface GymSelectorProps {
  gyms: Gym[];
  selected: string;
  onChange: (gym: string) => void;
}

export default function GymSelector({ gyms, selected, onChange }: GymSelectorProps) {
  // Group gyms by energy cost using the calc function
  const lowEnergyGyms = gyms.filter(g => getGymEnergy(g.name) === 5);
  const mediumEnergyGyms = gyms.filter(g => getGymEnergy(g.name) === 10);
  const specialGyms25E = gyms.filter(g => getGymEnergy(g.name) === 25);
  const specialGyms50E = gyms.filter(g => getGymEnergy(g.name) === 50);

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 text-base font-medium bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100"
    >
      {/* Low Energy Gyms */}
      <optgroup label="[L] Low Energy (5E)" className="font-bold">
        {lowEnergyGyms.map((gym) => (
          <option key={gym.name} value={gym.name} className="py-1">
            {gym.name}
          </option>
        ))}
      </optgroup>

      {/* Medium Energy Gyms */}
      <optgroup label="[M] Medium Energy (10E)" className="font-bold">
        {mediumEnergyGyms.map((gym) => (
          <option key={gym.name} value={gym.name} className="py-1">
            {gym.name}
          </option>
        ))}
      </optgroup>

      {/* Special 25E Gyms */}
      <optgroup label="[S] Special (25E)" className="font-bold">
        {specialGyms25E.map((gym) => (
          <option key={gym.name} value={gym.name} className="py-1">
            {gym.name}
          </option>
        ))}
      </optgroup>

      {/* Special 50E Gyms */}
      <optgroup label="[S] Special (50E)" className="font-bold">
        {specialGyms50E.map((gym) => (
          <option key={gym.name} value={gym.name} className="py-1">
            {gym.name}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
