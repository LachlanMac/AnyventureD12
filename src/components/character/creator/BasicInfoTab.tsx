import React from 'react';
import { RacialModule, Module } from '../../../types/character';
import RaceSelection from '../RaceSelection';
import CultureSelection from '../CultureSelection';

interface BasicInfoTabProps {
  name: string;
  race: string;
  culture: string;
  modulePoints: number;
  onNameChange: (name: string) => void;
  onRaceChange: (race: string, racialModule: RacialModule) => void;
  onCultureChange: (culture: string, cultureModule: Module) => void;
  onModulePointsChange: (points: number) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  name,
  race,
  culture,
  modulePoints,
  onNameChange,
  onRaceChange,
  onCultureChange,
  onModulePointsChange,
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
          Module points determine your starting power level. Your character level is calculated as
          Module Points / 10.
        </p>
      </div>
    </div>
  );
};

export default BasicInfoTab;
