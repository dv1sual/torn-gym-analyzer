import React from 'react';

interface PerksBonusesProps {
  propertyPerks: number;
  setPropertyPerks: (value: number) => void;
  educationStatSpecific: number;
  setEducationStatSpecific: (value: number) => void;
  educationGeneral: number;
  setEducationGeneral: (value: number) => void;
  jobPerks: number;
  setJobPerks: (value: number) => void;
  bookPerks: number;
  setBookPerks: (value: number) => void;
  getPerksGridColumns: () => string;
}

const PerksBonuses: React.FC<PerksBonusesProps> = ({
  propertyPerks,
  setPropertyPerks,
  educationStatSpecific,
  setEducationStatSpecific,
  educationGeneral,
  setEducationGeneral,
  jobPerks,
  setJobPerks,
  bookPerks,
  setBookPerks,
  getPerksGridColumns
}) => {
  const totalBonus = (Number(propertyPerks) || 0) + (Number(educationStatSpecific) || 0) + (Number(educationGeneral) || 0) + (Number(jobPerks) || 0) + (Number(bookPerks) || 0);

  return (
    <div style={{
      backgroundColor: '#333333',
      border: '1px solid #555555',
      padding: '8px 12px',
      marginBottom: '12px'
    }}>
      <h2 style={{color: '#88cc88', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0'}}>
        📈 Perks Bonuses
      </h2>
      <div style={{display: 'grid', gridTemplateColumns: getPerksGridColumns(), gap: '12px', marginBottom: '8px'}}>
        <div>
          <label style={{color: 'white', fontSize: '11px', display: 'block', marginBottom: '4px'}}>
            Property Perks (%)
          </label>
          <input
            type="number"
            value={propertyPerks}
            onChange={(e) => setPropertyPerks(parseFloat(e.target.value) || 0)}
            style={{
              width: '100%',
              backgroundColor: '#222222',
              border: '1px solid #666666',
              color: 'white',
              padding: '4px 6px',
              fontSize: '11px'
            }}
          />
        </div>
        <div>
          <label style={{color: 'white', fontSize: '11px', display: 'block', marginBottom: '4px'}}>
            Education (Stat) (%)
          </label>
          <input
            type="number"
            value={educationStatSpecific}
            onChange={(e) => setEducationStatSpecific(parseFloat(e.target.value) || 0)}
            style={{
              width: '100%',
              backgroundColor: '#222222',
              border: '1px solid #666666',
              color: 'white',
              padding: '4px 6px',
              fontSize: '11px'
            }}
          />
        </div>
        <div>
          <label style={{color: 'white', fontSize: '11px', display: 'block', marginBottom: '4px'}}>
            Education (General) (%)
          </label>
          <input
            type="number"
            value={educationGeneral}
            onChange={(e) => setEducationGeneral(parseFloat(e.target.value) || 0)}
            style={{
              width: '100%',
              backgroundColor: '#222222',
              border: '1px solid #666666',
              color: 'white',
              padding: '4px 6px',
              fontSize: '11px'
            }}
          />
        </div>
        <div>
          <label style={{color: 'white', fontSize: '11px', display: 'block', marginBottom: '4px'}}>
            Job Perks (%)
          </label>
          <input
            type="number"
            value={jobPerks}
            onChange={(e) => setJobPerks(parseFloat(e.target.value) || 0)}
            style={{
              width: '100%',
              backgroundColor: '#222222',
              border: '1px solid #666666',
              color: 'white',
              padding: '4px 6px',
              fontSize: '11px'
            }}
          />
        </div>
        <div>
          <label style={{color: 'white', fontSize: '11px', display: 'block', marginBottom: '4px'}}>
            Book Perks (%)
          </label>
          <input
            type="number"
            value={bookPerks}
            onChange={(e) => setBookPerks(parseFloat(e.target.value) || 0)}
            style={{
              width: '100%',
              backgroundColor: '#222222',
              border: '1px solid #666666',
              color: 'white',
              padding: '4px 6px',
              fontSize: '11px'
            }}
          />
        </div>
      </div>
      <div style={{color: '#88cc88', fontSize: '11px'}}>
        Total Bonus: {totalBonus}% applied to all stats
      </div>
    </div>
  );
};

export default PerksBonuses;
