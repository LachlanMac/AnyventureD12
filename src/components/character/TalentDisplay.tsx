import React from 'react';

interface TalentDisplayProps {
  talent: number;
  maxTalent?: number;
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Component to display talent stars
const TalentDisplay: React.FC<TalentDisplayProps> = ({
  talent,
  maxTalent = 3,
  showNumber = false,
  size = 'md',
}) => {
  // Get star size based on the size prop
  const getStarSize = () => {
    switch (size) {
      case 'sm':
        return '0.75rem';
      case 'lg':
        return '1.25rem';
      default:
        return '1rem';
    }
  };

  const starSize = getStarSize();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      {showNumber && (
        <span
          style={{
            color: 'var(--color-cloud)',
            fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
            marginRight: '0.25rem',
          }}
        >
        </span>
      )}

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {Array.from({ length: maxTalent }).map((_, i) => {
          const isFilled = i < talent;
          
          return (
            <div key={i} style={{ width: starSize, height: starSize }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={starSize}
                height={starSize}
                viewBox="0 0 24 24"
                fill={isFilled ? 'var(--color-metal-gold)' : 'none'}
                stroke={isFilled ? 'none' : 'var(--color-metal-gold)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TalentDisplay;