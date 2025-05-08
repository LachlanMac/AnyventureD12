import React from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import TalentDisplay from '../TalentDisplay';

interface SkillData {
  value: number; // Dice type (1-6)
  talent: number; // Number of dice (0-3)
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
  languages: string[];
  stances: string[];
  modulePoints: {
    total: number;
    spent: number;
  };
  movement: number;
}

interface InfoTabProps {
  character: Character;
}

// Attribute skill mappings
const ATTRIBUTE_SKILLS = {
  physique: [
    { id: 'fitness', name: 'Fitness' },
    { id: 'deflect', name: 'Deflect' },
    { id: 'might', name: 'Might' },
  ],
  agility: [
    { id: 'evade', name: 'Evade' },
    { id: 'stealth', name: 'Stealth' },
    { id: 'coordination', name: 'Coordination' },
  ],
  mind: [
    { id: 'resilience', name: 'Resilience' },
    { id: 'concentration', name: 'Concentration' },
    { id: 'senses', name: 'Senses' },
  ],
  knowledge: [
    { id: 'science', name: 'Science' },
    { id: 'technology', name: 'Technology' },
    { id: 'medicine', name: 'Medicine' },
    { id: 'xenology', name: 'Xenology' },
  ],
  social: [
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'behavior', name: 'Behavior' },
    { id: 'presence', name: 'Presence' },
  ],
};

// Dice type mapping
const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

const InfoTab: React.FC<InfoTabProps> = ({ character }) => {

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Attributes and Skills */}
      <Card variant="default">
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Attributes & Skills
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(ATTRIBUTE_SKILLS).map(([attributeKey, skills]) => (
              <div 
                key={attributeKey} 
                className="p-4 bg-dark-elevated rounded-lg border border-dark-border"
              >
                {/* Attribute Name and Stars */}
                <div className="flex justify-between items-center mb-3">
                  <h3 
                    style={{ 
                      color: 'var(--color-metal-gold)', 
                      fontSize: '1.125rem', 
                      fontWeight: 'bold'
                    }}
                  >
                    {attributeKey.charAt(0).toUpperCase() + attributeKey.slice(1)}
                  </h3>
                  <TalentDisplay 
                    talent={character.attributes[attributeKey as keyof typeof character.attributes]} 
                    maxTalent={3} 
                    showNumber={true}
                    size="md"
                  />
                </div>

                {/* Related Skills */}
                <div className="space-y-2">
                  {skills.map((skill) => {
                    const skillData = character.skills[skill.id as keyof typeof character.skills];
                    // Now we use the attribute value for talent (number of dice)
                    // and the skill value for the die type
                    const attributeValue = character.attributes[attributeKey as keyof typeof character.attributes];
                    const dieType = attributeValue + DICE_TYPES[Math.min(skillData.value, DICE_TYPES.length - 1)];
                    
                    return (
                      <div key={skill.id} className="flex justify-between items-center">
                        <span style={{ color: 'var(--color-white)' }}>{skill.name}</span>
                        <div className="flex items-center gap-2">
                         
                          <span 
                            style={{ 
                              color: 'var(--color-metal-gold)', 
                              fontWeight: 'bold' 
                            }}
                          >
                            {skillData.value >= 0 ? `+${skillData.value}` : '-'}
                          </span>
                          <span 
                            style={{ 
                              color: 'var(--color-cloud)', 
                              fontSize: '0.875rem' 
                            }}
                          >
                            ({dieType})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Weapon Skills */}
      <Card variant="default">
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Weapon Skills
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(character.weaponSkills)
              .filter(([_, data]) => data.talent > 0) // Only show skills with talent
              .map(([skillId, skillData]) => {
                const dieType = DICE_TYPES[Math.min(skillData.value, DICE_TYPES.length - 1)];

                return (
                  <div 
                    key={skillId} 
                    className="flex justify-between items-center p-3 bg-dark-elevated rounded-lg"
                  >
                    <div>
                      <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                        {skillId
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                       
                        {skillData.talent > 0 ? `${skillData.talent}${dieType}` : 'No dice'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TalentDisplay talent={skillData.talent} maxTalent={3} size="md" />
                    </div>
                  </div>
                );
              })}
            {!Object.values(character.weaponSkills).some(skill => skill.talent > 0) && (
              <div className="col-span-2 text-center p-4 text-cloud">
                No weapon skills with talent points assigned.
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Crafting Skills */}
      <Card variant="default">
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Crafting Skills
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(character.craftingSkills)
              .filter(([_, data]) => data.talent > 0) // Only show skills with talent
              .map(([skillId, skillData]) => {
                const dieType = DICE_TYPES[Math.min(skillData.value, DICE_TYPES.length - 1)];
                return (
                  <div 
                    key={skillId} 
                    className="flex justify-between items-center p-3 bg-dark-elevated rounded-lg"
                  >
                    <div>
                      <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                        {skillId.charAt(0).toUpperCase() + skillId.slice(1)}
                      </div>
                      <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                        {skillData.talent > 0 ? `${skillData.talent}${dieType}` : 'No dice'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TalentDisplay talent={skillData.talent} maxTalent={3} size="md" />
                    </div>
                  </div>
                );
              })}
            {!Object.values(character.craftingSkills).some(skill => skill.talent > 0) && (
              <div className="col-span-2 text-center p-4 text-cloud">
                No crafting skills with talent points assigned.
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Dice System Reference Card */}
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
          <p
            style={{
              color: 'var(--color-cloud)',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            For skill checks, you roll a number of dice determined by your attribute value or talent stars.
            The die type (d4, d6, etc.) is determined by the skill level, which can be improved through modules.
          </p>

          <div
            style={{
              backgroundColor: 'var(--color-dark-elevated)',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                color: 'var(--color-white)',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              Examples:
            </div>
            <ul
              style={{
                color: 'var(--color-cloud)',
                fontSize: '0.875rem',
                paddingLeft: '1.5rem',
              }}
            >
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Attribute Skills:</strong> For Fitness (d{character.skills.fitness.value * 2 + 2}), roll {character.attributes.physique}d{character.skills.fitness.value * 2 + 2} based on your Physique attribute.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Weapon Skills:</strong> For Ranged Weapons (d{character.weaponSkills.rangedWeapons.value * 2 + 2}), roll {character.weaponSkills.rangedWeapons.talent}d{character.weaponSkills.rangedWeapons.value * 2 + 2} based on your talent stars.
              </li>
              <li>
                <strong>Crafting Skills:</strong> For Engineering (d{character.craftingSkills.engineering.value * 2 + 2}), roll {character.craftingSkills.engineering.talent}d{character.craftingSkills.engineering.value * 2 + 2} based on your talent stars.
              </li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default InfoTab;