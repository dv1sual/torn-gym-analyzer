import React from 'react';

interface Result {
  name: string;
  perStat: { str: number; def: number; spd: number; dex: number };
  total: number;
}

interface AllocationResult {
  energyPerStat: { str: number; def: number; spd: number; dex: number };
  trainsPerStat: { str: number; def: number; spd: number; dex: number };
  gainsPerStat: { str: number; def: number; spd: number; dex: number };
  totalGain: number;
}

interface Props {
  results: Result[];
  selected: string;
  allocationResults: AllocationResult | null;
}

const Results: React.FC<Props> = ({ results, selected, allocationResults }) => {
  const sorted = [...results].sort((a, b) => b.total - a.total).slice(0, 10);
  const selectedRes = results.find((r) => r.name === selected);

  return (
    <div className="space-y-6">
      {/* Energy Allocation Results */}
      {allocationResults && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-600 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            Energy Allocation Results - {selected}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Energy Distribution</h3>
              {(['str', 'def', 'spd', 'dex'] as const).map((key) => (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className={`font-medium ${
                    key === 'str' ? 'text-red-600 dark:text-red-400' :
                    key === 'def' ? 'text-green-600 dark:text-green-400' :
                    key === 'spd' ? 'text-blue-600 dark:text-blue-400' :
                    'text-purple-600 dark:text-purple-400'
                  }`}>
                    {key.toUpperCase()}:
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {allocationResults.energyPerStat[key]} energy → {allocationResults.trainsPerStat[key]} trains
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      +{allocationResults.gainsPerStat[key].toFixed(2)} gain
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Summary</h3>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    +{allocationResults.totalGain.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Allocated Gain</div>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>Note:</strong> This shows gains based on your energy allocation percentages. Adjust the allocation above to optimize your training strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Gym Results */}
      {selectedRes && (
        <div className="border-2 border-blue-500 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Current Gym (All Energy): {selectedRes.name}
          </h2>
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

      {/* Top Gyms Comparison */}
      <div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Top 10 Gyms (All Energy)</h3>
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