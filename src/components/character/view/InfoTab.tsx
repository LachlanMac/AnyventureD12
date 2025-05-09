import React from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import TalentDisplay from '../TalentDisplay';
import { Character } from '../../../types/character';
interface SkillData {
  value: number; // Dice type (1-6)
  talent: number; // Number of dice (0-3)
}



interface InfoTabProps {
  character: Character;
}

// Attribute skill mappings
const ATTRIBUTE_SKILLS = {
  physique: [
    { id: 'fitness', name: 'Fitness' },
    { id: 'deflection', name: 'Deflection' },
    { id: 'might', name: 'Might' },
    { id: 'endurance', name: 'Endurance' },
  ],
  finesse: [
    { id: 'evasion', name: 'Evasion' },
    { id: 'stealth', name: 'Stealth' },
    { id: 'coordination', name: 'Coordination' },
    { id: 'thievery', name: 'Thievery' },
  ],
  mind: [
    { id: 'resilience', name: 'Resilience' },
    { id: 'concentration', name: 'Concentration' },
    { id: 'senses', name: 'Senses' },
    { id: 'logic', name: 'Logic' },
  ],
  knowledge: [
    { id: 'wildcraft', name: 'Wildcraft' },
    { id: 'academics', name: 'Academics' },
    { id: 'magic', name: 'Magic' },
    { id: 'medicine', name: 'Medicine' },
  ],
  social: [
    { id: 'expression', name: 'Expression' },
    { id: 'presence', name: 'Presence' },
    { id: 'insight', name: 'Insight' },
    { id: 'persuasion', name: 'Persuasion' },
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
                      <TalentDisplay talent={skillData.talent} maxTalent={5} size="md" />
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

          {/* Magic Skills */}
      <Card variant="default">
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Magic Skills
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(character.magicSkills)
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
                      <TalentDisplay talent={skillData.talent} maxTalent={5} size="md" />
                    </div>
                  </div>
                );
              })}
            {!Object.values(character.magicSkills).some(skill => skill.talent > 0) && (
              <div className="col-span-2 text-center p-4 text-cloud">
                No magic skills with talent points assigned.
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
                      <TalentDisplay talent={skillData.talent} maxTalent={5} size="md" />
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
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default InfoTab;