import React from 'react';
import { Ancestry, Culture } from '../../../types/character';
import RaceSelection from '../RaceSelection';
import CultureSelection from '../CultureSelection';

interface BasicInfoTabProps {
  name: string;
  race: string;
  culture: string;
  modulePoints?: number;
  startingTalents: number;
  onNameChange: (name: string) => void;
  onRaceChange: (race: string, ancestry: Ancestry) => void;
  onCultureChange: (culture: string, cultureData: Culture) => void;
  onModulePointsChange?: (points: number) => void;
  onStartingTalentsChange: (talents: number) => void;
  hideModulePoints?: boolean;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  name,
  race,
  culture,
  modulePoints,
  startingTalents,
  onNameChange,
  onRaceChange,
  onCultureChange,
  onModulePointsChange,
  onStartingTalentsChange,
  hideModulePoints = false,
}) => {
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
        Origin
      </h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <label
          style={{
            display: 'block',
            color: 'var(--color-cloud)',
            marginBottom: '0.5rem',
          }}
        >
          Character Name
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
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter character name"
        />
      </div>

      {/* Race Selection Component */}
      <RaceSelection selectedRace={race} onSelectRace={onRaceChange} />

      {/* Culture Selection Component */}
      <CultureSelection selectedCulture={culture} onSelectCulture={onCultureChange} />

      {!hideModulePoints && modulePoints !== undefined && onModulePointsChange && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              color: 'var(--color-cloud)',
              marginBottom: '0.5rem',
            }}
          >
            Starting Module Points
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="number"
              min="10"
              max="100"
              step="10"
              style={{
                width: '100%',
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.375rem',
                padding: '0.5rem 0.75rem',
              }}
              value={modulePoints}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                onModulePointsChange(value);
              }}
            />
          </div>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-cloud)',
              marginTop: '0.5rem',
            }}
          >
            How many module points you start with to spend on modules. Default is 10.
          </p>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <label
          style={{
            display: 'block',
            color: 'var(--color-cloud)',
            marginBottom: '0.5rem',
          }}
        >
        Starting Talents
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="number"
            min="4"
            max="20"
            step="1"
            style={{
              width: '100%',
              backgroundColor: 'var(--color-dark-elevated)',
              color: 'var(--color-white)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
            }}
            value={startingTalents}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              onStartingTalentsChange(value);
            }}
          />
        </div>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-cloud)',
            marginTop: '0.5rem',
          }}
        >
        How many Talent points you start with to distribute among weapon, magic, and crafting skills. Default is 8.
        </p>
      </div>
    </div>
  );
};

export default BasicInfoTab;
