import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
import {
  Character,
  Ancestry,
  Culture,
  Attributes,
  Module,
} from '../types/character';

const CharacterEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);

  // Tracking for attribute and talent points
  const [attributePointsRemaining, setAttributePointsRemaining] = useState<number>(0);
  const [startingTalents, setStartingTalents] = useState<number>(8);
  const [talentStarsRemaining, setTalentStarsRemaining] = useState<number>(0);
  const [_ancestries, setAncestries] = useState<Ancestry[]>([]);
  const [_cultures, setCultures] = useState<Culture[]>([]);
  const [selectedAncestry, setSelectedAncestry] = useState<Ancestry | null>(null);
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string>('');
  const [selectedPersonalityModule, setSelectedPersonalityModule] = useState<Module | null>(null);
  const [stressors, setStressors] = useState<string[]>([]);
  
  // Track invested points to prevent going negative
  const [investedTalentStars, setInvestedTalentStars] = useState<number>(0);
  
  // Define steps
  const steps = ['Basic Info', 'Attributes', 'Talents', 'Personality', 'Background'];

  // Initialize character state using the utility function
  const [character, setCharacter] = useState<Character>(createDefaultCharacter(''));

  // Load existing character data
  useEffect(() => {
    const loadCharacterData = async () => {
      try {
        setInitialLoading(true);
        
        // Fetch the character data
        const charResponse = await fetch(`/api/characters/${id}`);
        if (!charResponse.ok) {
          throw new Error('Failed to fetch character');
        }
        const charData = await charResponse.json();
        
        // Set the character state with the loaded data
        setCharacter(charData);
        
        // Calculate attribute points remaining
        const totalAttributePoints = 6 + (charData.additionalAttributePoints || 0);
        const spentAttributePoints = Object.values(charData.attributes as Attributes).reduce(
          (sum: number, val: number) => sum + (val - 1), 0
        );
        setAttributePointsRemaining(totalAttributePoints - spentAttributePoints);
        
        // Calculate talent stars remaining
        const baseTalentPoints = 8;
        const bonusTalentPoints = charData.additionalTalentPoints || 0;
        const totalTalentPoints = baseTalentPoints + bonusTalentPoints;
        let spentTalentPoints = 0;
        
        // Count spent talent points from weapon skills (excluding free talents)
        const freeWeaponTalents: { [key: string]: number } = {
          'unarmed': 1,
          'throwing': 1,
          'simpleRangedWeapons': 1,
          'simpleMeleeWeapons': 1
        };
        
        if (charData.weaponSkills) {
          Object.entries(charData.weaponSkills).forEach(([skillId, skill]: [string, any]) => {
            if (skill && typeof skill.talent === 'number' && skill.talent > 0) {
              // Only count talents that exceed the free amount
              const freeTalents = freeWeaponTalents[skillId] || 0;
              if (skill.talent > freeTalents) {
                spentTalentPoints += (skill.talent - freeTalents);
              }
            }
          });
        }
        
        // Count spent talent points from magic skills
        if (charData.magicSkills) {
          Object.values(charData.magicSkills).forEach((skill: any) => {
            if (skill && typeof skill.talent === 'number' && skill.talent > 0) {
              spentTalentPoints += skill.talent;
            }
          });
        }
        
        // Count spent talent points from crafting skills
        if (charData.craftingSkills) {
          Object.values(charData.craftingSkills).forEach((skill: any) => {
            if (skill && typeof skill.talent === 'number' && skill.talent > 0) {
              spentTalentPoints += skill.talent;
            }
          });
        }
        
        
        setInvestedTalentStars(spentTalentPoints);
        setStartingTalents(totalTalentPoints);
        setTalentStarsRemaining(totalTalentPoints - spentTalentPoints);
        
        
        // Set selected race/culture/personality
        if (charData.culture) {
          setSelectedCulture(charData.culture);
        }
        if (charData.stressors) {
          setStressors(charData.stressors);
        }
        
        // Find and set personality module from character's modules
        if (charData.modules && Array.isArray(charData.modules)) {
          // Fetch personality modules to find which one the character has
          try {
            const personalityModulesResponse = await fetch('/api/modules?type=personality');
            if (personalityModulesResponse.ok) {
              const personalityModules = await personalityModulesResponse.json();
              
              // Find which personality module the character has
              for (const charModule of charData.modules) {
                const personalityModule = personalityModules.find((pm: any) => 
                  pm._id === charModule.moduleId || pm._id === charModule.moduleId._id
                );
                
                if (personalityModule) {
                  setSelectedPersonality(personalityModule.name);
                  setSelectedPersonalityModule(personalityModule);
                  break;
                }
              }
            }
          } catch (err) {
            console.error('Error fetching personality modules:', err);
          }
        }
        
        // Fetch ancestries and cultures for dropdowns
        const ancestryResponse = await fetch('/api/ancestries');
        if (!ancestryResponse.ok) {
          throw new Error('Failed to fetch ancestries');
        }
        const ancestryData = await ancestryResponse.json();
        setAncestries(ancestryData);
        
        // Find and set the selected ancestry with subchoice selections
        if (charData.race) {
          const ancestry = ancestryData.find((a: Ancestry) => a.name === charData.race);
          if (ancestry) {
            // If we have saved ancestry data with subchoices, apply them
            if (charData.ancestry && charData.ancestry.selectedOptions) {
              const ancestryWithSubchoices = {
                ...ancestry,
                options: ancestry.options.map((option: any) => {
                  const savedOption = charData.ancestry.selectedOptions.find(
                    (saved: any) => saved.name === option.name
                  );
                  return {
                    ...option,
                    selectedSubchoice: savedOption?.selectedSubchoice || undefined
                  };
                })
              };
              setSelectedAncestry(ancestryWithSubchoices);
            } else {
              setSelectedAncestry(ancestry);
            }
          }
        }

        const cultureResponse = await fetch('/api/cultures');
        if (!cultureResponse.ok) {
          throw new Error('Failed to fetch cultures');
        }
        const cultureData = await cultureResponse.json();
        setCultures(cultureData);
        
        // Find and set the selected culture
        if (charData.culture) {
          const culture = cultureData.find((c: Culture) => c.name === charData.culture);
          if (culture) {
            setSelectedCulture(culture);
          }
        }
        
        setInitialLoading(false);
      } catch (err) {
        console.error('Error loading character data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load character');
        setInitialLoading(false);
      }
    };

    if (id) {
      loadCharacterData();
    }
  }, [id]);

  const handleCultureChange = (cultureName: string, culture: Culture) => {
    updateCharacter('culture', cultureName);
    setSelectedCulture(culture);
  };
  
  const handlePersonalitySelect = (personalityName: string, personalityModule: Module) => {
    setSelectedPersonality(personalityName);
    setSelectedPersonalityModule(personalityModule);
    setStressors(personalityModule.stressors || []);
  };

  const handleRaceChange = (raceName: string, ancestry: Ancestry) => {
    updateCharacter('race', raceName);
    setSelectedAncestry(ancestry);
  };

  // Update basic character field
  const updateCharacter = (field: keyof Character, value: any) => {
    setCharacter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update attributes with validation
  const updateAttribute = (attribute: keyof Attributes, newValue: number) => {
    const currentValue = character.attributes[attribute];
    const change = newValue - currentValue;

    if (newValue < 1 || newValue > 6) {
      return;
    }

    if (change > 0 && attributePointsRemaining <= 0) {
      return;
    }

    if (change < 0 && attributePointsRemaining >= 6) {
      return;
    }

    setCharacter((prev) => {
      const updatedCharacter = {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attribute]: newValue,
        },
      };
      return updateSkillTalentsFromAttributes(updatedCharacter);
    });

    setAttributePointsRemaining((prev) => prev - change);
  };

  // Update weapon skill talent
  const updateWeaponSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 4) {
      return;
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
      return;
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
      return;
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
        // Check if all talent stars have been spent
        if (talentStarsRemaining > 0) {
          setError(`You still have ${talentStarsRemaining} talent stars to assign`);
          return false;
        }
        return true;
      case 4:
        if (!selectedPersonality && !character.stressors?.length) {
          setError('Please select a personality for your character');
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
    // Prevent reducing below invested amount
    if (newStartingTalents < investedTalentStars) {
      setError(`Cannot reduce talent points below ${investedTalentStars} (already invested)`);
      return;
    }
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
      // Prepare ancestry data (all 3 options are automatically selected)
      const ancestryData = selectedAncestry ? {
        ancestryId: selectedAncestry._id,
        selectedOptions: selectedAncestry.options.map(option => ({
          name: option.name,
          selectedSubchoice: option.selectedSubchoice || null
        }))
      } : null;
      
      // Prepare culture data (all 3 options are automatically selected)
      const cultureData = selectedCulture ? {
        cultureId: selectedCulture._id,
        selectedOptions: selectedCulture.options.map(option => option.name)
      } : null;

      // Handle module updates - keep all existing modules except personality
      let updatedModules = [];
      let modulePointRefund = 0;
      
      // First, get all personality module IDs and their data to filter them out
      const personalityModulesMap = new Map();
      try {
        const personalityModulesResponse = await fetch('/api/modules?type=personality');
        if (personalityModulesResponse.ok) {
          const personalityModules = await personalityModulesResponse.json();
          personalityModules.forEach((pm: any) => {
            personalityModulesMap.set(pm._id, pm);
          });
        }
      } catch (err) {
        console.error('Error fetching personality modules:', err);
      }
      
      // Keep all non-personality modules from the character and calculate refund
      
      if (character.modules && Array.isArray(character.modules)) {
        character.modules.forEach((module: any) => {
          // Handle nested module structure - the actual module data might be in module.moduleId
          const moduleData = module.moduleId || module;
          const moduleId = moduleData._id || moduleData;
          
          // Check if this is a personality module
          const personalityModule = personalityModulesMap.get(moduleId);
          if (personalityModule) {
            // Calculate refund for the old personality module
            if (module.selectedOptions && Array.isArray(module.selectedOptions)) {
              module.selectedOptions.forEach((selectedOption: any) => {
                // Find the option in the module to get its cost
                const moduleOption = personalityModule.options.find(
                  (opt: any) => opt.location === selectedOption.location
                );
                if (moduleOption) {
                  // All module options cost 1 point (except tier 1 which is free)
                  const cost = selectedOption.location === '1' ? 0 : 1;
                  if (cost > 0) {
                    modulePointRefund += cost;
                  }
                }
              });
            }
          } else {
            // Keep non-personality modules
            updatedModules.push(module);
          }
        });
      }
      
      
      // Add the newly selected personality module
      if (selectedPersonalityModule) {
        const tier1Option = selectedPersonalityModule.options.find(
          (option) => option.location === '1'
        );

        if (tier1Option) {
          updatedModules.push({
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
        race: character.race,
        culture: character.culture,
        ancestry: ancestryData,
        characterCulture: cultureData,
        attributes: character.attributes,
        skills: character.skills,
        weaponSkills: character.weaponSkills,
        magicSkills: character.magicSkills,
        craftingSkills: character.craftingSkills,
        modulePoints: {
          total: character.modulePoints.total,
          spent: Math.max(0, (character.modulePoints.spent || 0) - modulePointRefund)
        },
        level: character.level,
        biography: character.biography,
        appearance: character.appearance,
        physicalTraits: character.physicalTraits,
        stressors: stressors.length > 0 ? stressors : character.stressors,
        characterCreation: {
          attributePointsRemaining: attributePointsRemaining,
          talentStarsRemaining: talentStarsRemaining,
        },
        modules: updatedModules,
      };

      const response = await fetch(`/api/characters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(characterData),
      });

      if (!response.ok) {
        throw new Error('Failed to update character');
      }

      await response.json();

      // Now upload portrait if one was selected
      if (portraitFile) {
        try {
          const formData = new FormData();
          formData.append('portrait', portraitFile);

          const portraitResponse = await fetch(`/api/portraits/${id}/portrait`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          if (!portraitResponse.ok) {
            console.warn('Failed to upload portrait, but character was updated');
          }
        } catch (portraitErr) {
          console.error('Error uploading portrait:', portraitErr);
        }
      }

      // Redirect to character view
      navigate(`/characters/${id}`);
    } catch (err) {
      console.error('Error updating character:', err);
      setError(err instanceof Error ? err.message : 'Failed to update character');
      setIsLoading(false);
    }
  };

  // Loading state
  if (initialLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <div className="loading-spinner" style={{ marginBottom: '1rem' }}></div>
        <div style={{ color: 'var(--color-cloud)' }}>Loading character data...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            color: 'var(--color-metal-gold)',
            fontSize: '2rem',
            fontWeight: 'bold',
          }}
        >
          Edit Character
        </h1>
        <Link to={`/characters/${id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={step} steps={steps} />

      {/* Error Message */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(152, 94, 109, 0.2)',
            border: '1px solid var(--color-stormy)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
            color: 'var(--color-white)',
          }}
        >
          {error}
        </div>
      )}

      {/* Content */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--color-white)',
            }}
          >
            {steps[step - 1]}
          </h2>
        </CardHeader>
        <CardBody>
          {step === 1 && (
            <BasicInfoTab
              name={character.name}
              race={character.race}
              culture={character.culture}
              startingTalents={startingTalents}
              onNameChange={(name) => updateCharacter('name', name)}
              onRaceChange={handleRaceChange}
              onCultureChange={handleCultureChange}
              onStartingTalentsChange={handleStartingTalentsChange}
              hideModulePoints={true}
            />
          )}
          {step === 2 && (
            <AttributesTab
              attributes={character.attributes}
              attributePointsRemaining={attributePointsRemaining}
              onUpdateAttribute={updateAttribute}
            />
          )}
          {step === 3 && (
            <TalentsTab
              weaponSkills={character.weaponSkills}
              magicSkills={character.magicSkills}
              craftingSkills={character.craftingSkills}
              talentStarsRemaining={talentStarsRemaining}
              onUpdateSpecializedSkillTalent={updateWeaponSkillTalent}
              onUpdateMagicSkillTalent={updateMagicSkillTalent}
              onUpdateCraftingSkillTalent={updateCraftingSkillTalent}
            />
          )}
          {step === 4 && (
            <PersonalityCreatorTab
              selectedPersonality={selectedPersonality || ''}
              stressors={stressors}
              onSelectPersonality={handlePersonalitySelect}
            />
          )}
          {step === 5 && (
            <BackgroundCreatorTab
              physicalTraits={character.physicalTraits || { height: '', weight: '', gender: '' }}
              appearance={character.appearance || ''}
              biography={character.biography || ''}
              name={character.name}
              race={character.race}
              culture={character.culture}
              modulePoints={character.modulePoints || { total: 0, spent: 0 }}
              attributes={character.attributes}
              portraitFile={portraitFile}
              onUpdatePhysicalTrait={(trait, value) => {
                updateCharacter('physicalTraits', {
                  ...character.physicalTraits,
                  [trait]: value
                });
              }}
              onUpdateAppearance={(value) => updateCharacter('appearance', value)}
              onUpdateBiography={(value) => updateCharacter('biography', value)}
              onUpdatePortrait={handlePortraitUpdate}
            />
          )}
        </CardBody>
      </Card>

      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {step < steps.length ? (
            <Button variant="primary" onClick={handleNextStep}>
              Next
            </Button>
          ) : (
            <Button
              variant="accent"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Character'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterEdit;