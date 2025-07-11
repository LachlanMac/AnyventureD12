import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import StepIndicator from '../components/character/creator/StepIndicator';
import BasicInfoTab from '../components/character/creator/BasicInfoTab';
import AttributesTab from '../components/character/creator/AttributesTab';
import TalentsTab from '../components/character/creator/TalentsTab';
import BackgroundCreatorTab from '../components/character/creator/BackgroundCreatorTab';
import PersonalityCreatorTab from '../components/character/creator/PersonalityCreatorTab';

// Import utility functions and types from the shared files
import { createDefaultCharacter, updateSkillTalentsFromAttributes } from '../utils/characterUtils';
import { Character, Ancestry, Culture, Attributes, Module } from '../types/character';

const CharacterCreate: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);

  // Tracking for attribute and talent points
  const [attributePointsRemaining, setAttributePointsRemaining] = useState<number>(6);
  const [startingTalents, setStartingTalents] = useState<number>(8);
  const [talentStarsRemaining, setTalentStarsRemaining] = useState<number>(8);
  const [_ancestries, setAncestries] = useState<Ancestry[]>([]);
  const [_cultures, setCultures] = useState<Culture[]>([]);
  const [selectedAncestry, setSelectedAncestry] = useState<Ancestry | null>(null);
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string>('');
  const [selectedPersonalityModule, setSelectedPersonalityModule] = useState<Module | null>(null);
  const [stressors, setStressors] = useState<string[]>([]);
  const [selectedTrait, setSelectedTrait] = useState<string>('');
  const [traitTalentBonus, setTraitTalentBonus] = useState<number>(0);
  // Define steps
  const steps = ['Basic Info', 'Attributes', 'Personality & Trait', 'Talents', 'Background'];

  // Initialize character state using the utility function
  const [character, setCharacter] = useState<Character>(createDefaultCharacter('test-user-id'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ancestryResponse = await fetch('/api/ancestries');
        if (!ancestryResponse.ok) {
          throw new Error('Failed to fetch ancestries');
        }
        const ancestryData = await ancestryResponse.json();
        setAncestries(ancestryData);

        // Fetch cultures
        const cultureResponse = await fetch('/api/cultures');
        if (!cultureResponse.ok) {
          throw new Error('Failed to fetch cultures');
        }
        const cultureData = await cultureResponse.json();
        setCultures(cultureData);
      } catch (err) {}
    };

    fetchData();
  }, []);

  const handleCultureChange = (cultureName: string, culture: Culture) => {
    updateCharacter('culture', cultureName);
    setSelectedCulture(culture);
  };
  const handlePersonalitySelect = (personalityName: string, personalityModule: Module) => {
    setSelectedPersonality(personalityName);
    setSelectedPersonalityModule(personalityModule);
    setStressors(personalityModule.stressors || []);
  };

  // Handle trait selection and apply talent bonuses
  useEffect(() => {
    const fetchTraitData = async () => {
      // Remove previous trait talent bonus
      if (traitTalentBonus > 0) {
        setTalentStarsRemaining((prev) => prev - traitTalentBonus);
        setTraitTalentBonus(0);
      }

      if (!selectedTrait) {
        return;
      }

      try {
        const response = await fetch(`/api/traits/${selectedTrait}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trait data');
        }
        const traitData = await response.json();

        // Calculate talent point bonus from trait
        let newTalentBonus = 0;
        if (traitData.options) {
          for (const option of traitData.options) {
            if (option.data && option.data.includes('TP=')) {
              const match = option.data.match(/TP=(\d+)/);
              if (match) {
                newTalentBonus += parseInt(match[1]) || 0;
              }
            }
          }
        }

        // Apply the new talent bonus
        if (newTalentBonus > 0) {
          setTalentStarsRemaining((prev) => prev + newTalentBonus);
          setTraitTalentBonus(newTalentBonus);
        }
      } catch (error) {
        console.error('Error fetching trait data:', error);
      }
    };

    fetchTraitData();
  }, [selectedTrait]);

  // Monitor selectedAncestry changes
  useEffect(() => {
    if (selectedAncestry) {
    }
  }, [selectedAncestry]);

  const handleRaceChange = (raceName: string, ancestry: Ancestry) => {
    // Update the race in character state
    updateCharacter('race', raceName);

    // Store the ancestry directly
    setSelectedAncestry(ancestry);
  };

  // Update basic character field
  const updateCharacter = (field: keyof Character, value: any) => {
    setCharacter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedField = (objectName: keyof Character, field: string, value: any) => {
    setCharacter((prev) => {
      const nested = prev[objectName];
      return {
        ...prev,
        [objectName]: {
          ...(typeof nested === 'object' && nested !== null ? nested : {}),
          [field]: value,
        },
      };
    });
  };

  // Update an attribute
  const updateAttribute = (attribute: keyof Attributes, newValue: number) => {
    const oldValue = character.attributes[attribute];
    const pointDifference = oldValue - newValue;

    // Check if there are enough points and if the value is within bounds
    if (attributePointsRemaining + pointDifference < 0) {
      // Not enough points
      return;
    }

    if (newValue < 1 || newValue > 4) {
      // Outside valid range
      return;
    }

    // Update the attribute
    const updatedCharacter = {
      ...character,
      attributes: {
        ...character.attributes,
        [attribute]: newValue,
      },
    };

    // Update skills' talent values based on the new attribute value
    const characterWithUpdatedSkills = updateSkillTalentsFromAttributes(updatedCharacter);

    setCharacter(characterWithUpdatedSkills);
    setAttributePointsRemaining((prev) => prev + pointDifference);
  };

  // Update specialized skill talent
  const updateSpecializedSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 4) {
      return; // Invalid value
    }

    const oldTalent = character.weaponSkills[skillId]?.talent || 0;
    const starDifference = oldTalent - newTalent;

    if (talentStarsRemaining + starDifference < 0) {
      return;
    }

    setCharacter((prev) => ({
      ...prev,
      weaponSkills: {
        ...prev.weaponSkills,
        [skillId]: {
          ...(prev.weaponSkills[skillId] || { value: 0 }),
          talent: newTalent,
        },
      },
    }));

    setTalentStarsRemaining((prev) => prev + starDifference);
  };

  // Update magic skill talent
  const updateMagicSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 4) {
      return; // Invalid value
    }

    const oldTalent = character.magicSkills[skillId]?.talent || 0;
    const starDifference = oldTalent - newTalent;

    if (talentStarsRemaining + starDifference < 0) {
      return;
    }

    setCharacter((prev) => ({
      ...prev,
      magicSkills: {
        ...prev.magicSkills,
        [skillId]: {
          ...(prev.magicSkills[skillId] || { value: 0 }),
          talent: newTalent,
        },
      },
    }));

    setTalentStarsRemaining((prev) => prev + starDifference);
  };

  // Update crafting skill talent
  const updateCraftingSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 4) {
      return; // Invalid value
    }

    const oldTalent = character.craftingSkills[skillId]?.talent || 0;
    const starDifference = oldTalent - newTalent;

    if (talentStarsRemaining + starDifference < 0) {
      return;
    }

    setCharacter((prev) => ({
      ...prev,
      craftingSkills: {
        ...prev.craftingSkills,
        [skillId]: {
          ...(prev.craftingSkills[skillId] || { value: 0 }),
          talent: newTalent,
        },
      },
    }));

    setTalentStarsRemaining((prev) => prev + starDifference);
  };

  // Validate the current step
  const validateStep = (): boolean => {
    setError(null);

    switch (step) {
      case 1:
        if (!character.name.trim()) {
          setError('Character name is required');
          return false;
        }
        if (!character.race) {
          setError('Please select a race');
          return false;
        }
        if (!character.culture) {
          setError('Please select a culture');
          return false;
        }
        return true;

      case 2:
        // Check if all attribute points have been spent
        if (attributePointsRemaining > 0) {
          setError(`You still have ${attributePointsRemaining} attribute points to spend`);
          return false;
        }
        return true;

      case 3:
        if (!selectedPersonality) {
          setError('Please select a personality for your character');
          return false;
        }
        return true;
      case 4:
        // Check if all talent stars have been spent
        if (talentStarsRemaining > 0) {
          setError(`You still have ${talentStarsRemaining} talent stars to assign`);
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handlePortraitUpdate = (file: File) => {
    setPortraitFile(file);
  };

  const handleStartingTalentsChange = (newStartingTalents: number) => {
    const currentSpentTalents = startingTalents - talentStarsRemaining;
    setStartingTalents(newStartingTalents);
    setTalentStarsRemaining(newStartingTalents - currentSpentTalents);
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      const initialModules = [];

      // Prepare ancestry data (all 3 options are automatically selected)
      const ancestryData = selectedAncestry
        ? {
            ancestryId: selectedAncestry._id,
            selectedOptions: selectedAncestry.options.map((option) => {
              const subchoiceValue = option.selectedSubchoice;
              return {
                name: option.name,
                selectedSubchoice: subchoiceValue !== undefined ? subchoiceValue : null,
              };
            }),
          }
        : null;

      // Prepare culture data (all 3 options are automatically selected)
      const cultureData = selectedCulture
        ? {
            cultureId: selectedCulture._id,
            selectedOptions: selectedCulture.options.map((option) => option.name),
          }
        : null;

      if (selectedPersonalityModule) {
        const tier1Option = selectedPersonalityModule.options.find(
          (option) => option.location === '1'
        );

        if (tier1Option) {
          initialModules.push({
            moduleId: selectedPersonalityModule._id,
            selectedOptions: [
              {
                location: '1',
                selectedAt: new Date().toISOString(),
              },
            ],
          });
        }
      }

      // Transform the character data for the API
      const characterData = {
        name: character.name,
        race: character.race, // Keep for backward compatibility
        culture: character.culture, // Keep for backward compatibility
        ancestry: ancestryData, // New ancestry format
        characterCulture: cultureData, // New culture format
        attributes: character.attributes,
        skills: character.skills,
        weaponSkills: character.weaponSkills,
        magicSkills: character.magicSkills,
        craftingSkills: character.craftingSkills,
        modulePoints: character.modulePoints,
        level: character.level,
        userId: character.userId,
        biography: character.biography,
        appearance: character.appearance,
        physicalTraits: character.physicalTraits,
        stressors: stressors,
        modules: initialModules,
        characterTrait: selectedTrait || undefined,
        characterCreation: {
          attributePointsRemaining: attributePointsRemaining,
          talentStarsRemaining: talentStarsRemaining,
        },
      };

      const response = await fetch(`/api/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(characterData),
      });

      if (!response.ok) {
        throw new Error('Failed to create character');
      }

      const data = await response.json();

      // Now upload portrait if one was selected
      if (portraitFile) {
        try {
          const formData = new FormData();
          formData.append('portrait', portraitFile);

          const portraitResponse = await fetch(`/api/portraits/${data._id}/portrait`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          if (!portraitResponse.ok) {
          }
        } catch (portraitErr) {
          // Continue to character page even if portrait upload fails
        }
      }

      // Check for pending campaign invite
      const pendingInvite = localStorage.getItem('pendingCampaignInvite');
      if (pendingInvite) {
        localStorage.removeItem('pendingCampaignInvite');
        navigate(`/campaigns/join/${pendingInvite}`);
      } else {
        // Redirect to character sheet
        navigate(`/characters/${data._id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          Create Your Character
        </h1>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(152, 94, 109, 0.2)',
              border: '1px solid var(--color-sunset)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: 'var(--color-white)',
            }}
          >
            {error}
          </div>
        )}

        <Card variant="default">
          <CardHeader>
            {/* Step indicators */}
            <StepIndicator currentStep={step} steps={steps} />
          </CardHeader>

          <CardBody>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <BasicInfoTab
                name={character.name}
                race={character.race}
                culture={character.culture}
                modulePoints={character.modulePoints.total}
                startingTalents={startingTalents}
                onNameChange={(name) => updateCharacter('name', name)}
                onRaceChange={handleRaceChange}
                onCultureChange={handleCultureChange}
                onModulePointsChange={(points) => {
                  updateNestedField('modulePoints', 'total', points);
                }}
                onStartingTalentsChange={handleStartingTalentsChange}
              />
            )}

            {/* Step 2: Attributes */}
            {step === 2 && (
              <AttributesTab
                attributes={character.attributes}
                attributePointsRemaining={attributePointsRemaining}
                onUpdateAttribute={updateAttribute}
              />
            )}

            {/* Step 3: Personality & Trait */}
            {step === 3 && (
              <PersonalityCreatorTab
                selectedPersonality={selectedPersonality}
                stressors={stressors}
                selectedTrait={selectedTrait}
                onSelectPersonality={handlePersonalitySelect}
                onSelectTrait={setSelectedTrait}
              />
            )}
            {/* Step 4: Talents */}
            {step === 4 && (
              <TalentsTab
                weaponSkills={character.weaponSkills}
                magicSkills={character.magicSkills}
                craftingSkills={character.craftingSkills}
                talentStarsRemaining={talentStarsRemaining}
                onUpdateMagicSkillTalent={updateMagicSkillTalent}
                onUpdateSpecializedSkillTalent={updateSpecializedSkillTalent}
                onUpdateCraftingSkillTalent={updateCraftingSkillTalent}
              />
            )}
            {/* Step 5: Background */}
            {step === 5 && (
              <BackgroundCreatorTab
                physicalTraits={character.physicalTraits}
                appearance={character.appearance}
                biography={character.biography}
                name={character.name}
                race={character.race}
                culture={character.culture}
                modulePoints={character.modulePoints}
                attributes={character.attributes}
                portraitFile={portraitFile}
                onUpdatePhysicalTrait={(trait, value) =>
                  updateNestedField('physicalTraits', trait, value)
                }
                onUpdateAppearance={(value) => updateCharacter('appearance', value)}
                onUpdateBiography={(value) => updateCharacter('biography', value)}
                onUpdatePortrait={handlePortraitUpdate}
              />
            )}

            {/* Navigation buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '2rem',
              }}
            >
              {step > 1 && (
                <Button variant="secondary" onClick={handlePrevStep}>
                  Previous
                </Button>
              )}

              {step < 5 ? (
                <Button variant="accent" onClick={handleNextStep} style={{ marginLeft: 'auto' }}>
                  Next
                </Button>
              ) : (
                <Button
                  variant="accent"
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  style={{ marginLeft: 'auto' }}
                >
                  Create Character
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
          }}
        >
          <Link
            to="/characters"
            style={{
              color: 'var(--color-metal-gold)',
              textDecoration: 'none',
            }}
          >
            Cancel and return to characters
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreate;
