import React from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import AttributeSkillsSection from '../AttributeSkillsSection';
import SpecializedSkillsSection from '../SpecializedSkillsSection';

interface SkillData {
  value: number;
  talent: number;
}

interface Character {
  attributes: {
    physique: number;
    agility: number;
    mind: number;
    knowledge: number;
    social: number;
  };
  skills: {
    fitness: SkillData;
    deflect: SkillData;
    might: SkillData;
    evade: SkillData;
    stealth: SkillData;
    coordination: SkillData;
    resilience: SkillData;
    concentration: SkillData;
    senses: SkillData;
    science: SkillData;
    technology: SkillData;
    medicine: SkillData;
    xenology: SkillData;
    negotiation: SkillData;
    behavior: SkillData;
    presence: SkillData;
  };
  weaponSkills: {
    rangedWeapons: SkillData;
    meleeWeapons: SkillData;
    weaponSystems: SkillData;
    heavyRangedWeapons: SkillData;
  };
  craftingSkills: {
    engineering: SkillData;
    fabrication: SkillData;
    biosculpting: SkillData;
    synthesis: SkillData;
  };
}

interface SkillsTabProps {
  character: Character;
}

const SkillsTab: React.FC<SkillsTabProps> = ({ character }) => {
  return (
    <div>
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--color-dark-elevated)',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            color: 'var(--color-white)',
            fontSize: '1.125rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}
        >
          Talent System
        </h3>
        <p style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
          For each skill check, you roll dice equal to your <strong>talent stars</strong> of
          the skill's dice type. Attribute skills use your attribute value as talent stars,
          while specialized skills have their own talent values.
        </p>
      </div>

      {/* Attribute Skill Sections */}
      <AttributeSkillsSection
        attributeName="Physique"
        attributeValue={character.attributes.physique}
        skills={[
          {
            id: 'fitness',
            name: 'Fitness',
            value: character.skills.fitness.value,
            talent: character.attributes.physique,
          },
          {
            id: 'deflect',
            name: 'Deflect',
            value: character.skills.deflect.value,
            talent: character.attributes.physique,
          },
          {
            id: 'might',
            name: 'Might',
            value: character.skills.might.value,
            talent: character.attributes.physique,
          },
        ]}
      />

      <AttributeSkillsSection
        attributeName="Agility"
        attributeValue={character.attributes.agility}
        skills={[
          {
            id: 'evade',
            name: 'Evade',
            value: character.skills.evade.value,
            talent: character.attributes.agility,
          },
          {
            id: 'stealth',
            name: 'Stealth',
            value: character.skills.stealth.value,
            talent: character.attributes.agility,
          },
          {
            id: 'coordination',
            name: 'Coordination',
            value: character.skills.coordination.value,
            talent: character.attributes.agility,
          },
        ]}
      />

      <AttributeSkillsSection
        attributeName="Mind"
        attributeValue={character.attributes.mind}
        skills={[
          {
            id: 'resilience',
            name: 'Resilience',
            value: character.skills.resilience.value,
            talent: character.attributes.mind,
          },
          {
            id: 'concentration',
            name: 'Concentration',
            value: character.skills.concentration.value,
            talent: character.attributes.mind,
          },
          {
            id: 'senses',
            name: 'Senses',
            value: character.skills.senses.value,
            talent: character.attributes.mind,
          },
        ]}
      />

      <AttributeSkillsSection
        attributeName="Knowledge"
        attributeValue={character.attributes.knowledge}
        skills={[
          {
            id: 'science',
            name: 'Science',
            value: character.skills.science.value,
            talent: character.attributes.knowledge,
          },
          {
            id: 'technology',
            name: 'Technology',
            value: character.skills.technology.value,
            talent: character.attributes.knowledge,
          },
          {
            id: 'medicine',
            name: 'Medicine',
            value: character.skills.medicine.value,
            talent: character.attributes.knowledge,
          },
          {
            id: 'xenology',
            name: 'Xenology',
            value: character.skills.xenology.value,
            talent: character.attributes.knowledge,
          },
        ]}
      />

      <AttributeSkillsSection
        attributeName="Social"
        attributeValue={character.attributes.social}
        skills={[
          {
            id: 'negotiation',
            name: 'Negotiation',
            value: character.skills.negotiation.value,
            talent: character.attributes.social,
          },
          {
            id: 'behavior',
            name: 'Behavior',
            value: character.skills.behavior.value,
            talent: character.attributes.social,
          },
          {
            id: 'presence',
            name: 'Presence',
            value: character.skills.presence.value,
            talent: character.attributes.social,
          },
        ]}
      />

      {/* Specialized Skills Section */}
      <SpecializedSkillsSection
        title="Weapon Skills"
        description="Weapon skills have their own talent values that determine how many dice you roll for attacks."
        skills={[
          {
            id: 'rangedWeapons',
            name: 'Ranged Weapons',
            value: character.weaponSkills.rangedWeapons.value,
            talent: character.weaponSkills.rangedWeapons.talent,
          },
          {
            id: 'meleeWeapons',
            name: 'Melee Weapons',
            value: character.weaponSkills.meleeWeapons.value,
            talent: character.weaponSkills.meleeWeapons.talent,
          },
          {
            id: 'weaponSystems',
            name: 'Weapon Systems',
            value: character.weaponSkills.weaponSystems.value,
            talent: character.weaponSkills.weaponSystems.talent,
          },
          {
            id: 'heavyRangedWeapons',
            name: 'Heavy Ranged Weapons',
            value: character.weaponSkills.heavyRangedWeapons.value,
            talent: character.weaponSkills.heavyRangedWeapons.talent,
          },
        ]}
      />

      <SpecializedSkillsSection
        title="Crafting Skills"
        description="Crafting skills are used to create and modify equipment and items."
        skills={[
          {
            id: 'engineering',
            name: 'Engineering',
            value: character.craftingSkills.engineering.value,
            talent: character.craftingSkills.engineering.talent,
          },
          {
            id: 'fabrication',
            name: 'Fabrication',
            value: character.craftingSkills.fabrication.value,
            talent: character.craftingSkills.fabrication.talent,
          },
          {
            id: 'biosculpting',
            name: 'Biosculpting',
            value: character.craftingSkills.biosculpting.value,
            talent: character.craftingSkills.biosculpting.talent,
          },
          {
            id: 'synthesis',
            name: 'Synthesis',
            value: character.craftingSkills.synthesis.value,
            talent: character.craftingSkills.synthesis.talent,
          },
        ]}
      />

      <Card variant="default">
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Dice System Reference
          </h2>
        </CardHeader>
        <CardBody>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.5rem',
                    color: 'var(--color-cloud)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  Dice Value
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.5rem',
                    color: 'var(--color-cloud)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  Die Type
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.5rem',
                    color: 'var(--color-cloud)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  Talent Stars
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  1
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  1d4
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  Number of dice to roll
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  2
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  1d6
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  Based on attribute or talent stars
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  3
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  1d8
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  Maximum of 3 stars
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  4
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  1d10
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                ></td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  5
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                >
                  1d12
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-dark-border)',
                  }}
                ></td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}>6</td>
                <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}>1d20</td>
                <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}></td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
};

export default SkillsTab;