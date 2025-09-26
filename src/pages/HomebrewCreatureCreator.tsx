import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import type { CreatureMovement } from '../types/creature';

interface CreatureAction {
  name: string;
  cost: number;
  type: 'attack' | 'spell' | 'utility' | 'movement';
  magic: boolean;
  description: string;
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
    reaction?: boolean;
    foundry_icon?: string;
  };
}

interface CreatureReaction {
  name: string;
  cost: number;
  trigger: string;
  description: string;
}

interface CreatureTrait {
  name: string;
  description: string;
}

const defaultCreatureMovement: CreatureMovement = {
  walk: 5,
  climb: 0,
  swim: 0,
  fly: 0,
};

const normalizeMovement = (
  movement?: Partial<CreatureMovement> | number | null
): CreatureMovement => {
  if (movement == null) {
    return { ...defaultCreatureMovement };
  }

  if (typeof movement === 'number') {
    return {
      walk: movement,
      climb: 0,
      swim: 0,
      fly: 0,
    };
  }

  return {
    walk: typeof movement.walk === 'number' ? Math.max(0, movement.walk) : 0,
    climb: typeof movement.climb === 'number' ? Math.max(0, movement.climb) : 0,
    swim: typeof movement.swim === 'number' ? Math.max(0, movement.swim) : 0,
    fly: typeof movement.fly === 'number' ? Math.max(0, movement.fly) : 0,
  };
};

type ResourceState = {
  health: { max: number; current: number };
  energy: { max: number; current: number; recovery: number };
  resolve: { max: number; current: number; recovery: number };
  movement: CreatureMovement;
};

const defaultResourceState: ResourceState = {
  health: { max: 15, current: 15 },
  energy: { max: 5, current: 5, recovery: 2 },
  resolve: { max: 10, current: 10, recovery: 1 },
  movement: { ...defaultCreatureMovement },
};

const HomebrewCreatureCreator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

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
    status: 'private' as 'draft' | 'private' | 'published',
    tags: [] as string[],
    source: '',
    balanceNotes: '',
  });

  // Resources
  const [resources, setResources] = useState<ResourceState>(
    {
      health: { ...defaultResourceState.health },
      energy: { ...defaultResourceState.energy },
      resolve: { ...defaultResourceState.resolve },
      movement: { ...defaultCreatureMovement },
    }
  );

  // Attributes
  const [attributes, setAttributes] = useState({
    physique: { talent: 1 },
    finesse: { talent: 1 },
    mind: { talent: 1 },
    knowledge: { talent: 1 },
    social: { talent: 1 },
  });

  // Skills
  const [skills, setSkills] = useState({
    fitness: 0,
    deflection: 0,
    might: 0,
    endurance: 0,
    evasion: 0,
    stealth: 0,
    coordination: 0,
    thievery: 0,
    resilience: 0,
    concentration: 0,
    senses: 0,
    logic: 0,
    wildcraft: 0,
    academics: 0,
    magic: 0,
    medicine: 0,
    expression: 0,
    presence: 0,
    insight: 0,
    persuasion: 0,
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

  // Combat abilities
  const [actions, setActions] = useState<CreatureAction[]>([]);
  const [reactions, setReactions] = useState<CreatureReaction[]>([]);
  const [traits, setTraits] = useState<CreatureTrait[]>([]);
  const [spellNames, setSpellNames] = useState<string[]>([]);

  // Custom spells for creatures
  const [customSpells, setCustomSpells] = useState<any[]>([]);
  const [availableSpells, setAvailableSpells] = useState<any[]>([]);

  // Spell filtering
  const [spellFilters, setSpellFilters] = useState({
    school: '',
    subschool: '',
    maxCastRC: 20,
  });

  // Form helpers
  const [newLanguage, setNewLanguage] = useState('');
  const [newLootItem, setNewLootItem] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newSpellName, setNewSpellName] = useState('');

  useEffect(() => {
    if (id) {
      fetchCreature();
    }
    fetchAvailableSpells();
  }, [id]);

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

  const fetchCreature = async () => {
    try {
      const response = await fetch(`/api/creatures/${id}`);
      if (!response.ok) throw new Error('Failed to fetch creature');

      const creature = await response.json();

      const resolvedResources: ResourceState = {
        health: creature.health ? { ...creature.health } : { ...defaultResourceState.health },
        energy: creature.energy ? { ...creature.energy } : { ...defaultResourceState.energy },
        resolve: creature.resolve ? { ...creature.resolve } : { ...defaultResourceState.resolve },
        movement: normalizeMovement(creature.movement || creature.resources?.movement),
      };

      // Populate form with existing data
      setCreatureData({
        name: creature.name,
        description: creature.description,
        tactics: creature.tactics,
        tier: creature.tier,
        type: creature.type,
        size: creature.size,
        challenge_rating: creature.challenge_rating,
        languages: creature.languages || [],
        loot: creature.loot || [],
        status: creature.status || 'draft',
        tags: creature.tags || [],
        source: creature.source || '',
        balanceNotes: creature.balanceNotes || '',
      });

      setResources({
        health: { ...resolvedResources.health },
        energy: { ...resolvedResources.energy },
        resolve: { ...resolvedResources.resolve },
        movement: { ...resolvedResources.movement },
      });
      setAttributes(creature.attributes || attributes);
      setSkills(creature.skills || skills);
      setMitigation(creature.mitigation || mitigation);
      setDetections(creature.detections || detections);
      setActions(creature.actions || []);
      setReactions(creature.reactions || []);
      setTraits(creature.traits || []);

      // Handle spell names for editing
      if (creature.spells && creature.spells.length > 0) {
        const spellNames = creature.spells.map((spell: any) => spell.name || spell);
        setSpellNames(spellNames);
      }
    } catch (err) {
      showError('Failed to load creature for editing');
      navigate('/homebrew/creatures');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      showError('You must be logged in to create creatures');
      return;
    }

    if (!creatureData.name.trim()) {
      showError('Creature name is required');
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        ...creatureData,
        health: resources.health,
        energy: resources.energy,
        resolve: resources.resolve,
        movement: { ...resources.movement },
        attributes,
        skills,
        mitigation,
        detections,
        actions,
        reactions,
        traits,
        spellNames: spellNames.length > 0 ? spellNames : undefined,
        customSpells: customSpells.length > 0 ? customSpells : undefined,
        isHomebrew: true,
      };

      const url = id ? `/api/homebrew/creatures/${id}` : '/api/homebrew/creatures';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save creature');
      }

      const savedCreature = await response.json();
      showSuccess(`Creature ${id ? 'updated' : 'created'} successfully!`);
      navigate(`/bestiary/${savedCreature._id}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save creature');
    } finally {
      setSaving(false);
    }
  };

  const addAction = () => {
    setActions([
      ...actions,
      {
        name: '',
        cost: 0,
        type: 'attack',
        magic: false,
        description: '',
      },
    ]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...actions];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!newActions[index][parent as keyof CreatureAction]) {
        (newActions[index] as any)[parent] = {};
      }
      ((newActions[index] as any)[parent] as any)[child] = value;
    } else {
      (newActions[index] as any)[field] = value;
    }
    setActions(newActions);
  };

  const addReaction = () => {
    setReactions([...reactions, { name: '', cost: 1, trigger: '', description: '' }]);
  };

  const removeReaction = (index: number) => {
    setReactions(reactions.filter((_, i) => i !== index));
  };

  const updateReaction = (index: number, field: string, value: any) => {
    const newReactions = [...reactions];
    (newReactions[index] as any)[field] = value;
    setReactions(newReactions);
  };

  const addTrait = () => {
    setTraits([...traits, { name: '', description: '' }]);
  };

  const removeTrait = (index: number) => {
    setTraits(traits.filter((_, i) => i !== index));
  };

  const updateTrait = (index: number, field: string, value: string) => {
    const newTraits = [...traits];
    (newTraits[index] as any)[field] = value;
    setTraits(newTraits);
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !creatureData.languages.includes(newLanguage.trim())) {
      setCreatureData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setCreatureData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== language),
    }));
  };

  const addLootItem = () => {
    if (newLootItem.trim()) {
      setCreatureData((prev) => ({
        ...prev,
        loot: [...prev.loot, newLootItem.trim()],
      }));
      setNewLootItem('');
    }
  };

  const removeLootItem = (index: number) => {
    setCreatureData((prev) => ({
      ...prev,
      loot: prev.loot.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !creatureData.tags.includes(newTag.trim())) {
      setCreatureData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setCreatureData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addSpell = () => {
    if (newSpellName.trim() && !spellNames.includes(newSpellName.trim())) {
      setSpellNames([...spellNames, newSpellName.trim()]);
      setNewSpellName('');
    }
  };

  const removeSpell = (spellName: string) => {
    setSpellNames(spellNames.filter((name) => name !== spellName));
  };

  const addCustomSpell = () => {
    setCustomSpells([
      ...customSpells,
      {
        name: '',
        energy_cost: 1,
        roll: '',
        damage: '',
        damage_extra: '',
        damage_type: 'aether',
        target_defense: 'evasion',
        defense_difficulty: 6,
        min_range: 1,
        max_range: 5,
        description: '',
      },
    ]);
  };

  const removeCustomSpell = (index: number) => {
    setCustomSpells(customSpells.filter((_, i) => i !== index));
  };

  const updateCustomSpell = (index: number, field: string, value: any) => {
    const newSpells = [...customSpells];
    (newSpells[index] as any)[field] = value;
    setCustomSpells(newSpells);
  };

  const addExistingSpell = (spellId: string) => {
    const spell = availableSpells.find((s) => s._id === spellId);
    if (spell && !spellNames.includes(spell.name)) {
      setSpellNames([...spellNames, spell.name]);
    }
  };

  // Get filtered spells based on current filters
  const getFilteredSpells = () => {
    return availableSpells.filter((spell) => {
      const schoolMatch = !spellFilters.school || spell.school === spellFilters.school;
      const subschoolMatch = !spellFilters.subschool || spell.subschool === spellFilters.subschool;
      const castRCMatch = !spell.cast_rc || spell.cast_rc <= spellFilters.maxCastRC;

      return schoolMatch && subschoolMatch && castRCMatch;
    });
  };

  // Get unique schools from available spells
  const getUniqueSchools = () => {
    const schools = [...new Set(availableSpells.map((spell) => spell.school))].filter(Boolean);
    return schools.sort();
  };

  // Get unique subschools from available spells (filtered by school if selected)
  const getUniqueSubschools = () => {
    const spellsToCheck = spellFilters.school
      ? availableSpells.filter((spell) => spell.school === spellFilters.school)
      : availableSpells;
    const subschools = [...new Set(spellsToCheck.map((spell) => spell.subschool))].filter(Boolean);
    return subschools.sort();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const stepTitles = [
    'Basic Information',
    'Resources & Stats',
    'Skills & Attributes',
    'Defenses',
    'Actions & Abilities',
    'Review & Publish',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            color: 'var(--color-white)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}
        >
          {id ? 'Edit' : 'Create'} Homebrew Creature
        </h1>
        <p style={{ color: 'var(--color-cloud)', fontSize: '1.125rem' }}>
          Design a custom creature for your campaigns
        </p>
      </div>

      {/* Step Indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          gap: '1rem',
        }}
      >
        {stepTitles.map((title, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setCurrentStep(index + 1)}
          >
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor:
                  currentStep > index
                    ? 'var(--color-old-gold)'
                    : currentStep === index + 1
                      ? 'var(--color-sat-purple)'
                      : 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}
            >
              {index + 1}
            </div>
            <span
              style={{
                color: currentStep === index + 1 ? 'var(--color-white)' : 'var(--color-cloud)',
                fontSize: '0.75rem',
                textAlign: 'center',
                maxWidth: '80px',
              }}
            >
              {title}
            </span>
          </div>
        ))}
      </div>

      <Card variant="default">
        <CardBody style={{ padding: '2rem' }}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div>
              <h2
                style={{ color: 'var(--color-white)', fontSize: '1.5rem', marginBottom: '1.5rem' }}
              >
                Basic Information
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--color-white)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Creature Name *
                  </label>
                  <input
                    type="text"
                    value={creatureData.name}
                    onChange={(e) => setCreatureData((prev) => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-white)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Challenge Rating
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={creatureData.challenge_rating}
                    onChange={(e) =>
                      setCreatureData((prev) => ({
                        ...prev,
                        challenge_rating: parseInt(e.target.value) || 1,
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--color-white)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Type
                  </label>
                  <select
                    value={creatureData.type}
                    onChange={(e) =>
                      setCreatureData((prev) => ({ ...prev, type: e.target.value as any }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  >
                    <option value="humanoid">Humanoid</option>
                    <option value="monster">Monster</option>
                    <option value="fiend">Fiend</option>
                    <option value="undead">Undead</option>
                    <option value="divine">Divine</option>
                    <option value="construct">Construct</option>
                    <option value="plantoid">Plantoid</option>
                    <option value="fey">Fey</option>
                    <option value="elemental">Elemental</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-white)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Tier
                  </label>
                  <select
                    value={creatureData.tier}
                    onChange={(e) =>
                      setCreatureData((prev) => ({ ...prev, tier: e.target.value as any }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  >
                    <option value="minion">Minion</option>
                    <option value="grunt">Grunt</option>
                    <option value="standard">Foe</option>
                    <option value="champion">Champion</option>
                    <option value="elite">Elite</option>
                    <option value="legend">Legend</option>
                    <option value="mythic">Mythic</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-white)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Size
                  </label>
                  <select
                    value={creatureData.size}
                    onChange={(e) =>
                      setCreatureData((prev) => ({ ...prev, size: e.target.value as any }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  >
                    <option value="tiny">Tiny</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="huge">Huge</option>
                    <option value="gargantuan">Gargantuan</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{ color: 'var(--color-white)', display: 'block', marginBottom: '0.5rem' }}
                >
                  Description *
                </label>
                <textarea
                  value={creatureData.description}
                  onChange={(e) =>
                    setCreatureData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-dark-surface)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                    color: 'var(--color-white)',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{ color: 'var(--color-white)', display: 'block', marginBottom: '0.5rem' }}
                >
                  Tactics
                </label>
                <textarea
                  value={creatureData.tactics}
                  onChange={(e) =>
                    setCreatureData((prev) => ({ ...prev, tactics: e.target.value }))
                  }
                  rows={3}
                  placeholder="How does this creature fight? What are its strategies?"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-dark-surface)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                    color: 'var(--color-white)',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Resources & Stats */}
          {currentStep === 2 && (
            <div>
              <h2
                style={{ color: 'var(--color-white)', fontSize: '1.5rem', marginBottom: '1.5rem' }}
              >
                Resources & Stats
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--color-white)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Max Health
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={resources.health.max}
                    onChange={(e) =>
                      setResources((prev) => ({
                        ...prev,
                        health: {
                          ...prev.health,
                          max: parseInt(e.target.value) || 1,
                          current: parseInt(e.target.value) || 1,
                        },
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-white)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Max Energy
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={resources.energy.max}
                    onChange={(e) =>
                      setResources((prev) => ({
                        ...prev,
                        energy: {
                          ...prev.energy,
                          max: parseInt(e.target.value) || 1,
                          current: parseInt(e.target.value) || 1,
                        },
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-white)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Max Resolve
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={resources.resolve.max}
                    onChange={(e) =>
                      setResources((prev) => ({
                        ...prev,
                        resolve: {
                          ...prev.resolve,
                          max: parseInt(e.target.value) || 1,
                          current: parseInt(e.target.value) || 1,
                        },
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-white)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Movement Speeds
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Walk
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={resources.movement.walk}
                        onChange={(e) => {
                          const value = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setResources((prev) => ({
                            ...prev,
                            movement: {
                              ...prev.movement,
                              walk: value,
                            },
                          }));
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Climb
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={resources.movement.climb}
                        onChange={(e) => {
                          const value = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setResources((prev) => ({
                            ...prev,
                            movement: {
                              ...prev.movement,
                              climb: value,
                            },
                          }));
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Swim
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={resources.movement.swim}
                        onChange={(e) => {
                          const value = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setResources((prev) => ({
                            ...prev,
                            movement: {
                              ...prev.movement,
                              swim: value,
                            },
                          }));
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Fly
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={resources.movement.fly}
                        onChange={(e) => {
                          const value = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setResources((prev) => ({
                            ...prev,
                            movement: {
                              ...prev.movement,
                              fly: value,
                            },
                          }));
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      color: 'var(--color-white)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Energy Recovery
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={resources.energy.recovery}
                    onChange={(e) =>
                      setResources((prev) => ({
                        ...prev,
                        energy: {
                          ...prev.energy,
                          recovery: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-white)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Resolve Recovery
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={resources.resolve.recovery}
                    onChange={(e) =>
                      setResources((prev) => ({
                        ...prev,
                        resolve: {
                          ...prev.resolve,
                          recovery: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Skills & Attributes */}
          {currentStep === 3 && (
            <div>
              <h2
                style={{ color: 'var(--color-white)', fontSize: '1.5rem', marginBottom: '1.5rem' }}
              >
                Attributes & Skills
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '1rem',
                  marginBottom: '2rem',
                }}
              >
                {Object.entries(attributes).map(([attr, value]) => (
                  <div key={attr} style={{ textAlign: 'center' }}>
                    <label
                      style={{
                        color: 'var(--color-white)',
                        display: 'block',
                        marginBottom: '0.5rem',
                        textTransform: 'capitalize',
                        fontWeight: 'bold',
                      }}
                    >
                      {attr}
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                      {[1, 2, 3, 4].map((talentPosition) => {
                        const isFilled = value.talent >= talentPosition;
                        const canToggleOn = !isFilled && value.talent === talentPosition - 1;
                        const canToggleOff = isFilled && talentPosition === value.talent;

                        return (
                          <button
                            key={talentPosition}
                            type="button"
                            onClick={() => {
                              if (isFilled && canToggleOff) {
                                // Turn off the star (but not below 1)
                                setAttributes((prev) => ({
                                  ...prev,
                                  [attr]: { talent: Math.max(1, talentPosition - 1) },
                                }));
                              } else if (!isFilled && canToggleOn) {
                                // Turn on the star
                                setAttributes((prev) => ({
                                  ...prev,
                                  [attr]: { talent: talentPosition },
                                }));
                              }
                            }}
                            disabled={!canToggleOn && !canToggleOff}
                            style={{
                              width: '1.5rem',
                              height: '1.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: canToggleOn || canToggleOff ? 'pointer' : 'default',
                              opacity: canToggleOn || canToggleOff || isFilled ? 1 : 1,
                              color: isFilled
                                ? 'var(--color-metal-gold)'
                                : 'var(--color-dark-surface)',
                              fontSize: '1.25rem',
                            }}
                            aria-label={`Set talent to ${talentPosition}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill={isFilled ? 'currentColor' : 'none'}
                              stroke="white"
                              strokeWidth="1"
                              strokeOpacity={0.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                {/* Physique Skills */}
                <div>
                  <div style={{ marginBottom: '0.75rem' }}></div>
                  {['fitness', 'deflection', 'might', 'endurance'].map((skill) => (
                    <div key={skill} style={{ marginBottom: '0.75rem' }}>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          textTransform: 'capitalize',
                          fontSize: '0.875rem',
                        }}
                      >
                        {skill}
                      </label>
                      <select
                        value={skills[skill as keyof typeof skills]}
                        onChange={(e) =>
                          setSkills((prev) => ({
                            ...prev,
                            [skill]: parseInt(e.target.value),
                          }))
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          fontSize: '0.875rem',
                        }}
                      >
                        <option value={-1}>None</option>
                        <option value={-2}>d2</option>
                        <option value={0}>d4</option>
                        <option value={1}>d6</option>
                        <option value={2}>d8</option>
                        <option value={3}>d10</option>
                        <option value={4}>d12</option>
                        <option value={5}>d16</option>
                        <option value={6}>d20</option>
                        <option value={7}>d30</option>
                      </select>
                    </div>
                  ))}
                </div>

                {/* Finesse Skills */}
                <div>
                  <div style={{ marginBottom: '0.75rem' }}></div>
                  {['evasion', 'stealth', 'coordination', 'thievery'].map((skill) => (
                    <div key={skill} style={{ marginBottom: '0.75rem' }}>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          textTransform: 'capitalize',
                          fontSize: '0.875rem',
                        }}
                      >
                        {skill}
                      </label>
                      <select
                        value={skills[skill as keyof typeof skills]}
                        onChange={(e) =>
                          setSkills((prev) => ({
                            ...prev,
                            [skill]: parseInt(e.target.value),
                          }))
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          fontSize: '0.875rem',
                        }}
                      >
                        <option value={-1}>None</option>
                        <option value={-2}>d2</option>
                        <option value={0}>d4</option>
                        <option value={1}>d6</option>
                        <option value={2}>d8</option>
                        <option value={3}>d10</option>
                        <option value={4}>d12</option>
                        <option value={5}>d16</option>
                        <option value={6}>d20</option>
                        <option value={7}>d30</option>
                      </select>
                    </div>
                  ))}
                </div>

                {/* Mind Skills */}
                <div>
                  <div style={{ marginBottom: '0.75rem' }}></div>
                  {['resilience', 'concentration', 'senses', 'logic'].map((skill) => (
                    <div key={skill} style={{ marginBottom: '0.75rem' }}>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          textTransform: 'capitalize',
                          fontSize: '0.875rem',
                        }}
                      >
                        {skill}
                      </label>
                      <select
                        value={skills[skill as keyof typeof skills]}
                        onChange={(e) =>
                          setSkills((prev) => ({
                            ...prev,
                            [skill]: parseInt(e.target.value),
                          }))
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          fontSize: '0.875rem',
                        }}
                      >
                        <option value={-1}>None</option>
                        <option value={-2}>d2</option>
                        <option value={0}>d4</option>
                        <option value={1}>d6</option>
                        <option value={2}>d8</option>
                        <option value={3}>d10</option>
                        <option value={4}>d12</option>
                        <option value={5}>d16</option>
                        <option value={6}>d20</option>
                        <option value={7}>d30</option>
                      </select>
                    </div>
                  ))}
                </div>

                {/* Knowledge Skills */}
                <div>
                  <div style={{ marginBottom: '0.75rem' }}></div>
                  {['wildcraft', 'academics', 'magic', 'medicine'].map((skill) => (
                    <div key={skill} style={{ marginBottom: '0.75rem' }}>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          textTransform: 'capitalize',
                          fontSize: '0.875rem',
                        }}
                      >
                        {skill}
                      </label>
                      <select
                        value={skills[skill as keyof typeof skills]}
                        onChange={(e) =>
                          setSkills((prev) => ({
                            ...prev,
                            [skill]: parseInt(e.target.value),
                          }))
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          fontSize: '0.875rem',
                        }}
                      >
                        <option value={-1}>None</option>
                        <option value={-2}>d2</option>
                        <option value={0}>d4</option>
                        <option value={1}>d6</option>
                        <option value={2}>d8</option>
                        <option value={3}>d10</option>
                        <option value={4}>d12</option>
                        <option value={5}>d16</option>
                        <option value={6}>d20</option>
                        <option value={7}>d30</option>
                      </select>
                    </div>
                  ))}
                </div>

                {/* Social Skills */}
                <div>
                  <div style={{ marginBottom: '0.75rem' }}></div>
                  {['expression', 'presence', 'insight', 'persuasion'].map((skill) => (
                    <div key={skill} style={{ marginBottom: '0.75rem' }}>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          textTransform: 'capitalize',
                          fontSize: '0.875rem',
                        }}
                      >
                        {skill}
                      </label>
                      <select
                        value={skills[skill as keyof typeof skills]}
                        onChange={(e) =>
                          setSkills((prev) => ({
                            ...prev,
                            [skill]: parseInt(e.target.value),
                          }))
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          fontSize: '0.875rem',
                        }}
                      >
                        <option value={-1}>None</option>
                        <option value={-2}>d2</option>
                        <option value={0}>d4</option>
                        <option value={1}>d6</option>
                        <option value={2}>d8</option>
                        <option value={3}>d10</option>
                        <option value={4}>d12</option>
                        <option value={5}>d16</option>
                        <option value={6}>d20</option>
                        <option value={7}>d30</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Defenses */}
          {currentStep === 4 && (
            <div>
              <h2
                style={{ color: 'var(--color-white)', fontSize: '1.5rem', marginBottom: '1.5rem' }}
              >
                Defenses & Detection
              </h2>

              <h3
                style={{
                  color: 'var(--color-old-gold)',
                  fontSize: '1.25rem',
                  marginBottom: '1rem',
                }}
              >
                Damage Mitigation
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  marginBottom: '2rem',
                }}
              >
                {Object.entries(mitigation).map(([damageType, value]) => (
                  <div key={damageType}>
                    <label
                      style={{
                        color: 'var(--color-white)',
                        display: 'block',
                        marginBottom: '0.5rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {damageType}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={value}
                      onChange={(e) =>
                        setMitigation((prev) => ({
                          ...prev,
                          [damageType]: parseInt(e.target.value) || 0,
                        }))
                      }
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-surface)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                        color: 'var(--color-white)',
                      }}
                    />
                  </div>
                ))}
              </div>

              <h3
                style={{
                  color: 'var(--color-old-gold)',
                  fontSize: '1.25rem',
                  marginBottom: '1rem',
                }}
              >
                Detection Abilities
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {Object.entries(detections).map(([detectionType, value]) => (
                  <div key={detectionType}>
                    <label
                      style={{
                        color: 'var(--color-white)',
                        display: 'block',
                        marginBottom: '0.5rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {detectionType.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="8"
                      value={value}
                      onChange={(e) =>
                        setDetections((prev) => ({
                          ...prev,
                          [detectionType]: parseInt(e.target.value) || 0,
                        }))
                      }
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-surface)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                        color: 'var(--color-white)',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Actions & Abilities */}
          {currentStep === 5 && (
            <div>
              <h2
                style={{ color: 'var(--color-white)', fontSize: '1.5rem', marginBottom: '1.5rem' }}
              >
                Actions & Abilities
              </h2>

              {/* Actions */}
              <div style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <h3 style={{ color: 'var(--color-old-gold)', fontSize: '1.25rem', margin: 0 }}>
                    Actions
                  </h3>
                  <Button variant="secondary" onClick={addAction}>
                    + Add Action
                  </Button>
                </div>

                {actions.map((action, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid var(--color-dark-border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <h4 style={{ color: 'var(--color-white)', margin: 0 }}>Action {index + 1}</h4>
                      <Button variant="danger" onClick={() => removeAction(index)}>
                        Remove
                      </Button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          value={action.name}
                          onChange={(e) => updateAction(index, 'name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Energy Cost
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={action.cost}
                          onChange={(e) =>
                            updateAction(index, 'cost', parseInt(e.target.value) || 0)
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Type
                        </label>
                        <select
                          value={action.type}
                          onChange={(e) => updateAction(index, 'type', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        >
                          <option value="attack">Attack</option>
                          <option value="spell">Spell</option>
                          <option value="utility">Utility</option>
                          <option value="movement">Movement</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Description
                      </label>
                      <textarea
                        value={action.description}
                        onChange={(e) => updateAction(index, 'description', e.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={action.magic}
                          onChange={(e) => updateAction(index, 'magic', e.target.checked)}
                        />
                        Magic Ability
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reactions */}
              <div style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <h3 style={{ color: 'var(--color-old-gold)', fontSize: '1.25rem', margin: 0 }}>
                    Reactions
                  </h3>
                  <Button variant="secondary" onClick={addReaction}>
                    + Add Reaction
                  </Button>
                </div>

                {reactions.map((reaction, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid var(--color-dark-border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <h4 style={{ color: 'var(--color-white)', margin: 0 }}>
                        Reaction {index + 1}
                      </h4>
                      <Button variant="danger" onClick={() => removeReaction(index)}>
                        Remove
                      </Button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          value={reaction.name}
                          onChange={(e) => updateReaction(index, 'name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Energy Cost
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={reaction.cost}
                          onChange={(e) =>
                            updateReaction(index, 'cost', parseInt(e.target.value) || 0)
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Trigger
                      </label>
                      <input
                        type="text"
                        value={reaction.trigger}
                        onChange={(e) => updateReaction(index, 'trigger', e.target.value)}
                        placeholder="When does this reaction trigger?"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Description
                      </label>
                      <textarea
                        value={reaction.description}
                        onChange={(e) => updateReaction(index, 'description', e.target.value)}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Traits */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <h3 style={{ color: 'var(--color-old-gold)', fontSize: '1.25rem', margin: 0 }}>
                    Traits
                  </h3>
                  <Button variant="secondary" onClick={addTrait}>
                    + Add Trait
                  </Button>
                </div>

                {traits.map((trait, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid var(--color-dark-border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <h4 style={{ color: 'var(--color-white)', margin: 0 }}>Trait {index + 1}</h4>
                      <Button variant="danger" onClick={() => removeTrait(index)}>
                        Remove
                      </Button>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        value={trait.name}
                        onChange={(e) => updateTrait(index, 'name', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Description
                      </label>
                      <textarea
                        value={trait.description}
                        onChange={(e) => updateTrait(index, 'description', e.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Spells */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <h3 style={{ color: 'var(--color-old-gold)', fontSize: '1.25rem', margin: 0 }}>
                    Spells
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="secondary" onClick={addCustomSpell}>
                      + Create Custom Spell
                    </Button>
                  </div>
                </div>

                {/* Existing Spells Selection */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    border: '1px solid var(--color-dark-border)',
                  }}
                >
                  <h4 style={{ color: 'var(--color-white)', marginBottom: '1rem' }}>
                    Add Existing Spell
                  </h4>

                  {/* Spell Filters */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        School
                      </label>
                      <select
                        value={spellFilters.school}
                        onChange={(e) =>
                          setSpellFilters((prev) => ({
                            ...prev,
                            school: e.target.value,
                            subschool: '', // Reset subschool when school changes
                          }))
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          fontSize: '0.875rem',
                        }}
                      >
                        <option value="">All Schools</option>
                        {getUniqueSchools().map((school) => (
                          <option key={school} value={school}>
                            {school}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        Subschool
                      </label>
                      <select
                        value={spellFilters.subschool}
                        onChange={(e) =>
                          setSpellFilters((prev) => ({ ...prev, subschool: e.target.value }))
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          fontSize: '0.875rem',
                        }}
                      >
                        <option value="">All Subschools</option>
                        {getUniqueSubschools().map((subschool) => (
                          <option key={subschool} value={subschool}>
                            {subschool}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.25rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        Max Cast RC
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={spellFilters.maxCastRC}
                        onChange={(e) =>
                          setSpellFilters((prev) => ({
                            ...prev,
                            maxCastRC: parseInt(e.target.value) || 20,
                          }))
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>
                  </div>

                  {/* Spell Selection */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addExistingSpell(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-surface)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                        color: 'var(--color-white)',
                      }}
                    >
                      <option value="">
                        Select a spell... ({getFilteredSpells().length} available)
                      </option>
                      {getFilteredSpells().map((spell) => (
                        <option key={spell._id} value={spell._id}>
                          {spell.name} ({spell.subschool || spell.school}) - RC:
                          {spell.cast_rc || 'N/A'} - {spell.energy_cost}⚡
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  {(spellFilters.school ||
                    spellFilters.subschool ||
                    spellFilters.maxCastRC < 20) && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <button
                        onClick={() =>
                          setSpellFilters({ school: '', subschool: '', maxCastRC: 20 })
                        }
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                          color: 'var(--color-cloud)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}

                  {/* Known Spells Display */}
                  {spellNames.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h5 style={{ color: 'var(--color-white)', marginBottom: '0.5rem' }}>
                        Known Spells:
                      </h5>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {spellNames.map((spellName, index) => (
                          <span
                            key={index}
                            style={{
                              backgroundColor: 'rgba(85, 65, 130, 0.3)',
                              color: 'var(--color-white)',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            ✨ {spellName}
                            <button
                              onClick={() => removeSpell(spellName)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-sunset)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Spells */}
                {customSpells.map((spell, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid var(--color-dark-border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <h4 style={{ color: 'var(--color-white)', margin: 0 }}>
                        Custom Spell {index + 1}
                      </h4>
                      <Button variant="danger" onClick={() => removeCustomSpell(index)}>
                        Remove
                      </Button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          value={spell.name}
                          onChange={(e) => updateCustomSpell(index, 'name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Energy Cost
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={spell.energy_cost}
                          onChange={(e) =>
                            updateCustomSpell(index, 'energy_cost', parseInt(e.target.value) || 0)
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Roll Required
                        </label>
                        <input
                          type="text"
                          value={spell.roll}
                          onChange={(e) => updateCustomSpell(index, 'roll', e.target.value)}
                          placeholder="e.g., 2d8"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Damage
                        </label>
                        <input
                          type="text"
                          value={spell.damage}
                          onChange={(e) => updateCustomSpell(index, 'damage', e.target.value)}
                          placeholder="e.g., 3"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Extra Damage
                        </label>
                        <input
                          type="text"
                          value={spell.damage_extra}
                          onChange={(e) => updateCustomSpell(index, 'damage_extra', e.target.value)}
                          placeholder="e.g., 2"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Damage Type
                        </label>
                        <select
                          value={spell.damage_type}
                          onChange={(e) => updateCustomSpell(index, 'damage_type', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        >
                          <option value="physical">Physical</option>
                          <option value="heat">Heat</option>
                          <option value="cold">Cold</option>
                          <option value="electric">Electric</option>
                          <option value="dark">Dark</option>
                          <option value="divine">Divine</option>
                          <option value="aether">Aetheric</option>
                          <option value="psychic">Psychic</option>
                          <option value="toxic">Toxic</option>
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Target Defense
                        </label>
                        <select
                          value={spell.target_defense}
                          onChange={(e) =>
                            updateCustomSpell(index, 'target_defense', e.target.value)
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        >
                          <option value="evasion">Evasion</option>
                          <option value="deflection">Deflection</option>
                          <option value="resilience">Resilience</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Defense Difficulty
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={spell.defense_difficulty}
                          onChange={(e) =>
                            updateCustomSpell(
                              index,
                              'defense_difficulty',
                              parseInt(e.target.value) || 6
                            )
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Min Range
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={spell.min_range}
                          onChange={(e) =>
                            updateCustomSpell(index, 'min_range', parseInt(e.target.value) || 0)
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            color: 'var(--color-white)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Max Range
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={spell.max_range}
                          onChange={(e) =>
                            updateCustomSpell(index, 'max_range', parseInt(e.target.value) || 1)
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                            color: 'var(--color-white)',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          color: 'var(--color-white)',
                          display: 'block',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Description
                      </label>
                      <textarea
                        value={spell.description}
                        onChange={(e) => updateCustomSpell(index, 'description', e.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          color: 'var(--color-white)',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Review & Publish */}
          {currentStep === 6 && (
            <div>
              <h2
                style={{ color: 'var(--color-white)', fontSize: '1.5rem', marginBottom: '1.5rem' }}
              >
                Review & Publish
              </h2>

              {/* Languages */}
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    color: 'var(--color-old-gold)',
                    fontSize: '1.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  Languages
                </h3>
                <div
                  style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}
                >
                  {creatureData.languages.map((language, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {language}
                      <button
                        onClick={() => removeLanguage(language)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-sunset)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add language..."
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  />
                  <Button variant="secondary" onClick={addLanguage}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Loot */}
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    color: 'var(--color-old-gold)',
                    fontSize: '1.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  Loot
                </h3>
                <div style={{ marginBottom: '1rem' }}>
                  {creatureData.loot.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        borderRadius: '0.25rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span style={{ color: 'var(--color-white)', fontSize: '0.875rem' }}>
                        {item}
                      </span>
                      <button
                        onClick={() => removeLootItem(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-sunset)',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newLootItem}
                    onChange={(e) => setNewLootItem(e.target.value)}
                    placeholder="Add loot item..."
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  />
                  <Button variant="secondary" onClick={addLootItem}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Spells */}
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    color: 'var(--color-old-gold)',
                    fontSize: '1.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  Known Spells
                </h3>
                <div
                  style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}
                >
                  {spellNames.map((spellName, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: 'rgba(85, 65, 130, 0.3)',
                        color: 'var(--color-white)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      ✨ {spellName}
                      <button
                        onClick={() => removeSpell(spellName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-sunset)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newSpellName}
                    onChange={(e) => setNewSpellName(e.target.value)}
                    placeholder="Add spell name (e.g., 'Burn', 'Shock')..."
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  />
                  <Button variant="secondary" onClick={addSpell}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Publishing Options */}
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    color: 'var(--color-old-gold)',
                    fontSize: '1.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  Publishing Options
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        color: 'var(--color-white)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Status
                    </label>
                    <select
                      value={creatureData.status}
                      onChange={(e) =>
                        setCreatureData((prev) => ({ ...prev, status: e.target.value as any }))
                      }
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'var(--color-dark-surface)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                        color: 'var(--color-white)',
                      }}
                    >
                      <option value="draft">Draft (Only you can see)</option>
                      <option value="private">Private (Only you can see)</option>
                      <option value="published">Published (Public)</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        color: 'var(--color-white)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Source/Campaign
                    </label>
                    <input
                      type="text"
                      value={creatureData.source}
                      onChange={(e) =>
                        setCreatureData((prev) => ({ ...prev, source: e.target.value }))
                      }
                      placeholder="Optional source or campaign name"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'var(--color-dark-surface)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                        color: 'var(--color-white)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    color: 'var(--color-old-gold)',
                    fontSize: '1.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  Tags
                </h3>
                <div
                  style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}
                >
                  {creatureData.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-sunset)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--color-white)',
                    }}
                  />
                  <Button variant="secondary" onClick={addTag}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Balance Notes */}
              <div>
                <label
                  style={{ color: 'var(--color-white)', display: 'block', marginBottom: '0.5rem' }}
                >
                  Balance Notes (Optional)
                </label>
                <textarea
                  value={creatureData.balanceNotes}
                  onChange={(e) =>
                    setCreatureData((prev) => ({ ...prev, balanceNotes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Any notes about balance considerations or design choices..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-dark-surface)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                    color: 'var(--color-white)',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-dark-border)',
            }}
          >
            <Button
              variant="secondary"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                variant="primary"
                onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
              >
                Next
              </Button>
            ) : (
              <Button variant="accent" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : id ? 'Update Creature' : 'Create Creature'}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default HomebrewCreatureCreator;
