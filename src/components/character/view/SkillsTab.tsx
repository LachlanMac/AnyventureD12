import React from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import AttributeSkillsSection from '../AttributeSkillsSection';
import SpecializedSkillsSection from '../SpecializedSkillsSection';
import { Character } from '../../../types/character';

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
          For each skill check, you roll dice equal to your <strong>talent stars</strong> of the
          skill's dice type. Attribute skills use your attribute value as talent stars, while
          specialized skills have their own talent values.
        </p>
      </div>

      <AttributeSkillsSection
        attributeName="Physique"
        attributeValue={character.attributes.physique}
        skills={[
          {
            id: 'fitness',
            name: 'Fitness',
            value: character.skills.fitness.value,
            talent: character.attributes.physique,
            diceTierModifier: character.skills.fitness.diceTierModifier,
          },
          {
            id: 'deflection',
            name: 'Deflection',
            value: character.skills.deflection.value,
            talent: character.attributes.physique,
            diceTierModifier: character.skills.deflection.diceTierModifier,
          },
          {
            id: 'might',
            name: 'Might',
            value: character.skills.might.value,
            talent: character.attributes.physique,
            diceTierModifier: character.skills.might.diceTierModifier,
          },
          {
            id: 'endurance',
            name: 'Endurance',
            value: character.skills.endurance.value,
            talent: character.attributes.physique,
            diceTierModifier: character.skills.endurance.diceTierModifier,
          },
        ]}
      />

      <AttributeSkillsSection
        attributeName="Finesse"
        attributeValue={character.attributes.finesse}
        skills={[
          {
            id: 'evasion',
            name: 'Evasion',
            value: character.skills.evasion.value,
            talent: character.attributes.finesse,
            diceTierModifier: character.skills.evasion.diceTierModifier,
          },
          {
            id: 'stealth',
            name: 'Stealth',
            value: character.skills.stealth.value,
            talent: character.attributes.finesse,
            diceTierModifier: character.skills.stealth.diceTierModifier,
          },
          {
            id: 'coordination',
            name: 'Coordination',
            value: character.skills.coordination.value,
            talent: character.attributes.finesse,
            diceTierModifier: character.skills.coordination.diceTierModifier,
          },
          {
            id: 'thievery',
            name: 'Thievery',
            value: character.skills.thievery.value,
            talent: character.attributes.finesse,
            diceTierModifier: character.skills.thievery.diceTierModifier,
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
            diceTierModifier: character.skills.resilience.diceTierModifier,
          },
          {
            id: 'concentration',
            name: 'Concentration',
            value: character.skills.concentration.value,
            talent: character.attributes.mind,
            diceTierModifier: character.skills.concentration.diceTierModifier,
          },
          {
            id: 'senses',
            name: 'Senses',
            value: character.skills.senses.value,
            talent: character.attributes.mind,
            diceTierModifier: character.skills.senses.diceTierModifier,
          },
          {
            id: 'logic',
            name: 'Logic',
            value: character.skills.logic.value,
            talent: character.attributes.mind,
            diceTierModifier: character.skills.logic.diceTierModifier,
          },
        ]}
      />

      <AttributeSkillsSection
        attributeName="Knowledge"
        attributeValue={character.attributes.knowledge}
        skills={[
          {
            id: 'wildcraft',
            name: 'Wildcraft',
            value: character.skills.wildcraft.value,
            talent: character.attributes.knowledge,
            diceTierModifier: character.skills.wildcraft.diceTierModifier,
          },
          {
            id: 'academics',
            name: 'Academics',
            value: character.skills.academics.value,
            talent: character.attributes.knowledge,
            diceTierModifier: character.skills.academics.diceTierModifier,
          },
          {
            id: 'magic',
            name: 'Magic',
            value: character.skills.magic.value,
            talent: character.attributes.knowledge,
            diceTierModifier: character.skills.magic.diceTierModifier,
          },
          {
            id: 'medicine',
            name: 'Medicine',
            value: character.skills.medicine.value,
            talent: character.attributes.knowledge,
            diceTierModifier: character.skills.medicine.diceTierModifier,
          },
        ]}
      />

      <AttributeSkillsSection
        attributeName="Social"
        attributeValue={character.attributes.social}
        skills={[
          {
            id: 'expression',
            name: 'Expression',
            value: character.skills.expression.value,
            talent: character.attributes.social,
            diceTierModifier: character.skills.expression.diceTierModifier,
          },
          {
            id: 'presence',
            name: 'Presence',
            value: character.skills.presence.value,
            talent: character.attributes.social,
            diceTierModifier: character.skills.presence.diceTierModifier,
          },
          {
            id: 'insight',
            name: 'Insight',
            value: character.skills.insight.value,
            talent: character.attributes.social,
            diceTierModifier: character.skills.insight.diceTierModifier,
          },
          {
            id: 'persuasion',
            name: 'Persuasion',
            value: character.skills.persuasion.value,
            talent: character.attributes.social,
            diceTierModifier: character.skills.persuasion.diceTierModifier,
          },
        ]}
      />

      <SpecializedSkillsSection
        title="Weapon Skills"
        description="Weapon skills have their own talent values that determine how many dice you roll for attacks."
        skills={[
          {
            id: 'unarmed',
            name: 'Unarmed',
            value: character.weaponSkills.unarmed.value,
            talent: character.weaponSkills.unarmed.talent,
            diceTierModifier: character.weaponSkills.unarmed.diceTierModifier,
          },
          {
            id: 'throwing',
            name: 'Throwing',
            value: character.weaponSkills.throwing.value,
            talent: character.weaponSkills.throwing.talent,
            diceTierModifier: character.weaponSkills.throwing.diceTierModifier,
          },
          {
            id: 'rangedWeapons',
            name: 'Ranged Weapons',
            value: character.weaponSkills.rangedWeapons.value,
            talent: character.weaponSkills.rangedWeapons.talent,
            diceTierModifier: character.weaponSkills.rangedWeapons.diceTierModifier,
          },
          {
            id: 'simpleMeleeWeapons',
            name: 'Simple Melee Weapons',
            value: character.weaponSkills.simpleMeleeWeapons.value,
            talent: character.weaponSkills.simpleMeleeWeapons.talent,
            diceTierModifier: character.weaponSkills.simpleMeleeWeapons.diceTierModifier,
          },
          {
            id: 'complexMeleeWeapons',
            name: 'Complex Melee Weapons',
            value: character.weaponSkills.complexMeleeWeapons.value,
            talent: character.weaponSkills.complexMeleeWeapons.talent,
            diceTierModifier: character.weaponSkills.complexMeleeWeapons.diceTierModifier,
          },
        ]}
      />

      <SpecializedSkillsSection
        title="Magic Skills"
        description="Magic skills represent affinity with different sources of magical or planar power."
        skills={[
          {
            id: 'black',
            name: 'Black',
            value: character.magicSkills.black.value,
            talent: character.magicSkills.black.talent,
            diceTierModifier: character.magicSkills.black.diceTierModifier,
          },
          {
            id: 'primal',
            name: 'Primal',
            value: character.magicSkills.primal.value,
            talent: character.magicSkills.primal.talent,
            diceTierModifier: character.magicSkills.primal.diceTierModifier,
          },
          {
            id: 'alteration',
            name: 'Alteration',
            value: character.magicSkills.alteration.value,
            talent: character.magicSkills.alteration.talent,
            diceTierModifier: character.magicSkills.alteration.diceTierModifier,
          },
          {
            id: 'divine',
            name: 'Divine',
            value: character.magicSkills.divine.value,
            talent: character.magicSkills.divine.talent,
            diceTierModifier: character.magicSkills.divine.diceTierModifier,
          },
          {
            id: 'mystic',
            name: 'Mystic',
            value: character.magicSkills.mystic.value,
            talent: character.magicSkills.mystic.talent,
            diceTierModifier: character.magicSkills.mystic.diceTierModifier,
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
            diceTierModifier: character.craftingSkills.engineering.diceTierModifier,
          },
          {
            id: 'fabrication',
            name: 'Fabrication',
            value: character.craftingSkills.fabrication.value,
            talent: character.craftingSkills.fabrication.talent,
            diceTierModifier: character.craftingSkills.fabrication.diceTierModifier,
          },
          {
            id: 'alchemy',
            name: 'Alchemy',
            value: character.craftingSkills.alchemy.value,
            talent: character.craftingSkills.alchemy.talent,
            diceTierModifier: character.craftingSkills.alchemy.diceTierModifier,
          },
          {
            id: 'cooking',
            name: 'Cooking',
            value: character.craftingSkills.cooking.value,
            talent: character.craftingSkills.cooking.talent,
            diceTierModifier: character.craftingSkills.cooking.diceTierModifier,
          },
          {
            id: 'glyphcraft',
            name: 'Glyphcraft',
            value: character.craftingSkills.glyphcraft.value,
            talent: character.craftingSkills.glyphcraft.talent,
            diceTierModifier: character.craftingSkills.glyphcraft.diceTierModifier,
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
