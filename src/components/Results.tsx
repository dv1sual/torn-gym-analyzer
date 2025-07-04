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


      {/* Top Gyms Comparison */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Top 10 Gyms (All Energy)
        </h2>
        
        <div className="space-y-3">
          {sorted.map((r, idx) => {
            const isSelected = r.name === selected;
            const isTopThree = idx < 3;
            const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
            
            return (
              <div
                key={r.name}
                className={`relative p-4 rounded-2xl transition-all duration-200 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-500 shadow-lg' 
                    : isTopThree
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 hover:shadow-md'
                    : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/70'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    SELECTED
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{rankEmoji}</span>
                    <span className={`font-semibold ${
                      isSelected ? 'text-green-800 dark:text-green-200' : 
                      isTopThree ? 'text-blue-800 dark:text-blue-200' : 
                      'text-gray-900 dark:text-gray-100'
                    }`}>
                      {r.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      isSelected ? 'text-green-700 dark:text-green-300' : 
                      isTopThree ? 'text-blue-700 dark:text-blue-300' : 
                      'text-gray-900 dark:text-gray-100'
                    }`}>
                      {r.total.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Gain</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {(Object.entries(r.perStat) as [string, number][]).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center p-2 bg-white/60 dark:bg-gray-900/30 rounded-lg">
                      <span className={`text-sm font-medium ${
                        k === 'str' ? 'text-red-600 dark:text-red-400' :
                        k === 'def' ? 'text-green-600 dark:text-green-400' :
                        k === 'spd' ? 'text-blue-600 dark:text-blue-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`}>
                        {k.toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {v.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>💡 Tip:</strong> Rankings are based on total stat gains when using all your energy at each gym. 
            Consider energy allocation and your specific stat priorities when choosing your gym.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Results;
