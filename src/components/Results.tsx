// src/components/Results.tsx
import React from 'react';

interface Result {
  name: string;
  perStat: { str: number; def: number; spd: number; dex: number };
  total: number;
}

interface Props {
  results: Result[];
  selected: string;
}

const Results: React.FC<Props> = ({ results, selected }) => {
  const sorted = [...results].sort((a, b) => b.total - a.total).slice(0, 10);
  const selectedRes = results.find((r) => r.name === selected);

  return (
    <div className="space-y-6">
      {selectedRes && (
        <div className="border-2 border-blue-500 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Current Gym: {selectedRes.name}</h2>
          <p className="text-gray-700 dark:text-gray-300">Total Gain: {selectedRes.total.toFixed(2)}</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(Object.entries(selectedRes.perStat) as [string, number][]).map(([k, v]) => (
              <div key={k} className="text-sm text-gray-600 dark:text-gray-400">
                {k.toUpperCase()}: {v.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Top 10 Gyms</h3>
        <div className="grid grid-cols-1 gap-4">
          {sorted.map((r, idx) => (
            <div
              key={r.name}
              className={`p-4 rounded-lg bg-white dark:bg-gray-800 border ${
                r.name === selected ? 'border-green-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-gray-100">#{idx + 1} {r.name}</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{r.total.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                {(Object.entries(r.perStat) as [string, number][]).map(([k, v]) => (
                  <div key={k} className="text-gray-600 dark:text-gray-400">{k.toUpperCase()}: {v.toFixed(2)}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;