import React from 'react';

// Weapon skills
const SPECIALIZED_SKILLS = [
  { id: 'unarmed', name: 'Unarmed', defaultTalent: 0 },
  { id: 'throwing', name: 'Throwing', defaultTalent: 0 },
  { id: 'rangedWeapons', name: 'Ranged Weapons', defaultTalent: 1 },
  { id: 'simpleMeleeWeapons', name: 'Simple Melee Weapons', defaultTalent: 1 },
  { id: 'complexMeleeWeapons', name: 'Complex Melee Weapons', defaultTalent: 0 },
];

// Magic skills
const MAGIC_SKILLS = [
  { id: 'black', name: 'Black' },         // necromancy, witchcraft (fiend)
  { id: 'primal', name: 'Primal' },       // evocation, druidic (cosmic)
  { id: 'alteration', name: 'Alteration' }, // illusion, transmutation (fey)
  { id: 'divine', name: 'Divine' },       // abjuration, divine (draconic)
  { id: 'mystic', name: 'Mystic' },       // auguration, shamanic (astral)
];

// Crafting skills
const CRAFTING_SKILLS = [
  { id: 'engineering', name: 'Engineering' },
  { id: 'fabrication', name: 'Fabrication' },
  { id: 'alchemy', name: 'Alchemy' },
  { id: 'cooking', name: 'Cooking' },
  { id: 'glyphcraft', name: 'Glyphcraft' },
];

interface WeaponSkills {
  [key: string]: {
    value: number;
    talent: number;
  };
}

interface MagicSkills {
  [key: string]: {
    value: number;
    talent: number;
  };
}


interface CraftingSkills {
  [key: string]: {
    value: number;
    talent: number;
  };
}

interface TalentsTabProps {
  weaponSkills: WeaponSkills;
  magicSkills : MagicSkills;
  craftingSkills: CraftingSkills;
  talentStarsRemaining: number;
  onUpdateMagicSkillTalent: (skillId: string, newTalent: number) => void;
  onUpdateSpecializedSkillTalent: (skillId: string, newTalent: number) => void;
  onUpdateCraftingSkillTalent: (skillId: string, newTalent: number) => void;
}

const TalentsTab: React.FC<TalentsTabProps> = ({
  weaponSkills,
  magicSkills,
  craftingSkills,
  talentStarsRemaining,
  onUpdateMagicSkillTalent,
  onUpdateSpecializedSkillTalent,
  onUpdateCraftingSkillTalent,
}) => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h2
          style={{
            color: 'var(--color-white)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}
        >
          Talents & Specialized Skills
        </h2>
        <div
          style={{
            backgroundColor: 'var(--color-dark-elevated)',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            color:
              talentStarsRemaining > 0 ? 'var(--color-metal-gold)' : 'var(--color-white)',
          }}
        >
          Talent Stars: <span style={{ fontWeight: 'bold' }}>{talentStarsRemaining}</span>
        </div>
      </div>

      <p
        style={{
          color: 'var(--color-cloud)',
          marginBottom: '1.5rem',
        }}
      >
        Assign talent stars to specialized skills that don't depend on attributes. Ranged
        and Melee weapons start with 1 talent star by default.
      </p>

      {/* Weapon Skills */}
      <div>
        <h3
          style={{
            color: 'var(--color-white)',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          Weapon Skills
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {SPECIALIZED_SKILLS.map((skill) => (
            <div
              key={skill.id}
              style={{
                backgroundColor: 'var(--color-dark-elevated)',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: 'var(--color-white)',
                  fontWeight: 'bold',
                }}
              >
                {skill.name}
              </div>

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[1, 2, 3].map((talentPosition) => {
                  const isFilled =
                    weaponSkills[skill.id]?.talent >= talentPosition;
                  // Determine if this is the first star (position 1)
                  const isFirstStar = talentPosition === 1;

                  // Calculate if this star can be toggled based on current talent and available stars
                  // First star (position 1) for weapon skills can't be toggled off
                  const canToggleOn =
                    !isFilled &&
                    weaponSkills[skill.id]?.talent ===
                      talentPosition - 1 &&
                    talentStarsRemaining > 0;
                  const canToggleOff =
                    isFilled &&
                    talentPosition ===
                      weaponSkills[skill.id]?.talent &&
                    !isFirstStar;

                  return (
                    <button
                      key={talentPosition}
                      onClick={() => {
                        if (isFilled && canToggleOff) {
                          // If star is filled and it's the highest filled star (and not the first star), turn it off
                          onUpdateSpecializedSkillTalent(skill.id, talentPosition - 1);
                        } else if (!isFilled && canToggleOn) {
                          // If star is empty and it's the next one in sequence, turn it on
                          onUpdateSpecializedSkillTalent(skill.id, talentPosition);
                        }
                      }}
                      disabled={!canToggleOn && !canToggleOff}
                      style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: canToggleOn || canToggleOff ? 'pointer' : 'default',
                        opacity: canToggleOn || canToggleOff || isFilled ? 1 : 0.5,
                        color: isFilled
                          ? 'var(--color-metal-gold)'
                          : 'var(--color-dark-surface)',
                        fontSize: '1.25rem',
                      }}
                      aria-label={`Set talent to ${talentPosition}`}
                    >
                      {/* Star symbol */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={isFilled ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

          {/* Weapon Skills */}
      <div>
        <h3
          style={{
            color: 'var(--color-white)',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          Weapon Skills
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {MAGIC_SKILLS.map((skill) => (
            <div
              key={skill.id}
              style={{
                backgroundColor: 'var(--color-dark-elevated)',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: 'var(--color-white)',
                  fontWeight: 'bold',
                }}
              >
                {skill.name}
              </div>

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[1, 2, 3].map((talentPosition) => {
                  const isFilled =
                    magicSkills[skill.id]?.talent >= talentPosition;

                  // Determine if this is the first star (position 1)
                  const isFirstStar = talentPosition === 1;

                  // Calculate if this star can be toggled based on current talent and available stars
                  // First star (position 1) for weapon skills can't be toggled off
                  const canToggleOn =
                    !isFilled &&
                    magicSkills[skill.id]?.talent ===
                      talentPosition - 1 &&
                    talentStarsRemaining > 0;
                  const canToggleOff =
                    isFilled &&
                    talentPosition ===
                    magicSkills[skill.id]?.talent &&
                    !isFirstStar;

                  return (
                    <button
                      key={talentPosition}
                      onClick={() => {
                        if (isFilled && canToggleOff) {
                          // If star is filled and it's the highest filled star (and not the first star), turn it off
                          onUpdateMagicSkillTalent(skill.id, talentPosition - 1);
                        } else if (!isFilled && canToggleOn) {
                          // If star is empty and it's the next one in sequence, turn it on
                          onUpdateMagicSkillTalent(skill.id, talentPosition);
                        }
                      }}
                      disabled={!canToggleOn && !canToggleOff}
                      style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: canToggleOn || canToggleOff ? 'pointer' : 'default',
                        opacity: canToggleOn || canToggleOff || isFilled ? 1 : 0.5,
                        color: isFilled
                          ? 'var(--color-metal-gold)'
                          : 'var(--color-dark-surface)',
                        fontSize: '1.25rem',
                      }}
                      aria-label={`Set talent to ${talentPosition}`}
                    >
                      {/* Star symbol */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={isFilled ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crafting Skills */}
      <div style={{ marginTop: '2rem' }}>
        <h3
          style={{
            color: 'var(--color-white)',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          Crafting Skills
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {CRAFTING_SKILLS.map((skill) => (
            <div
              key={skill.id}
              style={{
                backgroundColor: 'var(--color-dark-elevated)',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: 'var(--color-white)',
                  fontWeight: 'bold',
                }}
              >
                {skill.name}
              </div>

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[1, 2, 3].map((talentPosition) => {
                  const isFilled =
                    craftingSkills[skill.id]?.talent >= talentPosition;
                  // Calculate if this star can be toggled based on current talent and available stars
                  const canToggleOn =
                    !isFilled &&
                    craftingSkills[skill.id]?.talent ===
                      talentPosition - 1 &&
                    talentStarsRemaining > 0;
                  const canToggleOff =
                    isFilled &&
                    talentPosition ===
                      craftingSkills[skill.id]?.talent;

                  return (
                    <button
                      key={talentPosition}
                      onClick={() => {
                        if (isFilled && canToggleOff) {
                          // If star is filled and it's the highest filled star, turn it off
                          onUpdateCraftingSkillTalent(skill.id, talentPosition - 1);
                        } else if (!isFilled && canToggleOn) {
                          // If star is empty and it's the next one in sequence, turn it on
                          onUpdateCraftingSkillTalent(skill.id, talentPosition);
                        }
                      }}
                      disabled={!canToggleOn && !canToggleOff}
                      style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: canToggleOn || canToggleOff ? 'pointer' : 'default',
                        opacity: canToggleOn || canToggleOff || isFilled ? 1 : 0.5,
                        color: isFilled
                          ? 'var(--color-metal-gold)'
                          : 'var(--color-dark-surface)',
                        fontSize: '1.25rem',
                      }}
                      aria-label={`Set talent to ${talentPosition}`}
                    >
                      {/* Star symbol */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={isFilled ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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
            marginBottom: '0.5rem',
          }}
        >
          Talent System
        </h3>
        <p style={{ color: 'var(--color-cloud)' }}>
          Each talent star represents a die you roll when using that skill. For example,
          if you have 2 talent stars in Ranged Weapons, you'll roll 2 dice for ranged
          weapon checks.
        </p>
      </div>
    </div>
  );
};

export default TalentsTab;