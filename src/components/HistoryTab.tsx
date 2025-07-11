import React, { useState } from 'react';
import { useNotifications } from './NotificationSystem';

interface TrainingSession {
  id: string;
  timestamp: number;
  date: string;
  gym: string;
  stats: {
    str: number;
    def: number;
    spd: number;
    dex: number;
  };
  gains: {
    str: number;
    def: number;
    spd: number;
    dex: number;
  };
  energy: number;
  happy: number;
  perks: {
    property: number;
    education: number;
    job: number;
    book: number;
  };
  steadfast: {
    str: number;
    def: number;
    spd: number;
    dex: number;
  };
  totalGain: number;
}

interface HistoryTabProps {
  trainingHistory: TrainingSession[];
  onClearHistory: () => void;
  onExportHistory: () => void;
  getStatGridColumns: () => string;
}

export default function HistoryTab({ 
  trainingHistory, 
  onClearHistory, 
  onExportHistory,
  getStatGridColumns 
}: HistoryTabProps) {
  const notifications = useNotifications();
  const [sortBy, setSortBy] = useState<'date' | 'gym' | 'totalGain'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterGym, setFilterGym] = useState<string>('all');

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + 
           new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sortedHistory = [...trainingHistory].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = a.timestamp - b.timestamp;
        break;
      case 'gym':
        comparison = a.gym.localeCompare(b.gym);
        break;
      case 'totalGain':
        comparison = a.totalGain - b.totalGain;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredHistory = filterGym === 'all' 
    ? sortedHistory 
    : sortedHistory.filter(session => session.gym === filterGym);

  const uniqueGyms = [...new Set(trainingHistory.map(session => session.gym))];

  const handleSort = (newSortBy: 'date' | 'gym' | 'totalGain') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all training history? This action cannot be undone.')) {
      onClearHistory();
      notifications.showSuccess('Training history cleared successfully!');
    }
  };

  const handleExportHistory = () => {
    try {
      onExportHistory();
      notifications.showSuccess('Training history exported successfully!');
    } catch (error) {
      notifications.showError('Failed to export training history.');
    }
  };

  const calculateTotalStats = () => {
    const totals = {
      sessions: trainingHistory.length,
      totalGains: { str: 0, def: 0, spd: 0, dex: 0 },
      totalEnergy: 0,
      averageGain: 0
    };

    trainingHistory.forEach(session => {
      totals.totalGains.str += session.gains.str;
      totals.totalGains.def += session.gains.def;
      totals.totalGains.spd += session.gains.spd;
      totals.totalGains.dex += session.gains.dex;
      totals.totalEnergy += session.energy;
    });

    totals.averageGain = trainingHistory.length > 0 
      ? (totals.totalGains.str + totals.totalGains.def + totals.totalGains.spd + totals.totalGains.dex) / trainingHistory.length
      : 0;

    return totals;
  };

  const stats = calculateTotalStats();

  if (trainingHistory.length === 0) {
    return (
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #444444',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{color: '#88cc88', fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0'}}>
          📈 Training History
        </h2>
        <div style={{
          backgroundColor: '#333333',
          border: '1px solid #555555',
          padding: '40px 20px',
          borderRadius: '8px'
        }}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>📊</div>
          <h3 style={{color: '#cccccc', fontSize: '16px', margin: '0 0 8px 0'}}>
            No Training History Yet
          </h3>
          <p style={{color: '#999999', fontSize: '14px', margin: '0 0 16px 0'}}>
            Complete some training calculations to see your history here.
          </p>
          <p style={{color: '#888888', fontSize: '12px', margin: 0}}>
            Your training sessions will be automatically saved and displayed here for analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#2a2a2a',
      border: '1px solid #444444',
      padding: '12px',
      marginBottom: '12px'
    }}>
      <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0'}}>
        📈 Training History ({trainingHistory.length} sessions)
      </h2>

      {/* Summary Stats */}
      <div style={{
        backgroundColor: '#333333',
        border: '1px solid #555555',
        padding: '12px',
        marginBottom: '12px',
        borderRadius: '4px'
      }}>
        <h3 style={{color: '#88cc88', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
          📊 Summary Statistics
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: getStatGridColumns(),
          gap: '8px',
          fontSize: '11px'
        }}>
          <div style={{color: '#cccccc'}}>
            <strong>Total Sessions:</strong> {stats.sessions}
          </div>
          <div style={{color: '#cccccc'}}>
            <strong>Total Energy:</strong> {formatNumber(stats.totalEnergy)}
          </div>
          <div style={{color: '#cccccc'}}>
            <strong>Avg Gain/Session:</strong> {formatNumber(stats.averageGain)}
          </div>
          <div style={{color: '#cccccc'}}>
            <strong>Total Gains:</strong> {formatNumber(stats.totalGains.str + stats.totalGains.def + stats.totalGains.spd + stats.totalGains.dex)}
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginTop: '8px',
          fontSize: '11px'
        }}>
          <div style={{color: '#ff6b6b'}}>
            <strong>💪 STR:</strong> {formatNumber(stats.totalGains.str)}
          </div>
          <div style={{color: '#4ecdc4'}}>
            <strong>🛡️ DEF:</strong> {formatNumber(stats.totalGains.def)}
          </div>
          <div style={{color: '#45b7d1'}}>
            <strong>💨 SPD:</strong> {formatNumber(stats.totalGains.spd)}
          </div>
          <div style={{color: '#f9ca24'}}>
            <strong>🎯 DEX:</strong> {formatNumber(stats.totalGains.dex)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        backgroundColor: '#333333',
        border: '1px solid #555555',
        padding: '8px',
        marginBottom: '12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        fontSize: '11px'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
          <span style={{color: '#cccccc'}}>Sort:</span>
          <button
            onClick={() => handleSort('date')}
            style={{
              padding: '2px 6px',
              backgroundColor: sortBy === 'date' ? '#88cc88' : '#555555',
              border: '1px solid #666666',
              color: 'white',
              fontSize: '10px',
              cursor: 'pointer',
              borderRadius: '2px'
            }}
          >
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('gym')}
            style={{
              padding: '2px 6px',
              backgroundColor: sortBy === 'gym' ? '#88cc88' : '#555555',
              border: '1px solid #666666',
              color: 'white',
              fontSize: '10px',
              cursor: 'pointer',
              borderRadius: '2px'
            }}
          >
            Gym {sortBy === 'gym' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('totalGain')}
            style={{
              padding: '2px 6px',
              backgroundColor: sortBy === 'totalGain' ? '#88cc88' : '#555555',
              border: '1px solid #666666',
              color: 'white',
              fontSize: '10px',
              cursor: 'pointer',
              borderRadius: '2px'
            }}
          >
            Gain {sortBy === 'totalGain' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
          <span style={{color: '#cccccc'}}>Filter:</span>
          <select
            value={filterGym}
            onChange={(e) => setFilterGym(e.target.value)}
            style={{
              padding: '2px 4px',
              backgroundColor: '#555555',
              border: '1px solid #666666',
              color: 'white',
              fontSize: '10px',
              borderRadius: '2px'
            }}
          >
            <option value="all">All Gyms</option>
            {uniqueGyms.map(gym => (
              <option key={gym} value={gym}>{gym}</option>
            ))}
          </select>
        </div>

        <div style={{marginLeft: 'auto', display: 'flex', gap: '4px'}}>
          <button
            onClick={handleExportHistory}
            style={{
              padding: '4px 8px',
              backgroundColor: '#4a7c59',
              border: '1px solid #6b9b7a',
              color: 'white',
              fontSize: '10px',
              cursor: 'pointer',
              borderRadius: '2px',
              fontWeight: 'bold'
            }}
          >
            📥 Export
          </button>
          <button
            onClick={handleClearHistory}
            style={{
              padding: '4px 8px',
              backgroundColor: '#d63031',
              border: '1px solid #e17055',
              color: 'white',
              fontSize: '10px',
              cursor: 'pointer',
              borderRadius: '2px',
              fontWeight: 'bold'
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* History List */}
      <div style={{
        backgroundColor: '#333333',
        border: '1px solid #555555',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {filteredHistory.map((session, index) => (
          <div
            key={session.id}
            style={{
              padding: '8px 12px',
              borderBottom: index < filteredHistory.length - 1 ? '1px solid #444444' : 'none',
              fontSize: '11px'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{color: '#88cc88', fontWeight: 'bold'}}>
                  {session.gym}
                </span>
                <span style={{color: '#999999'}}>
                  {formatDate(session.timestamp)}
                </span>
              </div>
              <div style={{
                color: '#88cc88',
                fontWeight: 'bold'
              }}>
                +{formatNumber(session.totalGain)} total
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px',
              marginBottom: '4px'
            }}>
              <div style={{color: '#ff6b6b'}}>
                💪 +{formatNumber(session.gains.str)}
              </div>
              <div style={{color: '#4ecdc4'}}>
                🛡️ +{formatNumber(session.gains.def)}
              </div>
              <div style={{color: '#45b7d1'}}>
                💨 +{formatNumber(session.gains.spd)}
              </div>
              <div style={{color: '#f9ca24'}}>
                🎯 +{formatNumber(session.gains.dex)}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              color: '#999999',
              fontSize: '10px'
            }}>
              <span>⚡ {session.energy} energy</span>
              <span>😊 {session.happy} happy</span>
              <span>🏠 {session.perks.property}%</span>
              <span>🎓 {session.perks.education}%</span>
              <span>💼 {session.perks.job}%</span>
              <span>📚 {session.perks.book}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
