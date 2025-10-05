import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';

interface CreatureAbility {
  name: string;
  cost: number;
  type: 'attack' | 'spell' | 'utility' | 'movement';
  magic: boolean;
  description: string;
  reaction: boolean;
  basic: boolean;
  attack?: {
    roll: string;
    damage: string;
    damage_extra: string;
    damage_type: string;
    secondary_damage?: string;
    secondary_damage_extra?: string;
    secondary_damage_type?: string;
    category: 'pierce' | 'slash' | 'blunt' | 'ranged';
    min_range: number;
    max_range: number;
  };
  spell?: {
    roll: string;
    damage: string;
    damage_extra: string;
    damage_type: string;
    secondary_damage?: string;
    secondary_damage_extra?: string;
    secondary_damage_type?: string;
    target_defense: 'evasion' | 'deflection' | 'resilience' | 'none';
    defense_difficulty: number;
    min_range: number;
    max_range: number;
    // Full spell fields
    charge?: string;
    duration?: string;
    range?: string;
    school?: 'meta' | 'black' | 'divine' | 'mysticism' | 'primal';
    subschool?: string;
    checkToCast?: number;
    components?: string[];
    ritualDuration?: string;
    concentration?: boolean;
    foundry_icon?: string;
  };
}

interface CreatureTrait {
  name: string;
  description: string;
}

interface SkillValue {
  value: number;
  tier: number;
}

interface SkillSet {
  fitness: SkillValue;
  deflection: SkillValue;
  might: SkillValue;
  endurance: SkillValue;
  evasion: SkillValue;
  stealth: SkillValue;
  coordination: SkillValue;
  thievery: SkillValue;
  resilience: SkillValue;
  concentration: SkillValue;
  senses: SkillValue;
  logic: SkillValue;
  wildcraft: SkillValue;
  academics: SkillValue;
  magic: SkillValue;
  medicine: SkillValue;
  expression: SkillValue;
  presence: SkillValue;
  insight: SkillValue;
  persuasion: SkillValue;
}


const DevCreatureDesigner: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Check if we're in development environment
  const isDev = import.meta.env.DEV;

  // Range mapping helper
  const getRangeOptions = () => [
    { value: 0, label: "Self", description: "Self" },
    { value: 1, label: "Adjacent", description: "Adjacent" },
    { value: 2, label: "Nearby", description: "Nearby (1 unit)" },
    { value: 3, label: "Very Short", description: "Very Short (5 units)" },
    { value: 4, label: "Short", description: "Short (10 units)" },
    { value: 5, label: "Moderate", description: "Moderate (20 units)" },
    { value: 6, label: "Far", description: "Far (40 units)" },
    { value: 7, label: "Very Far", description: "Very Far (60 units)" },
    { value: 8, label: "Distant", description: "Distant (100 units)" },
    { value: 9, label: "Planar", description: "Planar (unlimited)" }
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Redirect if not in development
  useEffect(() => {
    if (!isDev) {
      navigate('/');
      return;
    }
  }, [isDev, navigate]);

  // Basic creature data
  const [creatureData, setCreatureData] = useState({
    name: '',
    description: '',
    tactics: '',
    tier: 'standard' as
      | 'minion'
      | 'grunt'
      | 'standard'
      | 'champion'
      | 'elite'
      | 'legend'
      | 'mythic',
    type: 'humanoid' as
      | 'dark'
      | 'undead'
      | 'divine'
      | 'monster'
      | 'humanoid'
      | 'construct'
      | 'plantoid'
      | 'fey'
      | 'elemental'
      | 'beast',
    size: 'medium' as 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan',
    challenge_rating: 1,
    languages: [] as string[],
    loot: [] as string[],
    foundry_portrait: '',
  });

  // Resources
  const [resources, setResources] = useState({
    health: { max: 15, current: 15 },
    energy: { max: 5, current: 5, recovery: 2 },
    resolve: { max: 5, current: 5, recovery: 1 },
  });

  // Movement system
  const [movement, setMovement] = useState({
    walk: 5,
    climb: 0,
    swim: 0,
    fly: 0,
  });

  // Attributes (talents)
  const [attributes, setAttributes] = useState({
    physique: { talent: 2 },
    finesse: { talent: 2 },
    mind: { talent: 2 },
    knowledge: { talent: 2 },
    social: { talent: 2 },
  });

  // Skills
  const [skills, setSkills] = useState({
    fitness: { value: 0, tier: 0 },
    deflection: { value: 0, tier: 0 },
    might: { value: 0, tier: 0 },
    endurance: { value: 0, tier: 0 },
    evasion: { value: 0, tier: 0 },
    stealth: { value: 0, tier: 0 },
    coordination: { value: 0, tier: 0 },
    thievery: { value: 0, tier: 0 },
    resilience: { value: 0, tier: 0 },
    concentration: { value: 0, tier: 0 },
    senses: { value: 0, tier: 0 },
    logic: { value: 0, tier: 0 },
    wildcraft: { value: 0, tier: 0 },
    academics: { value: 0, tier: 0 },
    magic: { value: 0, tier: 0 },
    medicine: { value: 0, tier: 0 },
    expression: { value: 0, tier: 0 },
    presence: { value: 0, tier: 0 },
    insight: { value: 0, tier: 0 },
    persuasion: { value: 0, tier: 0 },
  });

  // Defenses
  const [mitigation, setMitigation] = useState({
    physical: 0,
    cold: 0,
    heat: 0,
    electric: 0,
    psychic: 0,
    dark: 0,
    divine: 0,
    aether: 0,
    toxic: 0,
  });

  const [detections, setDetections] = useState({
    normal: 5,
    darksight: 0,
    infravision: 0,
    deadsight: 0,
    echolocation: 0,
    tremorsense: 0,
    truesight: 0,
    aethersight: 0,
  });

  // Immunities
  const [immunities, setImmunities] = useState<string[]>([]);

  // Available immunity options
  const immunityOptions = [
    'afraid', 'bleeding', 'blinded', 'charmed', 'confused', 'dazed',
    'diseased', 'exhausted', 'frightened', 'grappled', 'incapacitated',
    'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone',
    'restrained', 'stunned', 'unconscious'
  ];

  // Taming
  const [taming, setTaming] = useState({
    tame_check: -1,
    commands: 'basic' as 'basic' | 'moderate' | 'advanced'
  });

  // Abilities
  const [abilities, setAbilities] = useState<CreatureAbility[]>([]);
  const [traits, setTraits] = useState<CreatureTrait[]>([]);
  const [spellNames, setSpellNames] = useState<string[]>([]);
  const [availableSpells, setAvailableSpells] = useState<any[]>([]);
  const [showSpellSelector, setShowSpellSelector] = useState(false);

  useEffect(() => {
    fetchAvailableSpells();
  }, []);

  // Set energy to 0 when tier is minion or grunt
  useEffect(() => {
    if (creatureData.tier === 'minion' || creatureData.tier === 'grunt') {
      setResources(prev => ({
        ...prev,
        energy: { max: 0, current: 0, recovery: 0 }
      }));
    }
  }, [creatureData.tier]);

  const fetchAvailableSpells = async () => {
    try {
      const response = await fetch('/api/spells');
      if (response.ok) {
        const spells = await response.json();
        setAvailableSpells(spells);
      }
    } catch (err) {
      console.error('Failed to fetch spells:', err);
    }
  };

  const downloadJSON = () => {
    if (!creatureData.name.trim()) {
      showError('Creature name is required');
      return;
    }

    const jsonData = {
      name: creatureData.name,
      description: creatureData.description,
      tactics: creatureData.tactics,
      tier: creatureData.tier,
      type: creatureData.type,
      size: creatureData.size,
      foundry_portrait: creatureData.foundry_portrait || '',
      health: resources.health,
      energy: resources.energy,
      resolve: resources.resolve,
      movement,
      attributes,
      skills,
      mitigation,
      detections: {
        ...detections,
        normal: Math.max(0, Math.min(8, detections.normal)), // Clamp to 0-8
      },
      immunities: immunityOptions.reduce((acc, immunity) => ({
        ...acc,
        [immunity]: immunities.includes(immunity)
      }), {}),
      taming,
      actions: abilities.filter(a => !a.reaction),
      reactions: abilities.filter(a => a.reaction),
      traits,
      loot: creatureData.loot,
      languages: creatureData.languages,
      challenge_rating: creatureData.challenge_rating,
      spellNames: spellNames.length > 0 ? spellNames : undefined,
      source: 'Official',
      isHomebrew: false,
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${creatureData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showSuccess(`Creature JSON downloaded: ${exportFileDefaultName}`);
  };

  const downloadFoundryJSON = async () => {
    if (!creatureData.name.trim()) {
      showError('Creature name is required');
      return;
    }

    try {
      // Generate a proper temporary ID that can be converted to 16 chars
      const timestamp = Date.now().toString();
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const tempId = `temp${timestamp}${randomSuffix}`.substring(0, 24);

      // Prepare creature data in the format expected by the API
      const creatureForFoundry = {
        _id: tempId, // Temporary ID for conversion
        name: creatureData.name,
        description: creatureData.description,
        tactics: creatureData.tactics,
        tier: creatureData.tier,
        type: creatureData.type,
        size: creatureData.size,
        foundry_portrait: creatureData.foundry_portrait || '',
        health: resources.health,
        energy: resources.energy,
        resolve: resources.resolve,
        movement,
        attributes,
        skills,
        mitigation,
        detections: {
          ...detections,
          normal: Math.max(0, Math.min(8, detections.normal)),
        },
        immunities: immunityOptions.reduce((acc, immunity) => ({
          ...acc,
          [immunity]: immunities.includes(immunity)
        }), {}),
        taming,
        actions: abilities.filter(a => !a.reaction),
        reactions: abilities.filter(a => a.reaction),
        traits,
        loot: creatureData.loot,
        languages: creatureData.languages,
        spells: [], // Empty for now, could be populated if needed
      };

      // Make API call to convert to Foundry format
      const response = await fetch('/fvtt/convert-creature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creatureForFoundry),
      });

      if (!response.ok) {
        throw new Error('Failed to convert to Foundry format');
      }

      const foundryData = await response.json();

      // Download the Foundry JSON
      const dataStr = JSON.stringify(foundryData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `${creatureData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_foundry.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      showSuccess(`Foundry JSON downloaded: ${exportFileDefaultName}`);
    } catch (error) {
      console.error('Error converting to Foundry format:', error);
      showError('Failed to convert creature to Foundry format');
    }
  };

  const loadFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        // Load the data into the form
        setCreatureData({
          name: jsonData.name || '',
          description: jsonData.description || '',
          tactics: jsonData.tactics || '',
          tier: jsonData.tier || 'standard',
          type: jsonData.type || 'humanoid',
          size: jsonData.size || 'medium',
          challenge_rating: jsonData.challenge_rating || 1,
          languages: jsonData.languages || [],
          loot: jsonData.loot || [],
          foundry_portrait: jsonData.foundry_portrait || '',
        });

        setResources(jsonData.health && jsonData.energy && jsonData.resolve ? {
          health: jsonData.health,
          energy: jsonData.energy,
          resolve: jsonData.resolve,
        } : resources);

        setMovement(jsonData.movement || movement);

        setAttributes(jsonData.attributes || attributes);

        // Handle skills with defensive loading to fix old buggy format
        if (jsonData.skills) {
          const normalizedSkills = Object.entries(jsonData.skills).reduce((acc, [skillName, skillData]) => {
            // Handle both old buggy format and correct format
            if (typeof skillData === 'object' && skillData !== null) {
              const skillObj = skillData as any; // Type assertion for dynamic data
              // Check if this is the buggy nested format
              if (typeof skillObj.value === 'object' && skillObj.value !== null && 'value' in skillObj.value) {
                // Extract the actual values from nested object
                (acc as any)[skillName] = {
                  value: skillObj.value.value ?? 0,
                  tier: skillObj.value.tier ?? 0
                };
              } else {
                // Normal format - just ensure we have proper defaults
                (acc as any)[skillName] = {
                  value: skillObj.value ?? 0,
                  tier: skillObj.tier ?? 0
                };
              }
            } else {
              // Fallback for unexpected data
              (acc as any)[skillName] = { value: 0, tier: 0 };
            }
            return acc;
          }, {} as SkillSet);
          setSkills(normalizedSkills);
        } else {
          setSkills(skills);
        }

        setMitigation(jsonData.mitigation || mitigation);
        setDetections(jsonData.detections || detections);
        setTaming(jsonData.taming || taming);

        // Handle immunities - convert from object format to array
        if (jsonData.immunities) {
          const activeImmunities = Object.entries(jsonData.immunities)
            .filter(([_, value]) => value === true)
            .map(([key, _]) => key);
          setImmunities(activeImmunities);
        }

        // Convert old format to new unified abilities format
        const combinedAbilities = [
          ...(jsonData.actions || []).map((action: any) => ({ ...action, reaction: false, basic: false })),
          ...(jsonData.reactions || []).map((reaction: any) => ({ ...reaction, reaction: true, basic: false, type: 'utility' }))
        ];
        setAbilities(combinedAbilities);
        setTraits(jsonData.traits || []);
        setSpellNames(jsonData.spellNames || []);

        showSuccess('Creature data loaded from JSON!');
      } catch (err) {
        showError('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  const clearForm = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setCreatureData({
        name: '',
        description: '',
        tactics: '',
        tier: 'standard',
        type: 'humanoid',
        size: 'medium',
        challenge_rating: 1,
        languages: [],
        loot: [],
        foundry_portrait: '',
      });
      setResources({
        health: { max: 15, current: 15 },
        energy: { max: 5, current: 5, recovery: 2 },
        resolve: { max: 5, current: 5, recovery: 1 },
      });
      setMovement({
        walk: 5,
        climb: 0,
        swim: 0,
        fly: 0,
      });
      setAttributes({
        physique: { talent: 2 },
        finesse: { talent: 2 },
        mind: { talent: 2 },
        knowledge: { talent: 2 },
        social: { talent: 2 },
      });
      setSkills({
        fitness: { value: 0, tier: 0 }, deflection: { value: 0, tier: 0 }, might: { value: 0, tier: 0 }, endurance: { value: 0, tier: 0 },
        evasion: { value: 0, tier: 0 }, stealth: { value: 0, tier: 0 }, coordination: { value: 0, tier: 0 }, thievery: { value: 0, tier: 0 },
        resilience: { value: 0, tier: 0 }, concentration: { value: 0, tier: 0 }, senses: { value: 0, tier: 0 }, logic: { value: 0, tier: 0 },
        wildcraft: { value: 0, tier: 0 }, academics: { value: 0, tier: 0 }, magic: { value: 0, tier: 0 }, medicine: { value: 0, tier: 0 },
        expression: { value: 0, tier: 0 }, presence: { value: 0, tier: 0 }, insight: { value: 0, tier: 0 }, persuasion: { value: 0, tier: 0 },
      });
      setMitigation({
        physical: 0, cold: 0, heat: 0, electric: 0,
        psychic: 0, dark: 0, divine: 0, aether: 0, toxic: 0,
      });
      setDetections({
        normal: 5, darksight: 0, infravision: 0, deadsight: 0,
        echolocation: 0, tremorsense: 0, truesight: 0, aethersight: 0,
      });
      setImmunities([]);
      setTaming({
        tame_check: -1,
        commands: 'basic'
      });
      setAbilities([]);
      setTraits([]);
      setSpellNames([]);
    }
  };

  // Ability management
  const addAbility = () => {
    setAbilities([
      ...abilities,
      {
        name: '',
        cost: 0,
        type: 'attack',
        magic: false,
        description: '',
        reaction: false,
        basic: false,
        attack: {
          roll: '2d6',
          damage: '2',
          damage_extra: '1',
          damage_type: 'physical',
          category: 'slash',
          min_range: 1,  // Adjacent
          max_range: 1   // Adjacent
        }
      },
    ]);
  };

  const addSpellAbility = (spell: any) => {
    const spellAbility: CreatureAbility = {
      name: spell.name,
      cost: spell.energy,
      type: 'spell',
      magic: true,
      description: spell.description,
      reaction: false,
      basic: false,
      spell: {
        roll: '2d8', // Default, user can edit
        damage: spell.damage.toString(),
        damage_extra: '0',
        damage_type: spell.damageType?.toLowerCase() || 'dark',
        target_defense: 'evasion',
        defense_difficulty: 6,
        min_range: 0,
        max_range: 3,
        charge: spell.charge || '',
        duration: spell.duration || 'Instantaneous',
        range: spell.range || 'Self',
        school: spell.school || 'primal',
        subschool: spell.subschool || '',
        checkToCast: spell.checkToCast || 4,
        components: spell.components || [],
        ritualDuration: spell.ritualDuration || '',
        concentration: spell.concentration || false,
        foundry_icon: spell.foundry_icon || '',
      },
    };
    setAbilities([...abilities, spellAbility]);
    setShowSpellSelector(false);
  };

  const removeAbility = (index: number) => {
    setAbilities(abilities.filter((_, i) => i !== index));
  };

  const updateAbility = (index: number, field: string, value: any) => {
    const newAbilities = [...abilities];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!newAbilities[index][parent as keyof CreatureAbility]) {
        (newAbilities[index] as any)[parent] = {};
      }
      ((newAbilities[index] as any)[parent] as any)[child] = value;
    } else {
      (newAbilities[index] as any)[field] = value;
    }
    setAbilities(newAbilities);
  };

  const updateAbilityProperty = (index: number, parentField: string, childField: string, value: any) => {
    const newAbilities = [...abilities];
    if (!newAbilities[index][parentField as keyof CreatureAbility]) {
      (newAbilities[index] as any)[parentField] = {};
    }
    ((newAbilities[index] as any)[parentField] as any)[childField] = value;
    setAbilities(newAbilities);
  };

  // Trait management
  const addTrait = () => {
    setTraits([
      ...traits,
      {
        name: '',
        description: '',
      },
    ]);
  };

  const removeTrait = (index: number) => {
    setTraits(traits.filter((_, i) => i !== index));
  };

  const updateTrait = (index: number, field: string, value: any) => {
    const newTraits = [...traits];
    (newTraits[index] as any)[field] = value;
    setTraits(newTraits);
  };

  if (!isDev) {
    return null; // This component should only render in development
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-orange-400 mb-2">
          🔧 Development Creature Designer
        </h1>
        <p className="text-gray-300 mb-4">
          Design creatures and export them as JSON files for the data folder.
        </p>

        {/* File Controls */}
        <div className="flex gap-4 mb-6">
          <Button onClick={downloadJSON} variant="primary">
            📥 Download JSON
          </Button>

          <Button onClick={downloadFoundryJSON} variant="accent">
            🎲 Download Foundry JSON
          </Button>

          <label className="cursor-pointer inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none px-4 py-2 text-white border-none"
                 style={{ backgroundColor: 'var(--color-evening)' }}
                 onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(25, 34, 49, 0.9)'}
                 onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-evening)'}
          >
            📁 Load JSON
            <input
              type="file"
              accept=".json"
              onChange={loadFromJSON}
              className="hidden"
            />
          </label>

          <Button onClick={clearForm} variant="danger">
            🗑️ Clear Form
          </Button>
        </div>

        {/* Step Navigation */}
        <div className="flex space-x-2 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i + 1)}
              className={`px-4 py-2 rounded ${
                currentStep === i + 1
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <Card>
          <CardBody>
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={creatureData.name}
                  onChange={(e) => setCreatureData({ ...creatureData, name: e.target.value })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                  placeholder="Creature name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Foundry Portrait</label>
                <input
                  type="text"
                  value={creatureData.foundry_portrait}
                  onChange={(e) => setCreatureData({ ...creatureData, foundry_portrait: e.target.value })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                  placeholder="image.png (just filename)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tier</label>
                <select
                  value={creatureData.tier}
                  onChange={(e) => setCreatureData({ ...creatureData, tier: e.target.value as any })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  <option value="minion">Minion</option>
                  <option value="grunt">Grunt</option>
                  <option value="standard">Standard</option>
                  <option value="champion">Champion</option>
                  <option value="elite">Elite</option>
                  <option value="legend">Legend</option>
                  <option value="mythic">Mythic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={creatureData.type}
                  onChange={(e) => setCreatureData({ ...creatureData, type: e.target.value as any })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  <option value="dark">Dark</option>
                  <option value="undead">Undead</option>
                  <option value="divine">Divine</option>
                  <option value="monster">Monster</option>
                  <option value="humanoid">Humanoid</option>
                  <option value="construct">Construct</option>
                  <option value="plantoid">Plantoid</option>
                  <option value="fey">Fey</option>
                  <option value="elemental">Elemental</option>
                  <option value="beast">Beast</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <select
                  value={creatureData.size}
                  onChange={(e) => setCreatureData({ ...creatureData, size: e.target.value as any })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  <option value="tiny">Tiny</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="huge">Huge</option>
                  <option value="gargantuan">Gargantuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Challenge Rating</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={creatureData.challenge_rating}
                  onChange={(e) => setCreatureData({ ...creatureData, challenge_rating: parseInt(e.target.value) })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={creatureData.description}
                onChange={(e) => setCreatureData({ ...creatureData, description: e.target.value })}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded h-24"
                placeholder="Creature description"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Tactics</label>
              <textarea
                value={creatureData.tactics}
                onChange={(e) => setCreatureData({ ...creatureData, tactics: e.target.value })}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded h-24"
                placeholder="Combat tactics and behavior"
              />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Step 2: Resources & Movement */}
      {currentStep === 2 && (
        <Card>
          <CardBody>
            <h2 className="text-xl font-bold mb-4">Resources & Movement</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Health (Max)</label>
                <input
                  type="number"
                  min="1"
                  value={resources.health.max}
                  onChange={(e) => setResources({
                    ...resources,
                    health: { ...resources.health, max: parseInt(e.target.value) }
                  })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                />
              </div>

              {/* Hide energy fields for minions and grunt */}
              {creatureData.tier !== 'minion' && creatureData.tier !== 'grunt' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Energy (Max)</label>
                    <input
                      type="number"
                      min="1"
                      value={resources.energy.max}
                      onChange={(e) => setResources({
                        ...resources,
                        energy: { ...resources.energy, max: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Energy Regeneration</label>
                    <input
                      type="number"
                      min="0"
                      value={resources.energy.recovery}
                      onChange={(e) => setResources({
                        ...resources,
                        energy: { ...resources.energy, recovery: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Resolve (Max)</label>
                <input
                  type="number"
                  min="1"
                  value={resources.resolve.max}
                  onChange={(e) => setResources({
                    ...resources,
                    resolve: { ...resources.resolve, max: parseInt(e.target.value) }
                  })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Movement</label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Walk</label>
                    <input
                      type="number"
                      min="0"
                      value={movement.walk}
                      onChange={(e) => setMovement({
                        ...movement,
                        walk: parseInt(e.target.value)
                      })}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Climb</label>
                    <input
                      type="number"
                      min="0"
                      value={movement.climb}
                      onChange={(e) => setMovement({
                        ...movement,
                        climb: parseInt(e.target.value)
                      })}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Swim</label>
                    <input
                      type="number"
                      min="0"
                      value={movement.swim}
                      onChange={(e) => setMovement({
                        ...movement,
                        swim: parseInt(e.target.value)
                      })}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Fly</label>
                    <input
                      type="number"
                      min="0"
                      value={movement.fly}
                      onChange={(e) => setMovement({
                        ...movement,
                        fly: parseInt(e.target.value)
                      })}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Step 3: Attributes */}
      {currentStep === 3 && (
        <Card>
          <CardBody>
            <h2 className="text-xl font-bold mb-4">Attributes (Talents)</h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(attributes).map(([attr, data]) => (
                <div key={attr}>
                  <label className="block text-sm font-medium mb-2 capitalize">{attr}</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={data.talent}
                    onChange={(e) => setAttributes({
                      ...attributes,
                      [attr]: { talent: Math.max(1, Math.min(5, parseInt(e.target.value))) }
                    })}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Step 4: Skills & Defenses */}
      {currentStep === 4 && (
        <Card>
          <CardBody>
            <h2 className="text-xl font-bold mb-4">Skills & Defenses</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Skills</h3>

              {/* Physique Skills */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2 text-orange-400">Physique</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['fitness', 'deflection', 'might', 'endurance'] as const).map(skill => (
                    <div key={skill} className="border border-gray-600 rounded p-3">
                      <label className="block text-sm font-medium mb-2 capitalize">{skill}</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="-1"
                          max="6"
                          value={skills[skill].value}
                          onChange={(e) => setSkills({
                            ...skills,
                            [skill]: { ...skills[skill], value: parseInt(e.target.value) }
                          })}
                          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                          placeholder="Value"
                        />
                        <select
                          value={skills[skill].tier}
                          onChange={(e) => setSkills({
                            ...skills,
                            [skill]: { ...skills[skill], tier: parseInt(e.target.value) }
                          })}
                          className="w-24 p-2 bg-gray-800 border border-gray-600 rounded"
                        >
                          <option value={1}>Upgraded</option>
                          <option value={0}>Normal</option>
                          <option value={-1}>Downgraded</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Finesse Skills */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2 text-orange-400">Finesse</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['evasion', 'stealth', 'coordination', 'thievery'] as const).map(skill => (
                    <div key={skill} className="border border-gray-600 rounded p-3">
                      <label className="block text-sm font-medium mb-2 capitalize">{skill}</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="-1"
                          max="6"
                          value={skills[skill].value}
                          onChange={(e) => setSkills({
                            ...skills,
                            [skill]: { ...skills[skill], value: parseInt(e.target.value) }
                          })}
                          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                          placeholder="Value"
                        />
                        <select
                          value={skills[skill].tier}
                          onChange={(e) => setSkills({
                            ...skills,
                            [skill]: { ...skills[skill], tier: parseInt(e.target.value) }
                          })}
                          className="w-24 p-2 bg-gray-800 border border-gray-600 rounded"
                        >
                          <option value={1}>Upgraded</option>
                          <option value={0}>Normal</option>
                          <option value={-1}>Downgraded</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mind Skills */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2 text-orange-400">Mind</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['resilience', 'concentration', 'senses', 'logic'] as const).map(skill => (
                    <div key={skill} className="border border-gray-600 rounded p-3">
                      <label className="block text-sm font-medium mb-2 capitalize">{skill}</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="-1"
                          max="6"
                          value={skills[skill].value}
                          onChange={(e) => setSkills({
                            ...skills,
                            [skill]: { ...skills[skill], value: parseInt(e.target.value) }
                          })}
                          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                          placeholder="Value"
                        />
                        <select
                          value={skills[skill].tier}
                          onChange={(e) => setSkills({
                            ...skills,
                            [skill]: { ...skills[skill], tier: parseInt(e.target.value) }
                          })}
                          className="w-24 p-2 bg-gray-800 border border-gray-600 rounded"
                        >
                          <option value={1}>Upgraded</option>
                          <option value={0}>Normal</option>
                          <option value={-1}>Downgraded</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Skills */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2 text-orange-400">Knowledge</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['wildcraft', 'academics', 'magic', 'medicine'] as const).map(skill => (
                    <div key={skill} className="border border-gray-600 rounded p-3">
                      <label className="block text-sm font-medium mb-2 capitalize">{skill}</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="-1"
                          max="6"
                          value={skills[skill].value}
                          onChange={(e) => setSkills({
                            ...skills,
                            [skill]: { ...skills[skill], value: parseInt(e.target.value) }
                          })}
                          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                          placeholder="Value"
                        />
                        <select
                          value={skills[skill].tier}
                          onChange={(e) => setSkills({
                            ...skills,
                            [skill]: { ...skills[skill], tier: parseInt(e.target.value) }
                          })}
                          className="w-24 p-2 bg-gray-800 border border-gray-600 rounded"
                        >
                          <option value={1}>Upgraded</option>
                          <option value={0}>Normal</option>
                          <option value={-1}>Downgraded</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Skills */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2 text-orange-400">Social</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['expression', 'presence', 'insight', 'persuasion'] as const).map(skill => (
                    <div key={skill} className="border border-gray-600 rounded p-3">
                      <label className="block text-sm font-medium mb-2 capitalize">{skill}</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="-1"
                          max="6"
                          value={skills[skill].value}
                          onChange={(e) => setSkills({
                            ...skills,
                            [skill]: { ...skills[skill], value: parseInt(e.target.value) }
                          })}
                          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                          placeholder="Value"
                        />
                        <select
                          value={skills[skill].tier}
                          onChange={(e) => setSkills({
                            ...skills,
                            [skill]: { ...skills[skill], tier: parseInt(e.target.value) }
                          })}
                          className="w-24 p-2 bg-gray-800 border border-gray-600 rounded"
                        >
                          <option value={1}>Upgraded</option>
                          <option value={0}>Normal</option>
                          <option value={-1}>Downgraded</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Mitigation</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {Object.entries(mitigation).map(([type, value]) => (
                  <div key={type}>
                    <label className="block text-sm font-medium mb-2 capitalize">{type}</label>
                    <input
                      type="number"
                      min="0"
                      value={value}
                      onChange={(e) => setMitigation({
                        ...mitigation,
                        [type]: parseInt(e.target.value)
                      })}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Detection</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(detections).map(([detection, value]) => (
                  <div key={detection}>
                    <label className="block text-sm font-medium mb-2 capitalize">{detection}</label>
                    <select
                      value={value}
                      onChange={(e) => setDetections({
                        ...detections,
                        [detection]: parseInt(e.target.value)
                      })}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                    >
                      <option value={0}>None</option>
                      {getRangeOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label} ({option.value})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Immunities</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Add Immunity</label>
                <select
                  onChange={(e) => {
                    const immunity = e.target.value;
                    if (immunity && !immunities.includes(immunity)) {
                      setImmunities([...immunities, immunity]);
                    }
                    e.target.value = ''; // Reset dropdown
                  }}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                  defaultValue=""
                >
                  <option value="">Select immunity to add...</option>
                  {immunityOptions
                    .filter(immunity => !immunities.includes(immunity))
                    .map(immunity => (
                      <option key={immunity} value={immunity}>
                        {immunity.charAt(0).toUpperCase() + immunity.slice(1)}
                      </option>
                    ))}
                </select>
              </div>

              {immunities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Current Immunities</label>
                  <div className="flex flex-wrap gap-2">
                    {immunities.map(immunity => (
                      <div
                        key={immunity}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {immunity.charAt(0).toUpperCase() + immunity.slice(1)}
                        <button
                          type="button"
                          onClick={() => setImmunities(immunities.filter(i => i !== immunity))}
                          className="text-white hover:text-red-300 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Taming</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tame Check (-1 = Not Tameable)</label>
                  <input
                    type="number"
                    value={taming.tame_check}
                    onChange={(e) => setTaming({ ...taming, tame_check: parseInt(e.target.value) })}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Commands Level</label>
                  <select
                    value={taming.commands}
                    onChange={(e) => setTaming({ ...taming, commands: e.target.value as 'basic' | 'moderate' | 'advanced' })}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                  >
                    <option value="basic">Basic</option>
                    <option value="moderate">Moderate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Step 5: Abilities */}
      {currentStep === 5 && (
        <Card>
          <CardBody>
            <h2 className="text-xl font-bold mb-4">Abilities</h2>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">All Abilities</h3>
                <div className="flex gap-2">
                  <Button onClick={addAbility}>Add Ability</Button>
                  <Button onClick={() => setShowSpellSelector(true)} variant="accent">Add Spell</Button>
                </div>
              </div>

              {abilities.map((ability, index) => (
                <div key={index} className="border border-gray-600 rounded p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Ability name"
                      value={ability.name}
                      onChange={(e) => updateAbility(index, 'name', e.target.value)}
                      className="p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Energy cost"
                      min="0"
                      value={ability.cost}
                      onChange={(e) => updateAbility(index, 'cost', parseInt(e.target.value))}
                      className="p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                    <select
                      value={ability.type}
                      onChange={(e) => updateAbility(index, 'type', e.target.value)}
                      className="p-2 bg-gray-800 border border-gray-600 rounded"
                    >
                      <option value="attack">Attack</option>
                      <option value="spell">Spell</option>
                      <option value="utility">Utility</option>
                      <option value="movement">Movement</option>
                    </select>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={ability.reaction}
                          onChange={(e) => updateAbility(index, 'reaction', e.target.checked)}
                        />
                        <span className="text-sm">Reaction</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={ability.basic}
                          onChange={(e) => updateAbility(index, 'basic', e.target.checked)}
                        />
                        <span className="text-sm">Basic</span>
                      </label>
                    </div>
                  </div>

                  <textarea
                    placeholder="Ability description"
                    value={ability.description}
                    onChange={(e) => updateAbility(index, 'description', e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded mb-4"
                    rows={2}
                  />

                  {/* Attack-specific fields */}
                  {ability.type === 'attack' && (
                    <div className="border-t border-gray-600 pt-4 mb-4">
                      <h4 className="text-md font-medium mb-3">Attack Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="Roll formula (e.g., 2d10)"
                          value={ability.attack?.roll || ''}
                          onChange={(e) => updateAbilityProperty(index, 'attack', 'roll', e.target.value)}
                          className="p-2 bg-gray-800 border border-gray-600 rounded"
                        />
                        <select
                          value={ability.attack?.category || 'pierce'}
                          onChange={(e) => updateAbilityProperty(index, 'attack', 'category', e.target.value)}
                          className="p-2 bg-gray-800 border border-gray-600 rounded"
                        >
                          <option value="pierce">Pierce</option>
                          <option value="slash">Slash</option>
                          <option value="blunt">Blunt</option>
                          <option value="ranged">Ranged</option>
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">Min Range</label>
                            <select
                              value={ability.attack?.min_range || 1}
                              onChange={(e) => updateAbilityProperty(index, 'attack', 'min_range', parseInt(e.target.value))}
                              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                            >
                              {getRangeOptions().map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Max Range</label>
                            <select
                              value={ability.attack?.max_range || 1}
                              onChange={(e) => updateAbilityProperty(index, 'attack', 'max_range', parseInt(e.target.value))}
                              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                            >
                              {getRangeOptions().map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Primary Damage</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Damage"
                              value={ability.attack?.damage || ''}
                              onChange={(e) => updateAbilityProperty(index, 'attack', 'damage', e.target.value)}
                              className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                            />
                            <input
                              type="text"
                              placeholder="Extra"
                              value={ability.attack?.damage_extra || ''}
                              onChange={(e) => updateAbilityProperty(index, 'attack', 'damage_extra', e.target.value)}
                              className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                            />
                            <select
                              value={ability.attack?.damage_type || 'physical'}
                              onChange={(e) => updateAbilityProperty(index, 'attack', 'damage_type', e.target.value)}
                              className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                            >
                              <option value="physical">Physical</option>
                              <option value="heat">Heat</option>
                              <option value="cold">Cold</option>
                              <option value="electric">Electric</option>
                              <option value="dark">Dark</option>
                              <option value="divine">Divine</option>
                              <option value="aetheric">Aetheric</option>
                              <option value="psychic">Psychic</option>
                              <option value="toxic">Toxic</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Secondary Damage (Optional)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Damage"
                              value={ability.attack?.secondary_damage || ''}
                              onChange={(e) => updateAbilityProperty(index, 'attack', 'secondary_damage', e.target.value)}
                              className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                            />
                            <input
                              type="text"
                              placeholder="Extra"
                              value={ability.attack?.secondary_damage_extra || ''}
                              onChange={(e) => updateAbilityProperty(index, 'attack', 'secondary_damage_extra', e.target.value)}
                              className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                            />
                            <select
                              value={ability.attack?.secondary_damage_type || ''}
                              onChange={(e) => updateAbilityProperty(index, 'attack', 'secondary_damage_type', e.target.value)}
                              className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                            >
                              <option value="">None</option>
                              <option value="physical">Physical</option>
                              <option value="heat">Heat</option>
                              <option value="cold">Cold</option>
                              <option value="electric">Electric</option>
                              <option value="dark">Dark</option>
                              <option value="divine">Divine</option>
                              <option value="aetheric">Aetheric</option>
                              <option value="psychic">Psychic</option>
                              <option value="toxic">Toxic</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Spell-specific fields */}
                  {ability.type === 'spell' && (
                    <div className="border-t border-gray-600 pt-4 mb-4">
                      <h4 className="text-md font-medium mb-3">Spell Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <select
                          value={ability.spell?.school || 'primal'}
                          onChange={(e) => updateAbilityProperty(index, 'spell', 'school', e.target.value)}
                          className="p-2 bg-gray-800 border border-gray-600 rounded"
                        >
                          <option value="primal">Primal</option>
                          <option value="black">Black</option>
                          <option value="divine">Divine</option>
                          <option value="mysticism">Mysticism</option>
                          <option value="meta">Meta</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Subschool"
                          value={ability.spell?.subschool || ''}
                          onChange={(e) => updateAbilityProperty(index, 'spell', 'subschool', e.target.value)}
                          className="p-2 bg-gray-800 border border-gray-600 rounded"
                        />
                        <input
                          type="number"
                          placeholder="Check to cast"
                          min="1"
                          value={ability.spell?.checkToCast || 4}
                          onChange={(e) => updateAbilityProperty(index, 'spell', 'checkToCast', parseInt(e.target.value))}
                          className="p-2 bg-gray-800 border border-gray-600 rounded"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="Duration"
                          value={ability.spell?.duration || 'Instantaneous'}
                          onChange={(e) => updateAbilityProperty(index, 'spell', 'duration', e.target.value)}
                          className="p-2 bg-gray-800 border border-gray-600 rounded"
                        />
                        <select
                          value={ability.spell?.target_defense || 'evasion'}
                          onChange={(e) => updateAbilityProperty(index, 'spell', 'target_defense', e.target.value)}
                          className="p-2 bg-gray-800 border border-gray-600 rounded"
                        >
                          <option value="evasion">Evasion</option>
                          <option value="deflection">Deflection</option>
                          <option value="resilience">Resilience</option>
                          <option value="none">None</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Range description (optional)"
                          value={ability.spell?.range || 'Self'}
                          onChange={(e) => updateAbilityProperty(index, 'spell', 'range', e.target.value)}
                          className="p-2 bg-gray-800 border border-gray-600 rounded"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">Min Range</label>
                          <select
                            value={ability.spell?.min_range || 0}
                            onChange={(e) => updateAbilityProperty(index, 'spell', 'min_range', parseInt(e.target.value))}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                          >
                            {getRangeOptions().map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Max Range</label>
                          <select
                            value={ability.spell?.max_range || 5}
                            onChange={(e) => updateAbilityProperty(index, 'spell', 'max_range', parseInt(e.target.value))}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                          >
                            {getRangeOptions().map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="number"
                          placeholder="Defense difficulty"
                          min="0"
                          value={ability.spell?.defense_difficulty || 6}
                          onChange={(e) => updateAbilityProperty(index, 'spell', 'defense_difficulty', parseInt(e.target.value))}
                          className="p-2 bg-gray-800 border border-gray-600 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Roll formula (e.g., 2d8)"
                          value={ability.spell?.roll || ''}
                          onChange={(e) => updateAbilityProperty(index, 'spell', 'roll', e.target.value)}
                          className="p-2 bg-gray-800 border border-gray-600 rounded"
                        />
                      </div>
                      <textarea
                        placeholder="Charge description (optional)"
                        value={ability.spell?.charge || ''}
                        onChange={(e) => updateAbilityProperty(index, 'spell', 'charge', e.target.value)}
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded mb-4"
                        rows={2}
                      />
                    </div>
                  )}

                  <Button onClick={() => removeAbility(index)} variant="danger" size="sm">
                    Remove
                  </Button>
                </div>
              ))}
            </div>

          </CardBody>
        </Card>
      )}

      {/* Step 6: Traits & Spells */}
      {currentStep === 6 && (
        <Card>
          <CardBody>
            <h2 className="text-xl font-bold mb-4">Traits & Spells</h2>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Traits</h3>
                <Button onClick={addTrait}>Add Trait</Button>
              </div>

              {traits.map((trait, index) => (
                <div key={index} className="border border-gray-600 rounded p-4 mb-4">
                  <input
                    type="text"
                    placeholder="Trait name"
                    value={trait.name}
                    onChange={(e) => updateTrait(index, 'name', e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded mb-2"
                  />

                  <textarea
                    placeholder="Trait description"
                    value={trait.description}
                    onChange={(e) => updateTrait(index, 'description', e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded mb-2"
                    rows={2}
                  />

                  <Button onClick={() => removeTrait(index)} variant="danger" size="sm">
                    Remove
                  </Button>
                </div>
              ))}
            </div>

          </CardBody>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          variant="secondary"
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep === totalSteps}
          variant="secondary"
        >
          Next
        </Button>
      </div>

      {/* Spell Selector Modal */}
      {showSpellSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Select Spell to Add</h3>
              <Button onClick={() => setShowSpellSelector(false)} variant="ghost">✕</Button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSpells.map((spell) => (
                  <div key={spell._id} className="border border-gray-600 rounded p-4 hover:bg-gray-700 cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{spell.name}</h4>
                        <p className="text-sm text-gray-400">
                          {spell.school} • {spell.subschool} • Energy: {spell.energy}
                        </p>
                      </div>
                      <Button
                        onClick={() => addSpellAbility(spell)}
                        size="sm"
                        variant="accent"
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{spell.description}</p>
                    <div className="text-xs text-gray-400">
                      <p>Cast: {spell.checkToCast} • Damage: {spell.damage} • Range: {spell.range}</p>
                      {spell.charge && <p className="mt-1"><strong>Charge:</strong> {spell.charge}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {availableSpells.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No spells available. Loading...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevCreatureDesigner;