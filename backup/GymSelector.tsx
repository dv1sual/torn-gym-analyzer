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
      <optgroup label="🟢 Low Energy (5E)" className="font-bold text-green-700 bg-green-50">
        {lowEnergyGyms.map((gym) => {
          const energy = getGymEnergy(gym.name);
          const maxDot = Math.max(gym.dots.str, gym.dots.def, gym.dots.spd, gym.dots.dex);
          return (
            <option key={gym.name} value={gym.name} className="py-2 px-3 text-gray-800 bg-white hover:bg-green-50">
              {gym.name} • {energy}E • Max: {maxDot.toFixed(1)}
            </option>
          );
        })}
      </optgroup>

      {/* Medium Energy Gyms */}
      <optgroup label="🟡 Medium Energy (10E)" className="font-bold text-yellow-700 bg-yellow-50">
        {mediumEnergyGyms.map((gym) => {
          const energy = getGymEnergy(gym.name);
          const maxDot = Math.max(gym.dots.str, gym.dots.def, gym.dots.spd, gym.dots.dex);
          return (
            <option key={gym.name} value={gym.name} className="py-2 px-3 text-gray-800 bg-white hover:bg-yellow-50">
              {gym.name} • {energy}E • Max: {maxDot.toFixed(1)}
            </option>
          );
        })}
      </optgroup>

      {/* Special 25E Gyms */}
      <optgroup label="🟠 Special (25E)" className="font-bold text-orange-700 bg-orange-50">
        {specialGyms25E.map((gym) => {
          const energy = getGymEnergy(gym.name);
          const maxDot = Math.max(gym.dots.str, gym.dots.def, gym.dots.spd, gym.dots.dex);
          return (
            <option key={gym.name} value={gym.name} className="py-2 px-3 text-gray-800 bg-white hover:bg-orange-50">
              {gym.name} • {energy}E • Max: {maxDot.toFixed(1)}
            </option>
          );
        })}
      </optgroup>

      {/* Special 50E Gyms */}
      <optgroup label="🔴 Special (50E)" className="font-bold text-red-700 bg-red-50">
        {specialGyms50E.map((gym) => {
          const energy = getGymEnergy(gym.name);
          const maxDot = Math.max(gym.dots.str, gym.dots.def, gym.dots.spd, gym.dots.dex);
          return (
            <option key={gym.name} value={gym.name} className="py-2 px-3 text-gray-800 bg-white hover:bg-red-50">
              {gym.name} • {energy}E • Max: {maxDot.toFixed(1)}
            </option>
          );
        })}
      </optgroup>
    </select>
  );
}
