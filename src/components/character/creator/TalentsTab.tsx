import React from 'react';
import { SkillMap } from '../../../types/character';
import {
  SPECIALIZED_SKILLS,
  MAGIC_SKILLS,
  CRAFTING_SKILLS,
} from '../../../constants/skillConstants';

interface TalentsTabProps {
  weaponSkills: SkillMap;
  magicSkills: SkillMap;
  craftingSkills: SkillMap;
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
  // Render stars for a skill's talent with toggle functionality
  // Modify renderTalentStars to accept defaultTalent parameter
  const renderTalentStars = (
    skillId: string,
    skillMap: SkillMap,
    updateFunction: (skillId: string, newTalent: number) => void,
    defaultTalent: number = 0
  ) => {
    const skillData = skillMap[skillId] || { value: 0, talent: 0 };

    return [1, 2, 3, 4].map((talentPosition) => {
      const isFilled = skillData.talent >= talentPosition;
      // Check if this star is a default star
      const isDefaultStar = isFilled && talentPosition <= defaultTalent;

      // Calculate if this star can be toggled
      const canToggleOn =
        !isFilled && skillData.talent === talentPosition - 1 && talentStarsRemaining > 0;

      const canToggleOff =
        isFilled && talentPosition === skillData.talent && !(talentPosition <= defaultTalent);
      return (
        <button
          key={talentPosition}
          onClick={() => {
            if (isFilled && canToggleOff) {
              // Turn off the star
              updateFunction(skillId, talentPosition - 1);
            } else if (!isFilled && canToggleOn) {
              // Turn on the star
              updateFunction(skillId, talentPosition);
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
            opacity: canToggleOn || canToggleOff || isFilled ? 1 : 1,
            color: isFilled
              ? isDefaultStar
                ? 'var(--color-sat-purple)' // Gray color for default stars
                : 'var(--color-metal-gold)' // Gold color for added stars
              : 'var(--color-dark-surface)',
            fontSize: '1.25rem',
          }}
          aria-label={`Set talent to ${talentPosition}`}
        >
          {/* Star symbol */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={isFilled ? 'currentColor' : 'none'}
            stroke="white"
            strokeWidth="1"
            strokeOpacity={0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      );
    });
  };

  // Modify renderSkillSection to pass defaultTalent value
  const renderSkillSection = (
    title: string,
    skills: typeof SPECIALIZED_SKILLS,
    skillMap: SkillMap,
    updateFunction: (skillId: string, newTalent: number) => void
  ) => {
    return (
      <div style={{ marginTop: title !== 'Weapon Skills' ? '2rem' : '0' }}>
        <h3
          style={{
            color: 'var(--color-white)',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          {title}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {skills.map((skill) => (
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
                {/* Pass the defaultTalent value to renderTalentStars */}
                {renderTalentStars(
                  skill.id,
                  skillMap,
                  updateFunction,
                  skill.defaultTalent || 0 // Pass the actual default talent value
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
            color: talentStarsRemaining > 0 ? 'var(--color-metal-gold)' : 'var(--color-white)',
          }}
        >
          Available Talents: <span style={{ fontWeight: 'bold' }}>{talentStarsRemaining}</span>
        </div>
      </div>

      <p
        style={{
          color: 'var(--color-cloud)',
          marginBottom: '1.5rem',
        }}
      >
        Assign talent stars to specialized skills that don't depend on attributes. Ranged and Melee
        weapons start with 1 talent star by default.
      </p>

      {/* Render all skill sections using the reusable function */}
      {renderSkillSection(
        'Weapon Skills',
        SPECIALIZED_SKILLS,
        weaponSkills,
        onUpdateSpecializedSkillTalent
      )}

      {renderSkillSection('Magic Skills', MAGIC_SKILLS, magicSkills, onUpdateMagicSkillTalent)}

      {renderSkillSection(
        'Crafting Skills',
        CRAFTING_SKILLS,
        craftingSkills,
        onUpdateCraftingSkillTalent
      )}

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
          Each talent star represents a die you roll when using that skill. For example, if you have
          2 talent stars in Ranged Weapons, you'll roll 2 dice for ranged weapon checks.
        </p>
      </div>
    </div>
  );
};

export default TalentsTab;
