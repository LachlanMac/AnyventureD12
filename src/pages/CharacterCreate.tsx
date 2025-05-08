import React, { useState,useEffect  } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

// Import creator components
import StepIndicator from '../components/character/creator/StepIndicator';
import BasicInfoTab from '../components/character/creator/BasicInfoTab';
import AttributesTab from '../components/character/creator/AttributesTab';
import TalentsTab from '../components/character/creator/TalentsTab';
import TraitsCreatorTab from '../components/character/creator/TraitsCreatorTab';
import BackgroundCreatorTab from '../components/character/creator/BackgroundCreatorTab';

// Type definitions
interface Trait {
  _id: string;
  name: string;
  type: 'positive' | 'negative';
  description: string;
}


// Specialized skills that don't depend on attributes
const SPECIALIZED_SKILLS = [
  { id: 'rangedWeapons', name: 'Ranged Weapons', defaultTalent: 1 },
  { id: 'meleeWeapons', name: 'Melee Weapons', defaultTalent: 1 },
  { id: 'weaponSystems', name: 'Weapon Systems', defaultTalent: 0 },
  { id: 'heavyRangedWeapons', name: 'Heavy Ranged Weapons', defaultTalent: 0 },
];

// Crafting skills
const CRAFTING_SKILLS = [
  { id: 'engineering', name: 'Engineering' },
  { id: 'fabrication', name: 'Fabrication' },
  { id: 'biosculpting', name: 'Biosculpting' },
  { id: 'synthesis', name: 'Synthesis' },
];

// Skill mappings by attribute category
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

interface RacialModule {
  _id: string;
  name: string;
  mtype: string;
  options: {
    name: string;
    description: string;
    location: string;
    data: string;
  }[];
}

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
  const [selectedRacialModule, setSelectedRacialModule] = useState<RacialModule | null>(null);

  // Define steps
  const steps = ['Basic Info', 'Attributes', 'Talents', 'Traits', 'Background'];

  // Initialize skills for each attribute
  const initializeSkills = () => {
    const skills: Record<string, { value: number; talent: number }> = {};

    Object.values(ATTRIBUTE_SKILLS).forEach((skillGroup) => {
      skillGroup.forEach((skill) => {
        skills[skill.id] = { value: 0, talent: 0 }; 
      });
    });

    return skills;
  };

  // Initialize weapon skills
  const initializeWeaponSkills = () => {
    const weaponSkills: Record<string, { value: number; talent: number }> = {};

    SPECIALIZED_SKILLS.forEach((skill) => {
      weaponSkills[skill.id] = { value: 0, talent: skill.defaultTalent }; // Start with 1d4 and default talent
    });

    return weaponSkills;
  };

  // Initialize crafting skills
  const initializeCraftingSkills = () => {
    const craftingSkills: Record<string, { value: number; talent: number }> = {};

    CRAFTING_SKILLS.forEach((skill) => {
      craftingSkills[skill.id] = { value: 0, talent: 0 }; // Start with 1d4 and 0 talent
    });

    return craftingSkills;
  };

  // Character state
  const [character, setCharacter] = useState({
    name: '',
    race: '',
    modulePoints: {
      total: 10,
      spent: 0,
    },
    attributes: {
      physique: 1,
      agility: 1,
      mind: 1,
      knowledge: 1,
      social: 1,
    },
    skills: initializeSkills(),
    weaponSkills: initializeWeaponSkills(),
    craftingSkills: initializeCraftingSkills(),
    level: 1,
    physicalTraits: {
      size: '',
      weight: '',
      height: '',
      gender: '',
    },
    biography: '',
    appearance: '',
    characterCreation: {
      attributePointsRemaining: 5,
      talentStarsRemaining: 5,
    },
    // For testing, hardcode a userId - in a real app this would come from auth
    userId: 'test-user-id',
  });


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


  const handleRaceChange = (raceName: string, racialModule: RacialModule) => {
    console.log("handleRaceChange called with:", raceName);
    console.log("Received racial module:", racialModule);
    
    // Update the race in character state
    updateCharacter('race', raceName);
    
    // Store the racial module directly
    setSelectedRacialModule(racialModule);
  };

  // Update basic character field
  const updateCharacter = (field: string, value: any) => {
    setCharacter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedField = (objectName: string, field: string, value: any) => {
    setCharacter((prev) => {
      const nested = prev[objectName as keyof typeof prev];
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
  const updateAttribute = (attribute: string, newValue: number) => {
    const oldValue = character.attributes[attribute as keyof typeof character.attributes];
    const pointDifference = oldValue - newValue;

    // Check if there are enough points and if the value is within bounds
    if (attributePointsRemaining + pointDifference < 0) {
      // Not enough points
      return;
    }

    if (newValue < 1 || newValue > 3) {
      // Outside valid range
      return;
    }

    // Update the attribute
    const newAttributes = {
      ...character.attributes,
      [attribute]: newValue,
    };

    // Update skills talent based on new attribute value
    const newSkills = { ...character.skills };

    // Update the talent for all skills in this attribute group
    if (ATTRIBUTE_SKILLS[attribute as keyof typeof ATTRIBUTE_SKILLS]) {
      ATTRIBUTE_SKILLS[attribute as keyof typeof ATTRIBUTE_SKILLS].forEach((skill) => {
        newSkills[skill.id] = {
          ...newSkills[skill.id],
          talent: newValue, // Attribute value determines talent for related skills
        };
      });
    }

    setCharacter((prev) => ({
      ...prev,
      attributes: newAttributes,
      skills: newSkills,
    }));

    setAttributePointsRemaining((prev) => prev + pointDifference);
  };

  // Update specialized skill talent
  const updateSpecializedSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 3) {
      return; // Invalid value
    }

    const oldTalent = character.weaponSkills[skillId as keyof typeof character.weaponSkills].talent;
    const starDifference = oldTalent - newTalent;

    if (talentStarsRemaining + starDifference < 0) {
      // Not enough talent stars
      return;
    }

    setCharacter((prev) => ({
      ...prev,
      weaponSkills: {
        ...prev.weaponSkills,
        [skillId]: {
          ...prev.weaponSkills[skillId as keyof typeof prev.weaponSkills],
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

    const oldTalent =
      character.craftingSkills[skillId as keyof typeof character.craftingSkills].talent;
    const starDifference = oldTalent - newTalent;

    if (talentStarsRemaining + starDifference < 0) {
      // Not enough talent stars
      return;
    }

    setCharacter((prev) => ({
      ...prev,
      craftingSkills: {
        ...prev.craftingSkills,
        [skillId]: {
          ...prev.craftingSkills[skillId as keyof typeof prev.craftingSkills],
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

      // Transform the character data for the API
      const characterData = {
        name: character.name,
        race: character.race,
        attributes: character.attributes,
        skills: character.skills,
        weaponSkills: character.weaponSkills,
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
                modulePoints={character.modulePoints.total}
                onNameChange={(name) => updateCharacter('name', name)}
                onRaceChange={handleRaceChange}
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
                craftingSkills={character.craftingSkills}
                talentStarsRemaining={talentStarsRemaining}
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