import React from 'react';
import CharacterPortraitUploader from '../CharacterPortraitUploader';

interface BackgroundCreatorTabProps {
  physicalTraits: {
    height: string;
    weight: string;
    gender: string;
  };
  appearance: string;
  biography: string;
  name: string;
  race: string;
  culture: string;
  modulePoints: {
    total: number;
  };
  attributes: import('../../../types/character').Attributes;
  portraitFile: File | null;
  onUpdatePhysicalTrait: (trait: string, value: string) => void;
  onUpdateAppearance: (value: string) => void;
  onUpdateBiography: (value: string) => void;
  onUpdatePortrait: (file: File) => void;
}

const BackgroundCreatorTab: React.FC<BackgroundCreatorTabProps> = ({
  physicalTraits,
  appearance,
  biography,
  name,
  race,
  culture,
  modulePoints,
  attributes,
  portraitFile,
  onUpdatePhysicalTrait,
  onUpdateAppearance,
  onUpdateBiography,
  onUpdatePortrait,
}) => {
  // Create a temporary URL for the portrait file if it exists
  const portraitPreview = portraitFile ? URL.createObjectURL(portraitFile) : null;

  return (
    <div>
      <h2
        style={{
          color: 'var(--color-white)',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
        }}
      >
        Character Background
      </h2>

      {/* Portrait and Physical Traits Section */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column - Portrait */}
        <div style={{ flexShrink: 0 }}>
          <label
            style={{
              display: 'block',
              color: 'var(--color-cloud)',
              marginBottom: '0.5rem',
            }}
          >
            Character Portrait
          </label>
          <CharacterPortraitUploader
            currentPortrait={portraitPreview}
            onPortraitChange={onUpdatePortrait}
            size="large"
          />
        </div>

        {/* Right Column - Physical Traits */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <label
            style={{
              display: 'block',
              color: 'var(--color-cloud)',
              marginBottom: '0.5rem',
            }}
          >
            Physical Traits
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  color: 'var(--color-cloud)',
                  marginBottom: '0.25rem',
                  fontSize: '0.875rem',
                }}
              >
                Height
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                }}
                value={physicalTraits.height}
                onChange={(e) => onUpdatePhysicalTrait('height', e.target.value)}
                placeholder="E.g. 6'2 inches"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  color: 'var(--color-cloud)',
                  marginBottom: '0.25rem',
                  fontSize: '0.875rem',
                }}
              >
                Weight
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                }}
                value={physicalTraits.weight}
                onChange={(e) => onUpdatePhysicalTrait('weight', e.target.value)}
                placeholder="E.g. 180 lbs"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  color: 'var(--color-cloud)',
                  marginBottom: '0.25rem',
                  fontSize: '0.875rem',
                }}
              >
                Gender
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                }}
                value={physicalTraits.gender}
                onChange={(e) => onUpdatePhysicalTrait('gender', e.target.value)}
                placeholder="Enter gender (optional)"
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label
          style={{
            display: 'block',
            color: 'var(--color-cloud)',
            marginBottom: '0.5rem',
          }}
        >
          Appearance
        </label>
        <textarea
          style={{
            width: '100%',
            backgroundColor: 'var(--color-dark-elevated)',
            color: 'var(--color-white)',
            border: '1px solid var(--color-dark-border)',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.75rem',
            height: '6rem',
          }}
          value={appearance}
          onChange={(e) => onUpdateAppearance(e.target.value)}
          placeholder="Describe your character's appearance, clothing, and distinctive features..."
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label
          style={{
            display: 'block',
            color: 'var(--color-cloud)',
            marginBottom: '0.5rem',
          }}
        >
          Biography
        </label>
        <textarea
          style={{
            width: '100%',
            backgroundColor: 'var(--color-dark-elevated)',
            color: 'var(--color-white)',
            border: '1px solid var(--color-dark-border)',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.75rem',
            height: '10rem',
          }}
          value={biography}
          onChange={(e) => onUpdateBiography(e.target.value)}
          placeholder="Write your character's backstory, motivations, and goals..."
        />
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-dark-elevated)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginTop: '2rem',
        }}
      >
        <h3
          style={{
            color: 'var(--color-metal-gold)',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          Character Summary
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Name</div>
          <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>{name || 'Unnamed'}</div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Race</div>
          <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
            {race || 'Not selected'}
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Culture</div>
          <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
            {culture || 'Not selected'}
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Module Points</div>
          <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
            {modulePoints.total}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Key Attributes</div>
          <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
            {Object.entries(attributes)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 2)
              .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
              .join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundCreatorTab;
