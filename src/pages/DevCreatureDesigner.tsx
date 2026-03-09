import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import { CREATURE_SUBCATEGORIES, MAGIC_SCHOOLS } from '../utils/creatureUtils';
import { getDiceForSkill } from '../utils/combatUtils';
import AbilityEditor, { AbilityEntry } from '../components/shared/AbilityEditor';

interface CreatureAbility {
  name: string;
  cost: number;
  type: 'attack' | 'spell' | 'utility' | 'movement';
  magic: boolean;
  description: string;
  reaction: boolean;
  basic: boolean;
  round: boolean;
  daily: boolean;
  spellType: 'normal' | 'innate' | 'unique';
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
    school?: 'meta' | 'black' | 'white' | 'mysticism' | 'primal' | 'arcane';
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

interface KnownSpell {
  name: string;
  energyCost: number;
  spellType: 'normal' | 'innate' | 'unique';
  school?: string;
  subschool?: string;
  // Override fields shown when innate/unique
  description?: string;
  roll?: string;
  damage?: string;
  damage_extra?: string;
  damage_type?: string;
  target_defense?: string;
  defense_difficulty?: number;
  min_range?: number;
  max_range?: number;
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


const subschoolMap = {
  primal: [
    { value: 'elemental', label: 'Elemental' },
    { value: 'nature', label: 'Nature' },
    { value: 'draconic', label: 'Draconic' },
    { value: 'custom', label: 'Custom' },
  ],
  black: [
    { value: 'necromancy', label: 'Necromancy' },
    { value: 'witchcraft', label: 'Witchcraft' },
    { value: 'fiend', label: 'Fiend' },
    { value: 'custom', label: 'Custom' },
  ],
  white: [
    { value: 'radiant', label: 'Radiant' },
    { value: 'protection', label: 'Protection' },
    { value: 'celestial', label: 'Celestial' },
    { value: 'custom', label: 'Custom' },
  ],
  mysticism: [
    { value: 'spirit', label: 'Spirit' },
    { value: 'divination', label: 'Divination' },
    { value: 'cosmic', label: 'Cosmic' },
    { value: 'custom', label: 'Custom' },
  ],
  meta: [
    { value: 'transmutation', label: 'Transmutation' },
    { value: 'illusion', label: 'Illusion' },
    { value: 'fey', label: 'Fey' },
    { value: 'custom', label: 'Custom' },
  ],
  arcane: [
    { value: 'conjuration', label: 'Conjuration' },
    { value: 'enchantment', label: 'Enchantment' },
    { value: 'chaos', label: 'Chaos' },
    { value: 'custom', label: 'Custom' },
  ],
};

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
    subcategory: '',
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

  // Magic Skills
  const defaultMagicSkills = {
    blackMagic: { talent: 0, skill: 0 },
    primalMagic: { talent: 0, skill: 0 },
    metaMagic: { talent: 0, skill: 0 },
    whiteMagic: { talent: 0, skill: 0 },
    mysticismMagic: { talent: 0, skill: 0 },
    arcaneMagic: { talent: 0, skill: 0 },
  };
  const [magicSkills, setMagicSkills] = useState({ ...defaultMagicSkills });

  // Defenses
  const [mitigation, setMitigation] = useState({
    physical: 0,
    cold: 0,
    heat: 0,
    electric: 0,
    psychic: 0,
    dark: 0,
    divine: 0,
    aetheric: 0,
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
    // Mental conditions (9)
    'afraid', 'alert', 'broken', 'charmed', 'confused', 'dazed',
    'maddened', 'numbed', 'stunned',
    // Physical conditions (13)
    'bleeding', 'blinded', 'deafened', 'ignited', 'impaired', 'incapacitated',
    'muted', 'obscured', 'poisoned', 'prone', 'stasis', 'unconscious', 'winded'
  ];

  // Taming
  const [taming, setTaming] = useState({
    tame_check: -1,
    commands: 'basic' as 'basic' | 'moderate' | 'advanced'
  });

  // Abilities
  const [abilities, setAbilities] = useState<CreatureAbility[]>([]);
  const [traits, setTraits] = useState<CreatureTrait[]>([]);
  const [knownSpells, setKnownSpells] = useState<KnownSpell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<any[]>([]);
  const [showSpellSelector, setShowSpellSelector] = useState(false);
  const [spellSearch, setSpellSearch] = useState('');
  const [spellSchoolFilter, setSpellSchoolFilter] = useState('all');
  const [spellSubschoolFilter, setSpellSubschoolFilter] = useState('all');
  const [spellCheckFilter, setSpellCheckFilter] = useState('all');
  const [showMonsterBrowser, setShowMonsterBrowser] = useState(false);
  const [monsterFiles, setMonsterFiles] = useState<Record<string, { filename: string; name: string; tier: string }[]>>({});
  const [monsterCategoryFilter, setMonsterCategoryFilter] = useState('all');
  const [monsterSearch, setMonsterSearch] = useState('');
  const [editingFile, setEditingFile] = useState<{ category: string; filename: string } | null>(null);

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

  const fetchMonsterFiles = async () => {
    try {
      const response = await fetch('/api/creatures/files');
      if (response.ok) {
        const data = await response.json();
        setMonsterFiles(data);
      }
    } catch (err) {
      console.error('Failed to fetch monster files:', err);
    }
  };

  const loadMonsterFile = async (category: string, filename: string) => {
    try {
      const response = await fetch(`/api/creatures/files/${category}/${filename}`);
      if (!response.ok) throw new Error('Failed to load');
      const jsonData = await response.json();

      // Reuse same logic as loadFromJSON
      setCreatureData({
        name: jsonData.name || '',
        description: jsonData.description || '',
        tactics: jsonData.tactics || '',
        tier: jsonData.tier || 'standard',
        type: jsonData.type || 'humanoid',
        subcategory: jsonData.subcategory || '',
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

      if (jsonData.skills) {
        const normalizedSkills = Object.entries(jsonData.skills).reduce((acc, [skillName, skillData]) => {
          if (typeof skillData === 'object' && skillData !== null) {
            const skillObj = skillData as any;
            if (typeof skillObj.value === 'object' && skillObj.value !== null && 'value' in skillObj.value) {
              (acc as any)[skillName] = { value: skillObj.value.value ?? 0, tier: skillObj.value.tier ?? 0 };
            } else {
              (acc as any)[skillName] = { value: skillObj.value ?? 0, tier: skillObj.tier ?? 0 };
            }
          } else {
            (acc as any)[skillName] = { value: 0, tier: 0 };
          }
          return acc;
        }, {} as SkillSet);
        setSkills(normalizedSkills);
      }

      setMagicSkills(jsonData.magicSkills || { ...defaultMagicSkills });
      setMitigation(jsonData.mitigation || mitigation);
      setDetections(jsonData.detections || detections);
      setTaming(jsonData.taming || taming);

      if (jsonData.immunities) {
        const activeImmunities = Object.entries(jsonData.immunities)
          .filter(([_, value]) => value === true)
          .map(([key, _]) => key);
        setImmunities(activeImmunities);
      }

      // Separate innate/unique spell-type actions into knownSpells
      const allLoadActions = (jsonData.actions || []).map((action: any) => ({ ...action, reaction: false, basic: action.basic || false, round: action.round || false, daily: action.daily || false, spellType: action.spellType || 'normal' }));
      const allLoadReactions = (jsonData.reactions || []).map((reaction: any) => ({ ...reaction, reaction: true, basic: reaction.basic || false, round: reaction.round || false, daily: reaction.daily || false, spellType: reaction.spellType || 'normal', type: reaction.type || 'utility' }));

      const innateActions = allLoadActions.filter((a: any) => a.type === 'spell' && (a.spellType === 'innate' || a.spellType === 'unique'));
      const regularActions = allLoadActions.filter((a: any) => !(a.type === 'spell' && (a.spellType === 'innate' || a.spellType === 'unique')));

      setAbilities([...regularActions, ...allLoadReactions]);
      setTraits(jsonData.traits || []);

      // Build knownSpells from spellNames (normal) + innate spell actions
      const normalSpells: KnownSpell[] = (jsonData.spellNames || []).map((name: string) => ({
        name, energyCost: 1, spellType: 'normal' as const,
      }));
      const innateSpells: KnownSpell[] = innateActions.map((a: any) => ({
        name: a.name,
        energyCost: a.cost || 1,
        spellType: a.spellType as 'innate' | 'unique',
        school: a.spell?.school || '',
        subschool: a.spell?.subschool || '',
        description: a.description || '',
        roll: a.spell?.roll || '',
        damage: a.spell?.damage || '',
        damage_extra: a.spell?.damage_extra || '0',
        damage_type: a.spell?.damage_type || 'aetheric',
        target_defense: a.spell?.target_defense || 'evasion',
        defense_difficulty: a.spell?.defense_difficulty || 6,
        min_range: a.spell?.min_range ?? 0,
        max_range: a.spell?.max_range ?? 5,
      }));
      setKnownSpells([...normalSpells, ...innateSpells]);

      setEditingFile({ category, filename });
      setShowMonsterBrowser(false);
      setMonsterSearch('');
      setMonsterCategoryFilter('all');
      showSuccess(`Loaded ${jsonData.name || filename} for editing`);
    } catch (err) {
      showError('Failed to load monster file');
    }
  };

  // Build save data from knownSpells: normal → spellNames, innate/unique → actions
  const buildSpellSaveData = () => {
    const normalSpellNames = knownSpells
      .filter(s => s.spellType === 'normal')
      .map(s => s.name);

    const innateSpellActions = knownSpells
      .filter(s => s.spellType !== 'normal')
      .map(s => ({
        name: s.name,
        cost: s.energyCost,
        type: 'spell' as const,
        magic: true,
        description: s.description || '',
        basic: false,
        round: false,
        daily: false,
        spellType: s.spellType,
        spell: {
          roll: s.roll || '',
          damage: s.damage || '',
          damage_extra: s.damage_extra || '0',
          damage_type: s.damage_type || 'aetheric',
          target_defense: s.target_defense || 'evasion',
          defense_difficulty: s.defense_difficulty || 6,
          min_range: s.min_range ?? 0,
          max_range: s.max_range ?? 5,
          school: s.school || '',
          subschool: s.subschool || '',
        },
      }));

    return { normalSpellNames, innateSpellActions };
  };

  const saveMonsterFile = async () => {
    if (!editingFile) return;

    // Only include magicSkills if any school has talent > 0
    const hasMagicSkills = Object.values(magicSkills).some(s => s.talent > 0);

    const { normalSpellNames, innateSpellActions } = buildSpellSaveData();

    const jsonData = {
      name: creatureData.name,
      description: creatureData.description,
      tactics: creatureData.tactics,
      tier: creatureData.tier,
      type: creatureData.type,
      ...(creatureData.subcategory ? { subcategory: creatureData.subcategory } : {}),
      size: creatureData.size,
      foundry_portrait: creatureData.foundry_portrait || '',
      health: resources.health,
      energy: resources.energy,
      resolve: resources.resolve,
      movement,
      attributes,
      skills,
      ...(hasMagicSkills ? { magicSkills } : {}),
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
      actions: [...abilities.filter(a => !a.reaction), ...innateSpellActions],
      reactions: abilities.filter(a => a.reaction),
      traits,
      loot: creatureData.loot,
      languages: creatureData.languages,
      challenge_rating: creatureData.challenge_rating,
      spellNames: normalSpellNames.length > 0 ? normalSpellNames : undefined,
      source: 'Official',
      isHomebrew: false,
    };

    try {
      const response = await fetch(`/api/creatures/files/${editingFile.category}/${editingFile.filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      if (!response.ok) throw new Error('Failed to save');
      showSuccess(`Saved ${creatureData.name} to ${editingFile.category}/${editingFile.filename}`);
    } catch (err) {
      showError('Failed to save monster file');
    }
  };

  const downloadJSON = () => {
    if (!creatureData.name.trim()) {
      showError('Creature name is required');
      return;
    }

    const hasMagicSkillsForJSON = Object.values(magicSkills).some(s => s.talent > 0);
    const { normalSpellNames: dlNormalSpells, innateSpellActions: dlInnateActions } = buildSpellSaveData();

    const jsonData = {
      name: creatureData.name,
      description: creatureData.description,
      tactics: creatureData.tactics,
      tier: creatureData.tier,
      type: creatureData.type,
      ...(creatureData.subcategory ? { subcategory: creatureData.subcategory } : {}),
      size: creatureData.size,
      foundry_portrait: creatureData.foundry_portrait || '',
      health: resources.health,
      energy: resources.energy,
      resolve: resources.resolve,
      movement,
      attributes,
      skills,
      ...(hasMagicSkillsForJSON ? { magicSkills } : {}),
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
      actions: [...abilities.filter(a => !a.reaction), ...dlInnateActions],
      reactions: abilities.filter(a => a.reaction),
      traits,
      loot: creatureData.loot,
      languages: creatureData.languages,
      challenge_rating: creatureData.challenge_rating,
      spellNames: dlNormalSpells.length > 0 ? dlNormalSpells : undefined,
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
        ...(creatureData.subcategory ? { subcategory: creatureData.subcategory } : {}),
        size: creatureData.size,
        foundry_portrait: creatureData.foundry_portrait || '',
        health: resources.health,
        energy: resources.energy,
        resolve: resources.resolve,
        movement,
        attributes,
        skills,
        magicSkills,
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
        actions: [...abilities.filter(a => !a.reaction), ...buildSpellSaveData().innateSpellActions],
        reactions: abilities.filter(a => a.reaction),
        traits,
        loot: creatureData.loot,
        languages: creatureData.languages,
        spells: [], // Spell references resolved server-side
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
          subcategory: jsonData.subcategory || '',
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

        setMagicSkills(jsonData.magicSkills || { ...defaultMagicSkills });
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
        // Filter out spell-type actions with innate/unique spellType — those go to knownSpells
        const allActions = (jsonData.actions || []).map((action: any) => ({ ...action, reaction: false, basic: action.basic || false, round: action.round || false, daily: action.daily || false, spellType: action.spellType || 'normal' }));
        const allReactions = (jsonData.reactions || []).map((reaction: any) => ({ ...reaction, reaction: true, basic: reaction.basic || false, round: reaction.round || false, daily: reaction.daily || false, spellType: reaction.spellType || 'normal', type: reaction.type || 'utility' }));

        // Separate innate/unique spell actions into knownSpells
        const innateSpellActions = allActions.filter((a: any) => a.type === 'spell' && (a.spellType === 'innate' || a.spellType === 'unique'));
        const nonInnateActions = allActions.filter((a: any) => !(a.type === 'spell' && (a.spellType === 'innate' || a.spellType === 'unique')));

        const combinedAbilities = [...nonInnateActions, ...allReactions];
        setAbilities(combinedAbilities);
        setTraits(jsonData.traits || []);

        // Build knownSpells from spellNames (normal) + innate spell actions
        const normalSpells: KnownSpell[] = (jsonData.spellNames || []).map((name: string) => ({
          name, energyCost: 1, spellType: 'normal' as const,
        }));
        const innateSpells: KnownSpell[] = innateSpellActions.map((a: any) => ({
          name: a.name,
          energyCost: a.cost || 1,
          spellType: a.spellType as 'innate' | 'unique',
          school: a.spell?.school || '',
          subschool: a.spell?.subschool || '',
          description: a.description || '',
          roll: a.spell?.roll || '',
          damage: a.spell?.damage || '',
          damage_extra: a.spell?.damage_extra || '0',
          damage_type: a.spell?.damage_type || 'aetheric',
          target_defense: a.spell?.target_defense || 'evasion',
          defense_difficulty: a.spell?.defense_difficulty || 6,
          min_range: a.spell?.min_range ?? 0,
          max_range: a.spell?.max_range ?? 5,
        }));
        setKnownSpells([...normalSpells, ...innateSpells]);

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
        subcategory: '',
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
      setMagicSkills({ ...defaultMagicSkills });
      setMitigation({
        physical: 0, cold: 0, heat: 0, electric: 0,
        psychic: 0, dark: 0, divine: 0, aetheric: 0, toxic: 0,
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
      setKnownSpells([]);
      setEditingFile(null);
    }
  };

  const addSpellAbility = (spell: any) => {
    // Add as a known spell reference
    if (spell.name && !knownSpells.some(s => s.name === spell.name)) {
      setKnownSpells([...knownSpells, {
        name: spell.name,
        energyCost: spell.energy || 1,
        spellType: 'normal',
        school: spell.school || '',
        subschool: spell.subschool || '',
        description: spell.description || '',
        damage: spell.damage?.toString() || '',
        damage_extra: '0',
        damage_type: spell.damageType?.toLowerCase() || 'aetheric',
        target_defense: 'evasion',
        defense_difficulty: 6,
        min_range: 0,
        max_range: 5,
      }]);
    }
    setShowSpellSelector(false);
  };

  const updateKnownSpell = (index: number, field: string, value: any) => {
    const updated = [...knownSpells];
    (updated[index] as any)[field] = value;
    setKnownSpells(updated);
  };

  const removeKnownSpell = (index: number) => {
    setKnownSpells(knownSpells.filter((_, i) => i !== index));
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
        <div className="flex gap-4 mb-6 flex-wrap">
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

          <Button onClick={() => { fetchMonsterFiles(); setShowMonsterBrowser(true); }} variant="secondary">
            ✏️ Edit Creature
          </Button>

          {editingFile && (
            <Button onClick={saveMonsterFile} variant="primary">
              💾 Save to {editingFile.category}/{editingFile.filename}
            </Button>
          )}

          <Button onClick={clearForm} variant="danger">
            🗑️ Clear Form
          </Button>
        </div>

        {editingFile && (
          <div className="mb-4 px-3 py-2 rounded text-sm flex items-center gap-2"
               style={{ backgroundColor: 'rgba(200, 170, 80, 0.15)', border: '1px solid rgba(200, 170, 80, 0.3)', color: 'var(--color-old-gold)' }}>
            Editing: <strong>{editingFile.category}/{editingFile.filename}</strong>
            <button onClick={() => setEditingFile(null)} className="ml-2 text-gray-400 hover:text-white text-xs">✕ clear</button>
          </div>
        )}

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
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setCreatureData({ ...creatureData, type: newType, subcategory: CREATURE_SUBCATEGORIES[newType] ? creatureData.subcategory : '' });
                  }}
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

              {CREATURE_SUBCATEGORIES[creatureData.type] && (
                <div>
                  <label className="block text-sm font-medium mb-2">Subcategory</label>
                  <select
                    value={creatureData.subcategory}
                    onChange={(e) => setCreatureData({ ...creatureData, subcategory: e.target.value })}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                  >
                    <option value="">None</option>
                    {CREATURE_SUBCATEGORIES[creatureData.type].map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

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

            {/* Magic Skills */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Magic Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.entries(MAGIC_SCHOOLS) as [string, { label: string; color: string }][]).map(([key, { label, color }]) => {
                  const school = magicSkills[key as keyof typeof magicSkills];
                  const diceSize = getDiceForSkill(school.skill);
                  const preview = school.talent > 0 ? `${school.talent}d${diceSize}` : '--';
                  return (
                    <div key={key} className="border border-gray-600 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium" style={{ color }}>{label}</label>
                        <span className="text-sm font-bold text-white">{preview}</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Talent (dice)</label>
                          <select
                            value={school.talent}
                            onChange={(e) => setMagicSkills({
                              ...magicSkills,
                              [key]: { ...school, talent: parseInt(e.target.value) }
                            })}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm"
                          >
                            {[0,1,2,3,4,5,6,7,8].map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Skill (die size)</label>
                          <select
                            value={school.skill}
                            onChange={(e) => setMagicSkills({
                              ...magicSkills,
                              [key]: { ...school, skill: parseInt(e.target.value) }
                            })}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm"
                          >
                            {[
                              { v: 0, l: 'd4' }, { v: 1, l: 'd6' }, { v: 2, l: 'd8' },
                              { v: 3, l: 'd10' }, { v: 4, l: 'd12' }, { v: 5, l: 'd16' },
                              { v: 6, l: 'd20' }, { v: 7, l: 'd24' }, { v: 8, l: 'd30' },
                            ].map(({ v, l }) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">Mitigation</h3>
              <p className="text-sm text-gray-400 mb-3">Set to 25+ for immunity</p>
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

            {/* Known Spells */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Known Spells</h3>
                <Button onClick={() => setShowSpellSelector(true)} variant="accent">Add Spell from Compendium</Button>
              </div>
              {knownSpells.length > 0 ? (
                <div className="space-y-3">
                  {knownSpells.map((spell, index) => (
                    <div key={index} className="border border-gray-600 rounded p-4">
                      {/* Top row: Name, Energy Cost, Type, Remove */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-400">Spell Name</label>
                          <span className="text-purple-300 font-medium">{spell.name}</span>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-400">Energy Cost</label>
                          <input
                            type="number"
                            min="0"
                            value={spell.energyCost}
                            onChange={(e) => updateKnownSpell(index, 'energyCost', parseInt(e.target.value) || 0)}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-400">Type</label>
                          <select
                            value={spell.spellType}
                            onChange={(e) => updateKnownSpell(index, 'spellType', e.target.value)}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                          >
                            <option value="normal">Normal</option>
                            <option value="innate">Innate</option>
                            <option value="unique">Unique</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <Button onClick={() => removeKnownSpell(index)} variant="danger" size="sm">Remove</Button>
                        </div>
                      </div>

                      {/* Expanded fields for innate/unique spells */}
                      {spell.spellType !== 'normal' && (
                        <div className="border-t border-gray-600 pt-4 mt-4">
                          <textarea
                            placeholder="Spell description"
                            value={spell.description || ''}
                            onChange={(e) => updateKnownSpell(index, 'description', e.target.value)}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded mb-4"
                            rows={2}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-400">School</label>
                              <select
                                value={spell.school || 'primal'}
                                onChange={(e) => {
                                  updateKnownSpell(index, 'school', e.target.value);
                                  const firstSub = subschoolMap[e.target.value as keyof typeof subschoolMap]?.[0]?.value || '';
                                  updateKnownSpell(index, 'subschool', firstSub);
                                }}
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                              >
                                <option value="primal">Primal</option>
                                <option value="black">Black</option>
                                <option value="white">White</option>
                                <option value="mysticism">Mysticism</option>
                                <option value="meta">Meta</option>
                                <option value="arcane">Arcane</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-400">Subschool</label>
                              <select
                                value={spell.subschool || ''}
                                onChange={(e) => updateKnownSpell(index, 'subschool', e.target.value)}
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                              >
                                {(subschoolMap[spell.school as keyof typeof subschoolMap] || subschoolMap.primal).map((sub) => (
                                  <option key={sub.value} value={sub.value}>{sub.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-400">Roll Formula</label>
                              <input
                                type="text"
                                placeholder="e.g., 3d10"
                                value={spell.roll || ''}
                                onChange={(e) => updateKnownSpell(index, 'roll', e.target.value)}
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-400">Damage</label>
                              <input
                                type="text"
                                placeholder="Damage"
                                value={spell.damage || ''}
                                onChange={(e) => updateKnownSpell(index, 'damage', e.target.value)}
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-400">Extra Damage</label>
                              <input
                                type="text"
                                placeholder="Extra damage"
                                value={spell.damage_extra || '0'}
                                onChange={(e) => updateKnownSpell(index, 'damage_extra', e.target.value)}
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-400">Damage Type</label>
                              <select
                                value={spell.damage_type || 'aetheric'}
                                onChange={(e) => updateKnownSpell(index, 'damage_type', e.target.value)}
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
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
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-400">Target Defense</label>
                              <select
                                value={spell.target_defense || 'evasion'}
                                onChange={(e) => updateKnownSpell(index, 'target_defense', e.target.value)}
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                              >
                                <option value="evasion">Evasion</option>
                                <option value="deflection">Deflection</option>
                                <option value="resilience">Resilience</option>
                                <option value="none">None</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-400">Defense Difficulty</label>
                              <input
                                type="number"
                                min="0"
                                value={spell.defense_difficulty ?? 6}
                                onChange={(e) => updateKnownSpell(index, 'defense_difficulty', parseInt(e.target.value) || 0)}
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-400">Min Range</label>
                              <select
                                value={spell.min_range ?? 0}
                                onChange={(e) => updateKnownSpell(index, 'min_range', parseInt(e.target.value))}
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                              >
                                {getRangeOptions().map(option => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-400">Max Range</label>
                              <select
                                value={spell.max_range ?? 5}
                                onChange={(e) => updateKnownSpell(index, 'max_range', parseInt(e.target.value))}
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                              >
                                {getRangeOptions().map(option => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No spells added. Use "Add Spell from Compendium" to reference existing spells.</p>
              )}
            </div>

            <AbilityEditor
              abilities={abilities as AbilityEntry[]}
              onAbilitiesChange={(updated) => setAbilities(updated as CreatureAbility[])}
            />

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
      {showSpellSelector && (() => {
        let filtered = [...availableSpells];
        if (spellSearch.trim()) {
          const term = spellSearch.toLowerCase().trim();
          filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(term) ||
            s.description?.toLowerCase().includes(term)
          );
        }
        if (spellSchoolFilter !== 'all') {
          filtered = filtered.filter(s => s.school?.toLowerCase() === spellSchoolFilter);
        }
        if (spellSubschoolFilter !== 'all') {
          filtered = filtered.filter(s => s.subschool?.toLowerCase() === spellSubschoolFilter);
        }
        if (spellCheckFilter !== 'all') {
          filtered = filtered.filter(s => s.checkToCast === parseInt(spellCheckFilter));
        }

        const schools = [...new Set(availableSpells.map((s: any) => s.school?.toLowerCase()).filter(Boolean))].sort() as string[];
        const filteredSubschools = spellSchoolFilter !== 'all'
          ? [...new Set(availableSpells.filter((s: any) => s.school?.toLowerCase() === spellSchoolFilter).map((s: any) => s.subschool?.toLowerCase()).filter(Boolean))].sort() as string[]
          : [];
        const checkValues = [...new Set(availableSpells.map((s: any) => s.checkToCast).filter((v: any) => v != null))].sort((a, b) => a - b) as number[];

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Select Spell to Add</h3>
                <Button onClick={() => { setShowSpellSelector(false); setSpellSearch(''); setSpellSchoolFilter('all'); setSpellSubschoolFilter('all'); setSpellCheckFilter('all'); }} variant="ghost">✕</Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search spells..."
                  value={spellSearch}
                  onChange={(e) => setSpellSearch(e.target.value)}
                  className="p-2 bg-gray-900 border border-gray-600 rounded text-sm"
                />
                <select
                  value={spellSchoolFilter}
                  onChange={(e) => { setSpellSchoolFilter(e.target.value); setSpellSubschoolFilter('all'); }}
                  className="p-2 bg-gray-900 border border-gray-600 rounded text-sm"
                >
                  <option value="all">All Schools</option>
                  {schools.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <select
                  value={spellSubschoolFilter}
                  onChange={(e) => setSpellSubschoolFilter(e.target.value)}
                  className="p-2 bg-gray-900 border border-gray-600 rounded text-sm"
                  disabled={spellSchoolFilter === 'all'}
                >
                  <option value="all">All Subschools</option>
                  {filteredSubschools.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <select
                  value={spellCheckFilter}
                  onChange={(e) => setSpellCheckFilter(e.target.value)}
                  className="p-2 bg-gray-900 border border-gray-600 rounded text-sm"
                >
                  <option value="all">All RC</option>
                  {checkValues.map(v => (
                    <option key={v} value={v}>RC {v}</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-gray-400 mb-2">{filtered.length} spell{filtered.length !== 1 ? 's' : ''}</div>

              <div className="overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((spell) => (
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
                        <p>RC: {spell.checkToCast} • Damage: {spell.damage} • Range: {spell.range}</p>
                        {spell.charge && <p className="mt-1"><strong>Overcharge:</strong> {spell.charge}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {filtered.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>{availableSpells.length === 0 ? 'No spells available. Loading...' : 'No spells match your filters.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Monster File Browser Modal */}
      {showMonsterBrowser && (() => {
        const categories = Object.keys(monsterFiles).sort();
        let allEntries: { category: string; filename: string; name: string; tier: string }[] = [];
        const catsToShow = monsterCategoryFilter === 'all' ? categories : [monsterCategoryFilter];
        for (const cat of catsToShow) {
          if (monsterFiles[cat]) {
            allEntries.push(...monsterFiles[cat].map(f => ({ ...f, category: cat })));
          }
        }
        if (monsterSearch.trim()) {
          const term = monsterSearch.toLowerCase().trim();
          allEntries = allEntries.filter(e => e.name.toLowerCase().includes(term));
        }

        const tierColors: Record<string, string> = {
          minion: 'var(--color-cloud)',
          grunt: 'var(--color-stormy)',
          standard: 'var(--color-white)',
          champion: 'var(--color-old-gold)',
          elite: 'var(--color-sat-purple)',
          legend: '#d4af37',
          mythic: '#ff6b35',
        };

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Edit Creature File</h3>
                <Button onClick={() => { setShowMonsterBrowser(false); setMonsterSearch(''); setMonsterCategoryFilter('all'); }} variant="ghost">✕</Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search creatures..."
                  value={monsterSearch}
                  onChange={(e) => setMonsterSearch(e.target.value)}
                  className="p-2 bg-gray-900 border border-gray-600 rounded text-sm"
                />
                <select
                  value={monsterCategoryFilter}
                  onChange={(e) => setMonsterCategoryFilter(e.target.value)}
                  className="p-2 bg-gray-900 border border-gray-600 rounded text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-gray-400 mb-2">{allEntries.length} creature{allEntries.length !== 1 ? 's' : ''}</div>

              <div className="overflow-y-auto flex-1">
                {monsterCategoryFilter === 'all' ? (
                  // Grouped by category
                  categories.filter(cat => {
                    const entries = monsterFiles[cat] || [];
                    if (!monsterSearch.trim()) return entries.length > 0;
                    return entries.some(e => e.name.toLowerCase().includes(monsterSearch.toLowerCase().trim()));
                  }).map(cat => {
                    let entries = monsterFiles[cat] || [];
                    if (monsterSearch.trim()) {
                      const term = monsterSearch.toLowerCase().trim();
                      entries = entries.filter(e => e.name.toLowerCase().includes(term));
                    }
                    return (
                      <div key={cat} className="mb-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-stormy)' }}>
                          {cat} ({entries.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {entries.map(entry => (
                            <button
                              key={entry.filename}
                              onClick={() => loadMonsterFile(cat, entry.filename)}
                              className="text-left p-3 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-white">{entry.name}</span>
                                <span className="text-xs capitalize px-2 py-0.5 rounded" style={{ color: tierColors[entry.tier] || 'var(--color-cloud)', backgroundColor: 'var(--color-dark-surface)' }}>
                                  {entry.tier}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{entry.filename}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Flat list for single category
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {allEntries.map(entry => (
                      <button
                        key={`${entry.category}-${entry.filename}`}
                        onClick={() => loadMonsterFile(entry.category, entry.filename)}
                        className="text-left p-3 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white">{entry.name}</span>
                          <span className="text-xs capitalize px-2 py-0.5 rounded" style={{ color: tierColors[entry.tier] || 'var(--color-cloud)', backgroundColor: 'var(--color-dark-surface)' }}>
                            {entry.tier}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{entry.filename}</span>
                      </button>
                    ))}
                  </div>
                )}

                {allEntries.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>{Object.keys(monsterFiles).length === 0 ? 'Loading monster files...' : 'No creatures match your filters.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default DevCreatureDesigner;