import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import StepIndicator from '../components/character/creator/StepIndicator';
import BasicInfoTab from '../components/character/creator/BasicInfoTab';
import AttributesTab from '../components/character/creator/AttributesTab';
import TalentsTab from '../components/character/creator/TalentsTab';
import TraitsCreatorTab from '../components/character/creator/TraitsCreatorTab';
import BackgroundCreatorTab from '../components/character/creator/BackgroundCreatorTab';

// Import utility functions and types from the shared files
import { 
  createDefaultCharacter, 
  updateSkillTalentsFromAttributes
} from '../utils/characterUtils';
import { 
  Character, 
  Trait, 
  RacialModule, 
  CultureModule,
  Attributes 
} from '../types/character';

const CharacterCreate: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<Trait[]>([]);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  
  // Tracking for attribute and talent points
  const [attributePointsRemaining, setAttributePointsRemaining] = useState<number>(5);
  const [talentStarsRemaining, setTalentStarsRemaining] = useState<number>(5);
  const [racialModules, setRacialModules] = useState<RacialModule[]>([]);
  const [cultureModules, setCultureModules] = useState<CultureModule[]>([]);
  const [selectedRacialModule, setSelectedRacialModule] = useState<RacialModule | null>(null);
  const [selectedCultureModule, setSelectedCultureModule] = useState<CultureModule | null>(null);

  // Define steps
  const steps = ['Basic Info', 'Attributes', 'Talents', 'Traits', 'Background'];

  // Initialize character state using the utility function
  const [character, setCharacter] = useState<Character>(createDefaultCharacter('test-user-id'));

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const raceResponse = await fetch('/api/modules/type/racial');
        if (!raceResponse.ok) {
          throw new Error('Failed to fetch racial modules');
        }
        const raceData = await raceResponse.json();
        setRacialModules(raceData);
        
        // Add culture modules fetching
        const cultureResponse = await fetch('/api/modules/type/cultural');
        if (!cultureResponse.ok) {
          throw new Error('Failed to fetch culture modules');
        }
        const cultureData = await cultureResponse.json();
        setCultureModules(cultureData);
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    };
  
    fetchModules();
  }, []);
  

  useEffect(() => {
    const fetchRacialModules = async () => {
      try {
        const response = await fetch('/api/modules/type/racial');
        if (!response.ok) {
          throw new Error('Failed to fetch racial modules');
        }
        const data = await response.json();
        setRacialModules(data);
      } catch (err) {
        console.error('Error fetching racial modules:', err);
        // Handle error appropriately
      }
    };
  
    fetchRacialModules();
  }, []);

  const handleCultureChange = (cultureName: string, cultureModule: CultureModule) => {
    updateCharacter('culture', cultureName);
    setSelectedCultureModule(cultureModule);
  };

  const handleRaceChange = (raceName: string, racialModule: RacialModule) => {
    console.log("handleRaceChange called with:", raceName);
    console.log("Received racial module:", racialModule);
    
    // Update the race in character state
    updateCharacter('race', raceName);
    
    // Store the racial module directly
    setSelectedRacialModule(racialModule);
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
    if (newTalent < 0 || newTalent > 3) {
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
          ...prev.weaponSkills[skillId] || { value: 0 },
          talent: newTalent,
        },
      },
    }));

    setTalentStarsRemaining((prev) => prev + starDifference);
  };

  // Update magic skill talent
  const updateMagicSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 3) {
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
          ...prev.magicSkills[skillId] || { value: 0 },
          talent: newTalent,
        },
      },
    }));

    setTalentStarsRemaining((prev) => prev + starDifference);
  };

  // Update crafting skill talent
  const updateCraftingSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 3) {
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
          ...prev.craftingSkills[skillId] || { value: 0 },
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
        // Check if exactly 3 traits are selected
        if (selectedTraits.length !== 3) {
          setError(
            `You must select exactly 3 traits. Currently selected: ${selectedTraits.length}`
          );
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

  const handleSelectTrait = (trait: Trait) => {
    setSelectedTraits((prev) => [...prev, trait]);

    // If it's a positive trait, deduct a module point
    if (trait.type === 'positive') {
      updateNestedField('modulePoints', 'spent', character.modulePoints.spent + 1);
    }
  };

  const handleDeselectTrait = (traitId: string) => {
    // Find the trait before removing it
    const trait = selectedTraits.find((t) => t._id === traitId);

    // Remove the trait
    setSelectedTraits((prev) => prev.filter((t) => t._id !== traitId));

    // If it was a positive trait, refund the module point
    if (trait && trait.type === 'positive') {
      updateNestedField('modulePoints', 'spent', character.modulePoints.spent - 1);
    }
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
      console.log('Sending character data:', character);
      let initialModules = [];
      if (selectedRacialModule) {
        // Find the tier 1 option of the racial module
        const tier1Option = selectedRacialModule.options.find(option => option.location === '1');
        
        if (tier1Option) {
          initialModules.push({
            moduleId: selectedRacialModule._id,
            selectedOptions: [{
              location: '1',
              selectedAt: new Date().toISOString()
            }]
          });
        }
      }
      if (selectedCultureModule) {
        const tier1Option = selectedCultureModule.options.find(option => option.location === '1');
        
        if (tier1Option) {
          initialModules.push({
            moduleId: selectedCultureModule._id,
            selectedOptions: [{
              location: '1',
              selectedAt: new Date().toISOString()
            }]
          });
        }
      }
      // Transform the character data for the API
      const characterData = {
        name: character.name,
        race: character.race,
        culture: character.culture, 
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
        modules: initialModules,
        characterCreation: {
          attributePointsRemaining: attributePointsRemaining,
          talentStarsRemaining: talentStarsRemaining,
        },
        traits: selectedTraits.map((trait) => ({
          traitId: trait._id,
          name: trait.name,
          type: trait.type,
          description: trait.description,
        })),
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
        console.log('NOT OK');
        throw new Error('Failed to create character');
      }
      
      const data = await response.json();
      console.log('Character created:', data);
      
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
            console.warn('Failed to upload portrait, but character was created');
          }
        } catch (portraitErr) {
          console.error('Error uploading portrait:', portraitErr);
          // Continue to character page even if portrait upload fails
        }
      }

      // Redirect to character sheet
      navigate(`/characters/${data._id}`);
    } catch (err) {
      console.error('Error creating character:', err);
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
                onNameChange={(name) => updateCharacter('name', name)}
                onRaceChange={handleRaceChange}
                onCultureChange={handleCultureChange}
                onModulePointsChange={(points) => {
                  updateNestedField('modulePoints', 'total', points);
                  updateCharacter('level', Math.floor(points / 10));
                }}
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

            {/* Step 3: Talents */}
            {step === 3 && (
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

            {/* Step 4: Traits */}
            {step === 4 && (
              <TraitsCreatorTab 
                selectedTraits={selectedTraits}
                availableModulePoints={character.modulePoints.total - character.modulePoints.spent}
                onSelectTrait={handleSelectTrait}
                onDeselectTrait={handleDeselectTrait}
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
                level={character.level}
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