import React from 'react';

interface MusicTalentDisplayProps {
  talent: number;
  maxTalent?: number;
  onChange?: (newTalent: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const MusicTalentDisplay: React.FC<MusicTalentDisplayProps> = ({
  talent,
  maxTalent = 3,
  onChange,
  size = 'md',
  disabled = false,
}) => {
  // Match TalentDisplay sizing
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

  const handleStarClick = (index: number) => {
    if (disabled || !onChange) return;

    // If clicking on an already filled star, unfill it and all after
    // If clicking on an empty star, fill it and all before
    const newTalent = talent === index + 1 ? 0 : index + 1;
    onChange(newTalent);
  };

  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[...Array(maxTalent)].map((_, i) => (
        <button
          key={i}
          onClick={() => handleStarClick(i)}
          disabled={disabled || !onChange}
          style={{
            width: starSize,
            height: starSize,
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: onChange && !disabled ? 'pointer' : 'default',
            opacity: disabled ? 0.5 : 1,
            transform: 'scale(1)',
            transition: 'transform 0.1s',
          }}
          onMouseEnter={(e) => {
            if (onChange && !disabled) {
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label={`Set talent to ${i + 1}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            fill={i < talent ? 'var(--color-metal-gold)' : 'none'}
            stroke="var(--color-metal-gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default MusicTalentDisplay;
