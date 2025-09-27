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
  startingGearTier: string;
  startingGearPack: string;
  onNameChange: (name: string) => void;
  onRaceChange: (race: string, ancestry: Ancestry) => void;
  onCultureChange: (culture: string, cultureData: Culture) => void;
  onModulePointsChange?: (points: number) => void;
  onStartingTalentsChange: (talents: number) => void;
  onStartingGearChange: (tier: string, pack: string) => void;
  hideModulePoints?: boolean;
  selectedAncestry?: Ancestry | null;
  selectedCultureSelections?: {
    restriction?: any;
    benefit?: any;
    startingItem?: any;
  };
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  name,
  race,
  culture,
  modulePoints,
  startingTalents,
  startingGearTier,
  startingGearPack,
  onNameChange,
  onRaceChange,
  onCultureChange,
  onModulePointsChange,
  onStartingTalentsChange,
  onStartingGearChange,
  hideModulePoints = false,
  selectedAncestry,
  selectedCultureSelections,
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
      <RaceSelection
        selectedRace={race || (selectedAncestry?.name ?? '')}
        onSelectRace={onRaceChange}
        initialSelectedSubchoices={
          selectedAncestry?.options?.reduce((acc: Record<string, string>, opt: any) => {
            if (opt.selectedSubchoice) acc[opt.name] = opt.selectedSubchoice;
            return acc;
          }, {})
        }
      />

      {/* Culture Selection Component */}
      <CultureSelection
        selectedCulture={culture}
        onSelectCulture={onCultureChange}
        initialSelections={selectedCultureSelections}
      />

      {/* Starting Gear Selection - DISABLED: Logic not implemented */}
      {/*
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{
          color: 'var(--color-white)',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Starting Gear
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              color: 'var(--color-cloud)',
              marginBottom: '0.5rem',
            }}>
              Gear Tier
            </label>
            <select
              style={{
                width: '100%',
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.375rem',
                padding: '0.5rem 0.75rem',
              }}
              value={startingGearTier}
              onChange={(e) => onStartingGearChange(e.target.value, startingGearTier === e.target.value ? startingGearPack : '')}
            >
              <option value="">None</option>
              <option value="commoner">Commoner</option>
              <option value="adventurer">Adventurer</option>
            </select>
          </div>

          {startingGearTier && (
            <div>
              <label style={{
                display: 'block',
                color: 'var(--color-cloud)',
                marginBottom: '0.5rem',
              }}>
                Gear Pack
              </label>
              <select
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                }}
                value={startingGearPack}
                onChange={(e) => onStartingGearChange(startingGearTier, e.target.value)}
              >
                <option value="">Select a pack...</option>
                {startingGearTier === 'commoner' && (
                  <>
                    <option value="thug">Thug</option>
                    <option value="merchant">Merchant</option>
                    <option value="hunter">Hunter</option>
                    <option value="scribe">Scribe</option>
                    <option value="guard">Guard</option>
                  </>
                )}
                {startingGearTier === 'adventurer' && (
                  <>
                    <option value="soldier">Soldier</option>
                    <option value="priest">Priest</option>
                    <option value="ranger">Ranger</option>
                    <option value="wizard">Wizard</option>
                    <option value="mercenary">Mercenary</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-cloud)',
          marginTop: '0.5rem',
        }}>
          Choose starting gear to automatically equip your character with items and coins.
        </p>
      </div>
      */}

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
          How many Talent points you start with to distribute among weapon, magic, and crafting
          skills. Default is 8.
        </p>
      </div>
    </div>
  );
};

export default BasicInfoTab;
