import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import TalentDisplay from '../TalentDisplay';
import MusicTalentDisplay from '../MusicTalentDisplay';
import ExtraTrainingManager from './ExtraTrainingManager';
import { Character, Language } from '../../../types/character';
import { getModifiedDiceType, getDiceTierModifierIndicator } from '../../../utils/diceUtils';

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

// Dice type mapping (removed - using diceUtils instead)

const InfoTab: React.FC<InfoTabProps> = ({ character }) => {
  const [musicSkills, setMusicSkills] = useState(
    character.musicSkills || {
      vocal: 0,
      percussion: 0,
      wind: 0,
      strings: 0,
      brass: 0,
    }
  );

  const [languageSkills, setLanguageSkills] = useState(character.languageSkills || {});
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [traits, setTraits] = useState(character.traits || []);

  // Handler for when traits are updated via ExtraTrainingManager
  const handleTraitsUpdate = (updatedTraits: any[]) => {
    setTraits(updatedTraits);
    // Also refresh the page to update skill displays
    window.location.reload();
  };

  // Load available languages
  useEffect(() => {
    fetch('/data/languages/languages.json')
      .then((res) => res.json())
      .then((data) => setAvailableLanguages(data))
      .catch((err) => console.error('Failed to load languages:', err));
  }, []);

  const handleMusicSkillChange = async (skillName: string, newValue: number) => {
    const updatedSkills = {
      ...musicSkills,
      [skillName]: newValue,
    };
    setMusicSkills(updatedSkills);

    // Update the backend
    try {
      const response = await fetch(`/api/characters/${character._id}/music-skills`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for auth cookies
        body: JSON.stringify({ musicSkills: updatedSkills }),
      });

      if (!response.ok) {
        throw new Error('Failed to update music skills');
      }
    } catch (error) {
      console.error('Error updating music skills:', error);
      // Revert on error
      setMusicSkills(character.musicSkills);
    }
  };

  const handleLanguageSkillChange = async (languageId: string, newValue: number) => {
    const updatedSkills = { ...languageSkills };

    // Only remove language if going from 1 to 0 (clicking first star when only 1 star is selected)
    if (newValue === 0 && languageSkills[languageId] === 1) {
      delete updatedSkills[languageId];
    } else if (newValue > 0) {
      updatedSkills[languageId] = newValue;
    }

    setLanguageSkills(updatedSkills);

    // Update the backend
    try {
      const response = await fetch(`/api/characters/${character._id}/language-skills`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ languageSkills: updatedSkills }),
      });

      if (!response.ok) {
        throw new Error('Failed to update language skills');
      }
    } catch (error) {
      console.error('Error updating language skills:', error);
      // Revert on error
      setLanguageSkills(character.languageSkills || {});
    }
  };

  const handleAddLanguage = () => {
    if (selectedLanguage && !languageSkills[selectedLanguage]) {
      handleLanguageSkillChange(selectedLanguage, 1);
      setSelectedLanguage('');
      setIsAddingLanguage(false);
    }
  };

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
                      fontWeight: 'bold',
                    }}
                  >
                    {attributeKey.charAt(0).toUpperCase() + attributeKey.slice(1)}
                  </h3>
                  <TalentDisplay
                    talent={character.attributes[attributeKey as keyof typeof character.attributes]}
                    maxTalent={4}
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
                    const attributeValue =
                      character.attributes[attributeKey as keyof typeof character.attributes];
                    const diceTierModifier = skillData.diceTierModifier || 0;

                    // If skill value is negative, show automatic failure
                    const effectiveTalent = skillData.value < 0 ? 0 : attributeValue;
                    const diceType =
                      skillData.value < 0
                        ? ''
                        : getModifiedDiceType(skillData.value, diceTierModifier);
                    const dieDisplay = skillData.value < 0 ? '1' : effectiveTalent + diceType;
                    const modifierIndicator =
                      skillData.value < 0 ? '' : getDiceTierModifierIndicator(diceTierModifier);

                    return (
                      <div key={skill.id} className="flex justify-between items-center">
                        <span style={{ color: 'var(--color-white)' }}>{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              color:
                                skillData.value < 0
                                  ? 'var(--color-sunset)'
                                  : 'var(--color-metal-gold)',
                              fontWeight: 'bold',
                            }}
                          >
                            {skillData.value >= 0 ? `+${skillData.value}` : skillData.value}
                            {modifierIndicator && (
                              <span
                                style={{
                                  color: diceTierModifier > 0 ? '#10b981' : 'var(--color-sunset)',
                                  marginLeft: '0.25rem',
                                  fontSize: '0.875rem',
                                  fontWeight: 'bold',
                                }}
                              >
                                {modifierIndicator}
                              </span>
                            )}
                          </span>
                          <span
                            style={{
                              color:
                                skillData.value < 0 ? 'var(--color-sunset)' : 'var(--color-cloud)',
                              fontSize: '0.875rem',
                              fontWeight: skillData.value < 0 ? 'bold' : 'normal',
                            }}
                          >
                            ({dieDisplay})
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
                const diceTierModifier = skillData.diceTierModifier || 0;
                // If skill value is negative, show automatic failure
                const effectiveTalent = skillData.value < 0 ? 0 : skillData.talent;
                const diceType =
                  skillData.value < 0 ? '' : getModifiedDiceType(skillData.value, diceTierModifier);
                const modifierIndicator =
                  skillData.value < 0 ? '' : getDiceTierModifierIndicator(diceTierModifier);

                return (
                  <div
                    key={skillId}
                    className="flex justify-between items-center p-3 bg-dark-elevated rounded-lg"
                  >
                    <div>
                      <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                        {skillId
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                        {modifierIndicator && (
                          <span
                            style={{
                              color: diceTierModifier > 0 ? '#10b981' : 'var(--color-sunset)',
                              marginLeft: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {modifierIndicator}
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                        {skillData.value < 0
                          ? '1'
                          : skillData.talent > 0
                            ? `${effectiveTalent}${diceType}`
                            : 'No dice'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TalentDisplay talent={skillData.talent} maxTalent={4} size="md" />
                    </div>
                  </div>
                );
              })}
            {!Object.values(character.weaponSkills).some((skill) => skill.talent > 0) && (
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
                const diceTierModifier = skillData.diceTierModifier || 0;
                // If skill value is negative, show automatic failure
                const effectiveTalent = skillData.value < 0 ? 0 : skillData.talent;
                const diceType =
                  skillData.value < 0 ? '' : getModifiedDiceType(skillData.value, diceTierModifier);
                const modifierIndicator =
                  skillData.value < 0 ? '' : getDiceTierModifierIndicator(diceTierModifier);

                return (
                  <div
                    key={skillId}
                    className="flex justify-between items-center p-3 bg-dark-elevated rounded-lg"
                  >
                    <div>
                      <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                        {skillId.charAt(0).toUpperCase() + skillId.slice(1)} Magic
                        {modifierIndicator && (
                          <span
                            style={{
                              color: diceTierModifier > 0 ? '#10b981' : 'var(--color-sunset)',
                              marginLeft: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {modifierIndicator}
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                        {skillData.value < 0
                          ? '1'
                          : skillData.talent > 0
                            ? `${effectiveTalent}${diceType}`
                            : 'No dice'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TalentDisplay talent={skillData.talent} maxTalent={4} size="md" />
                    </div>
                  </div>
                );
              })}
            {!Object.values(character.magicSkills).some((skill) => skill.talent > 0) && (
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
                const diceTierModifier = skillData.diceTierModifier || 0;
                // If skill value is negative, show automatic failure
                const effectiveTalent = skillData.value < 0 ? 0 : skillData.talent;
                const diceType =
                  skillData.value < 0 ? '' : getModifiedDiceType(skillData.value, diceTierModifier);
                const modifierIndicator =
                  skillData.value < 0 ? '' : getDiceTierModifierIndicator(diceTierModifier);

                return (
                  <div
                    key={skillId}
                    className="flex justify-between items-center p-3 bg-dark-elevated rounded-lg"
                  >
                    <div>
                      <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                        {skillId.charAt(0).toUpperCase() + skillId.slice(1)}
                        {modifierIndicator && (
                          <span
                            style={{
                              color: diceTierModifier > 0 ? '#10b981' : 'var(--color-sunset)',
                              marginLeft: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {modifierIndicator}
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                        {skillData.value < 0
                          ? '1'
                          : skillData.talent > 0
                            ? `${effectiveTalent}${diceType}`
                            : 'No dice'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TalentDisplay talent={skillData.talent} maxTalent={4} size="md" />
                    </div>
                  </div>
                );
              })}
            {!Object.values(character.craftingSkills).some((skill) => skill.talent > 0) && (
              <div className="col-span-2 text-center p-4 text-cloud">
                No crafting skills with talent points assigned.
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Extra Training */}
      <Card variant="default">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2
              style={{
                color: 'var(--color-white)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              Extra Training
            </h2>
            <span style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
              {Math.floor((character.modulePoints?.total || 0) / 10)} available
              (1 per 10 module points)
            </span>
          </div>
        </CardHeader>
        <CardBody>
          <p style={{ color: 'var(--color-cloud)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Through dedicated practice and experience, you can improve specific skills. Each skill
            can only be selected once.
          </p>

          <ExtraTrainingManager
            characterId={character._id || ''}
            modulePoints={character.modulePoints || { total: 0, spent: 0 }}
            traits={traits}
            onTraitsUpdate={handleTraitsUpdate}
          />
        </CardBody>
      </Card>

      {/* Music Skills */}
      <Card variant="default">
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Music Skills
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(musicSkills).map(([skillName, skillValue]) => (
              <div
                key={skillName}
                className="flex justify-between items-center p-3 bg-dark-elevated rounded-lg"
              >
                <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                  {skillName.charAt(0).toUpperCase() + skillName.slice(1)}
                </div>
                <MusicTalentDisplay
                  talent={skillValue}
                  maxTalent={3}
                  size="md"
                  onChange={(newValue) => handleMusicSkillChange(skillName, newValue)}
                />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Language Skills */}
      <Card variant="default">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2
              style={{
                color: 'var(--color-white)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              Language Skills
            </h2>
            {!isAddingLanguage && (
              <button
                onClick={() => setIsAddingLanguage(true)}
                className="px-3 py-1 bg-dark-elevated hover:bg-dark-border rounded text-white text-sm transition-colors"
              >
                Add Language
              </button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {isAddingLanguage && (
            <div className="mb-4 p-3 bg-dark-elevated rounded-lg">
              <div className="flex gap-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-dark-surface text-white rounded border border-dark-border focus:outline-none focus:border-sat-purple"
                >
                  <option value="">Select a language...</option>
                  {availableLanguages
                    .filter((lang) => !languageSkills[lang.id])
                    .map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                </select>
                <button
                  onClick={handleAddLanguage}
                  disabled={!selectedLanguage}
                  className="px-4 py-2 bg-sat-purple hover:bg-sat-purple/80 disabled:bg-dark-border disabled:cursor-not-allowed rounded text-white transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingLanguage(false);
                    setSelectedLanguage('');
                  }}
                  className="px-4 py-2 bg-dark-border hover:bg-sunset/20 rounded text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(languageSkills).length > 0 ? (
              Object.entries(languageSkills).map(([languageId, proficiency]) => {
                const language = availableLanguages.find((l) => l.id === languageId);
                return (
                  <div
                    key={languageId}
                    className="flex justify-between items-center p-3 bg-dark-elevated rounded-lg"
                  >
                    <div>
                      <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                        {language?.name || languageId}
                      </div>
                      {language?.description && (
                        <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
                          {language.description}
                        </div>
                      )}
                    </div>
                    <MusicTalentDisplay
                      talent={proficiency}
                      maxTalent={3}
                      size="md"
                      onChange={(newValue) => handleLanguageSkillChange(languageId, newValue)}
                    />
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center p-4 text-cloud">
                No languages learned. Click "Add Language" to get started.
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default InfoTab;
