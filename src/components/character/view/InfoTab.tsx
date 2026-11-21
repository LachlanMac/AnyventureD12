import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import MusicTalentDisplay from '../MusicTalentDisplay';
import { Character, Language } from '../../../types/character';
import SkillsOverview from '../SkillsOverview';

interface InfoTabProps {
  character: Character;
  canEdit?: boolean;
}

const InfoTab: React.FC<InfoTabProps> = ({ character, canEdit = true }) => {
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
      <SkillsOverview character={character} />

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
                  onChange={canEdit ? (newValue) => handleMusicSkillChange(skillName, newValue) : undefined}
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
            {canEdit && !isAddingLanguage && (
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
          {canEdit && isAddingLanguage && (
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
                      onChange={canEdit ? (newValue) => handleLanguageSkillChange(languageId, newValue) : undefined}
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
