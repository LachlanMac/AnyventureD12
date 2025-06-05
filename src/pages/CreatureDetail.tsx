import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import TalentDisplay from '../components/character/TalentDisplay';
import { formatRangeSpan } from '../utils/rangeUtils';

interface CreatureAction {
  name: string;
  cost: number;
  type: string;
  magic?: boolean;
  description: string;
  attack?: {
    roll: string;
    damage: string;
    damage_extra: string;
    damage_type: string;
    secondary_damage?: string;
    secondary_damage_extra?: string;
    secondary_damage_type?: string;
    category: string;
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
    target_defense: string;
    defense_difficulty: number;
    min_range: number;
    max_range: number;
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

interface CreatureSpell {
  _id: string;
  name: string;
  description: string;
  school: string;
  subschool: string;
  checkToCast: number;
  energy: number;
  damage: number;
  damageType?: string;
  range: string;
  duration: string;
  concentration: boolean;
  reaction: boolean;
  components: string[];
}

interface Creature {
  _id: string;
  name: string;
  description: string;
  tactics: string;
  tier: string;
  type: string;
  size: string;
  health: {
    max: number;
    current: number;
  };
  energy: {
    max: number;
    current: number;
    recovery: number;
  };
  resolve: {
    max: number;
    current: number;
    recovery: number;
  };
  movement: number;
  attributes: {
    physique: { talent: number };
    finesse: { talent: number };
    mind: { talent: number };
    knowledge: { talent: number };
    social: { talent: number };
  };
  skills: Record<string, number>;
  mitigation: Record<string, number>;
  immunities: Record<string, boolean>;
  detections: Record<string, number>;
  actions: CreatureAction[];
  reactions: CreatureReaction[];
  traits: CreatureTrait[];
  loot: string[];
  languages: string[];
  challenge_rating: number;
  isHomebrew: boolean;
  source: string;
  spells: CreatureSpell[];
}

const CreatureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [creature, setCreature] = useState<Creature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCreature(id);
    }
  }, [id]);

  const fetchCreature = async (creatureId: string) => {
    try {
      const response = await fetch(`/api/creatures/${creatureId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch creature');
      }
      const data = await response.json();
      setCreature(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    const colors = {
      minion: 'var(--color-cloud)',
      thrall: 'var(--color-old-gold)',
      foe: 'var(--color-sunset)',
      champion: 'var(--color-stormy)',
      elite: 'var(--color-sat-purple)',
      legend: 'var(--color-metal-gold)',
      mythic: '#ff6b35'
    };
    return colors[tier as keyof typeof colors] || 'var(--color-cloud)';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      fiend: '👹',
      undead: '💀',
      divine: '✨',
      monster: '🐲',
      humanoid: '👤',
      construct: '🤖',
      plantoid: '🌿',
      fey: '🧚',
      elemental: '🔥'
    };
    return icons[type as keyof typeof icons] || '❓';
  };

  const damageTypes = ['physical', 'heat', 'cold', 'lightning', 'dark', 'divine', 'aether', 'psychic', 'toxic'];
  
  const getMitigationFormat = (value: number) => {
    if (value === 0) return { half: '0', full: '0' };
    const half = Math.ceil(value / 2);
    return { half: half.toString(), full: value.toString() };
  };

  const getDiceForSkill = (skillLevel: number) => {
    const diceMap = ['4', '6', '8', '10', '12', '16', '20'];
    return diceMap[skillLevel] || '4';
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

  if (error || !creature) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 style={{ color: 'var(--color-white)', fontSize: '1.5rem', marginBottom: '1rem' }}>
            Creature Not Found
          </h1>
          <p style={{ color: 'var(--color-cloud)', marginBottom: '2rem' }}>
            {error || 'The requested creature could not be found.'}
          </p>
          <Link to="/bestiary">
            <Button variant="primary">Back to Bestiary</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/bestiary" 
          style={{ 
            color: 'var(--color-old-gold)', 
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}
        >
          ← Back to Bestiary
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Stat Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Block with Mitigations */}
          <Card variant="default">
            <CardBody>
              {/* Top section with name, tier, health, resolve */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{getTypeIcon(creature.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                    <h1 style={{ 
                      color: 'var(--color-white)', 
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.75rem',
                      fontWeight: 'bold',
                      margin: 0
                    }}>
                      {creature.name}
                    </h1>
                    <span 
                      style={{ 
                        color: getTierColor(creature.tier),
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}
                    >
                      ({creature.tier})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                    <span style={{ color: 'var(--color-cloud)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                      {creature.size} {creature.type}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <TalentDisplay talent={creature.challenge_rating} size="sm" />
                    </div>
                    {creature.isHomebrew && (
                      <span style={{
                        color: 'var(--color-sunset)',
                        fontSize: '0.625rem',
                        fontWeight: 'bold',
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem'
                      }}>
                        HOMEBREW
                      </span>
                    )}
                  </div>
                </div>
                {/* Health, Energy, and Resolve */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-sunset)', fontSize: '0.625rem', fontWeight: 'bold' }}>HEALTH</div>
                    <div style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}>{creature.health.max}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-old-gold)', fontSize: '0.625rem', fontWeight: 'bold' }}>ENERGY</div>
                    <div style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}>{creature.energy.max}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-sat-purple)', fontSize: '0.625rem', fontWeight: 'bold' }}>RESOLVE</div>
                    <div style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}>{creature.resolve.max}</div>
                  </div>
                </div>
              </div>
              
              {/* Skills section */}
              <div style={{ borderTop: '1px solid var(--color-dark-border)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                  {/* Physique Column */}
                  <div style={{ backgroundColor: 'var(--color-dark-elevated)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                    <div style={{ color: 'var(--color-old-gold)', fontSize: '0.625rem', fontWeight: 'bold', marginBottom: '0.375rem' }}>
                      PHYSIQUE
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Fitness</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.physique.talent === -1 ? '-' : `${creature.attributes.physique.talent}d${getDiceForSkill(creature.skills.fitness)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Deflection</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.physique.talent === -1 ? '-' : `${creature.attributes.physique.talent}d${getDiceForSkill(creature.skills.deflection)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Might</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.physique.talent === -1 ? '-' : `${creature.attributes.physique.talent}d${getDiceForSkill(creature.skills.might)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Endurance</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.physique.talent === -1 ? '-' : `${creature.attributes.physique.talent}d${getDiceForSkill(creature.skills.endurance)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Finesse Column */}
                  <div style={{ backgroundColor: 'var(--color-dark-surface)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                    <div style={{ color: 'var(--color-old-gold)', fontSize: '0.625rem', fontWeight: 'bold', marginBottom: '0.375rem' }}>
                      FINESSE
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Evasion</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.finesse.talent === -1 ? '-' : `${creature.attributes.finesse.talent}d${getDiceForSkill(creature.skills.evasion)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Stealth</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.finesse.talent === -1 ? '-' : `${creature.attributes.finesse.talent}d${getDiceForSkill(creature.skills.stealth)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Coordination</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.finesse.talent === -1 ? '-' : `${creature.attributes.finesse.talent}d${getDiceForSkill(creature.skills.coordination)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Thievery</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.finesse.talent === -1 ? '-' : `${creature.attributes.finesse.talent}d${getDiceForSkill(creature.skills.thievery)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mind Column */}
                  <div style={{ backgroundColor: 'var(--color-dark-elevated)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                    <div style={{ color: 'var(--color-old-gold)', fontSize: '0.625rem', fontWeight: 'bold', marginBottom: '0.375rem' }}>
                      MIND
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Resilience</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.mind.talent === -1 ? '-' : `${creature.attributes.mind.talent}d${getDiceForSkill(creature.skills.resilience)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Concentration</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.mind.talent === -1 ? '-' : `${creature.attributes.mind.talent}d${getDiceForSkill(creature.skills.concentration)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Senses</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.mind.talent === -1 ? '-' : `${creature.attributes.mind.talent}d${getDiceForSkill(creature.skills.senses)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Logic</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.mind.talent === -1 ? '-' : `${creature.attributes.mind.talent}d${getDiceForSkill(creature.skills.logic)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Knowledge Column */}
                  <div style={{ backgroundColor: 'var(--color-dark-surface)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                    <div style={{ color: 'var(--color-old-gold)', fontSize: '0.625rem', fontWeight: 'bold', marginBottom: '0.375rem' }}>
                      KNOWLEDGE
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Wildcraft</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.knowledge.talent === -1 ? '-' : `${creature.attributes.knowledge.talent}d${getDiceForSkill(creature.skills.wildcraft)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Academics</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.knowledge.talent === -1 ? '-' : `${creature.attributes.knowledge.talent}d${getDiceForSkill(creature.skills.academics)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Magic</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.knowledge.talent === -1 ? '-' : `${creature.attributes.knowledge.talent}d${getDiceForSkill(creature.skills.magic)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Medicine</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.knowledge.talent === -1 ? '-' : `${creature.attributes.knowledge.talent}d${getDiceForSkill(creature.skills.medicine)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Social Column */}
                  <div style={{ backgroundColor: 'var(--color-dark-elevated)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                    <div style={{ color: 'var(--color-old-gold)', fontSize: '0.625rem', fontWeight: 'bold', marginBottom: '0.375rem' }}>
                      SOCIAL
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Expression</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.social.talent === -1 ? '-' : `${creature.attributes.social.talent}d${getDiceForSkill(creature.skills.expression)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Presence</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.social.talent === -1 ? '-' : `${creature.attributes.social.talent}d${getDiceForSkill(creature.skills.presence)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Insight</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.social.talent === -1 ? '-' : `${creature.attributes.social.talent}d${getDiceForSkill(creature.skills.insight)}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-cloud)' }}>Persuasion</span>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                          {creature.attributes.social.talent === -1 ? '-' : `${creature.attributes.social.talent}d${getDiceForSkill(creature.skills.persuasion)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mitigations section */}
              <div style={{ borderTop: '1px solid var(--color-dark-border)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                  {damageTypes.map((type) => {
                    const mit = getMitigationFormat(creature.mitigation[type] || 0);
                    return (
                      <div key={type}>
                        <div style={{ 
                          color: 'var(--color-cloud)', 
                          fontSize: '0.625rem', 
                          textTransform: 'capitalize',
                          marginBottom: '0.25rem'
                        }}>
                          {type}
                        </div>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          borderRadius: '0.25rem',
                          overflow: 'hidden',
                          height: '1.25rem'
                        }}>
                          <div style={{
                            backgroundColor: 'var(--color-dark-elevated)',
                            color: 'var(--color-cloud)',
                            padding: '0 0.25rem',
                            flex: 1,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {mit.half}
                          </div>
                          <div style={{
                            backgroundColor: 'rgba(85, 65, 130, 0.15)',
                            color: 'var(--color-white)',
                            padding: '0 0.25rem',
                            flex: 1,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {mit.full}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          {creature.actions.length > 0 && (
            <Card variant="default">
              <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
                <h2 style={{ color: 'var(--color-white)', fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
                  Actions
                </h2>
              </CardHeader>
              <CardBody style={{ padding: '0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {creature.actions.map((action, index) => (
                    <div key={index} style={{ 
                      padding: '0.75rem',
                      backgroundColor: action.magic ? 'rgba(85, 65, 130, 0.2)' : 'var(--color-dark-elevated)',
                      borderRadius: '0.25rem',
                      border: action.magic ? '1px solid var(--color-sat-purple)' : '1px solid var(--color-dark-border)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                        <h3 style={{ color: 'var(--color-white)', fontWeight: 'bold', margin: 0, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          {action.name}
                          {action.magic && <span style={{ color: 'var(--color-sat-purple)', fontSize: '0.75rem' }}>✨</span>}
                        </h3>
                        <span style={{ 
                          color: 'var(--color-old-gold)', 
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '0.25rem'
                        }}>
                          {action.cost} Energy
                        </span>
                      </div>
                      <p style={{ color: 'var(--color-cloud)', margin: 0, lineHeight: '1.3', fontSize: '0.75rem' }}>
                        {action.description}
                      </p>
                      {action.attack && (
                        <div style={{ 
                          marginTop: '0.375rem',
                          display: 'flex',
                          gap: '0.75rem',
                          fontSize: '0.75rem',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ color: 'var(--color-white)' }}>
                            <strong>Roll:</strong> {action.attack.roll}
                          </span>
                          <span style={{ color: 'var(--color-white)' }}>
                            <strong>Damage:</strong> {action.attack.damage}{action.attack.damage_extra !== "0" && ` [${action.attack.damage_extra}]`} {action.attack.damage_type}
                          </span>
                          {action.attack.secondary_damage && (
                            <span style={{ color: 'var(--color-white)' }}>
                              + {action.attack.secondary_damage}{action.attack.secondary_damage_extra !== "0" && ` [${action.attack.secondary_damage_extra}]`} {action.attack.secondary_damage_type}
                            </span>
                          )}
                          {(action.attack.max_range > 0 || action.attack.min_range > 0) && (
                            <span style={{ color: 'var(--color-cloud)' }}>
                              Range: {formatRangeSpan(action.attack.min_range, action.attack.max_range, 'weapon')}
                            </span>
                          )}
                        </div>
                      )}
                      {action.spell && (
                        <div style={{ 
                          marginTop: '0.375rem',
                          display: 'flex',
                          gap: '0.75rem',
                          fontSize: '0.75rem',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ color: 'var(--color-white)' }}>
                            <strong>Roll:</strong> {action.spell.roll}
                          </span>
                          {action.spell.damage !== "0" && (
                            <>
                              <span style={{ color: 'var(--color-white)' }}>
                                <strong>Damage:</strong> {action.spell.damage}
                                {action.spell.damage_extra && action.spell.damage_extra !== "0" && ` [${action.spell.damage_extra}]`}
                                {action.spell.damage_type && ` ${action.spell.damage_type}`}
                              </span>
                              {action.spell.secondary_damage && (
                                <span style={{ color: 'var(--color-white)' }}>
                                  + {action.spell.secondary_damage}{action.spell.secondary_damage_extra !== "0" && ` [${action.spell.secondary_damage_extra}]`} {action.spell.secondary_damage_type}
                                </span>
                              )}
                            </>
                          )}
                          {action.spell.target_defense !== "none" && (
                            <span style={{ color: 'var(--color-white)' }}>
                              <strong>Defense:</strong> {action.spell.target_defense} DC {action.spell.defense_difficulty}
                            </span>
                          )}
                          {(action.spell.max_range > 0 || action.spell.min_range > 0) && (
                            <span style={{ color: 'var(--color-cloud)' }}>
                              Range: {formatRangeSpan(action.spell.min_range, action.spell.max_range, 'spell')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Reactions */}
          {creature.reactions.length > 0 && (
            <Card variant="default">
              <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
                <h2 style={{ color: 'var(--color-white)', fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
                  Reactions
                </h2>
              </CardHeader>
              <CardBody style={{ padding: '0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {creature.reactions.map((reaction, index) => (
                    <div key={index} style={{ 
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--color-dark-border)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                        <h3 style={{ color: 'var(--color-white)', fontWeight: 'bold', margin: 0, fontSize: '0.875rem' }}>
                          {reaction.name}
                        </h3>
                        <span style={{ 
                          color: 'var(--color-old-gold)', 
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--color-dark-surface)',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '0.25rem'
                        }}>
                          {reaction.cost} Energy
                        </span>
                      </div>
                      <div style={{ color: 'var(--color-stormy)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <strong>Trigger:</strong> {reaction.trigger}
                      </div>
                      <p style={{ color: 'var(--color-cloud)', margin: 0, lineHeight: '1.3', fontSize: '0.75rem' }}>
                        {reaction.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Spells */}
          {((creature.spells && creature.spells.length > 0) || (creature.customSpells && creature.customSpells.length > 0)) && (
            <Card variant="default">
              <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
                <h2 style={{ color: 'var(--color-white)', fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
                  Spells
                </h2>
              </CardHeader>
              <CardBody style={{ padding: '0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Regular Spells */}
                  {creature.spells && creature.spells.map((spell) => (
                    <div key={spell._id} style={{ 
                      padding: '0.75rem',
                      backgroundColor: 'rgba(85, 65, 130, 0.15)',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--color-sat-purple)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                        <h3 style={{ color: 'var(--color-white)', fontWeight: 'bold', margin: 0, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          {spell.name}
                          <span style={{ color: 'var(--color-sat-purple)', fontSize: '0.75rem' }}>✨</span>
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ 
                            color: 'var(--color-cloud)', 
                            fontSize: '0.625rem',
                            textTransform: 'capitalize'
                          }}>
                            {spell.school} • {spell.subschool}
                          </span>
                          <span style={{ 
                            color: 'var(--color-old-gold)', 
                            fontSize: '0.75rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.25rem'
                          }}>
                            {spell.energy} Energy
                          </span>
                        </div>
                      </div>
                      <p style={{ color: 'var(--color-cloud)', margin: 0, lineHeight: '1.3', fontSize: '0.75rem', marginBottom: '0.375rem' }}>
                        {spell.description}
                      </p>
                      <div style={{ 
                        display: 'flex',
                        gap: '0.75rem',
                        fontSize: '0.75rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ color: 'var(--color-white)' }}>
                          <strong>Cast:</strong> {spell.checkToCast}+
                        </span>
                        {spell.damage > 0 && (
                          <span style={{ color: 'var(--color-white)' }}>
                            <strong>Damage:</strong> {spell.damage} {spell.damageType}
                          </span>
                        )}
                        <span style={{ color: 'var(--color-cloud)' }}>
                          Range: {spell.range}
                        </span>
                        {spell.duration !== 'Instantaneous' && (
                          <span style={{ color: 'var(--color-cloud)' }}>
                            Duration: {spell.duration}
                          </span>
                        )}
                        {spell.concentration && (
                          <span style={{ color: 'var(--color-stormy)' }}>
                            Concentration
                          </span>
                        )}
                        {spell.reaction && (
                          <span style={{ color: 'var(--color-stormy)' }}>
                            Reaction
                          </span>
                        )}
                      </div>
                      {spell.components.length > 0 && (
                        <div style={{ marginTop: '0.25rem', fontSize: '0.625rem', color: 'var(--color-cloud)' }}>
                          <strong>Components:</strong> {spell.components.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Custom Spells */}
                  {creature.customSpells && creature.customSpells.map((spell, index) => (
                    <div key={`custom-${index}`} style={{ 
                      padding: '0.75rem',
                      backgroundColor: 'rgba(85, 65, 130, 0.15)',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--color-sat-purple)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                        <h3 style={{ color: 'var(--color-white)', fontWeight: 'bold', margin: 0, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          {spell.name}
                          <span style={{ color: 'var(--color-sat-purple)', fontSize: '0.75rem' }}>✨</span>
                          <span style={{ 
                            color: 'var(--color-old-gold)', 
                            fontSize: '0.625rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            padding: '0.125rem 0.25rem',
                            borderRadius: '0.25rem'
                          }}>
                            Custom
                          </span>
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ 
                            color: 'var(--color-old-gold)', 
                            fontSize: '0.75rem',
                            backgroundColor: 'var(--color-dark-surface)',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.25rem'
                          }}>
                            {spell.energy_cost} Energy
                          </span>
                        </div>
                      </div>
                      <p style={{ color: 'var(--color-cloud)', margin: 0, lineHeight: '1.3', fontSize: '0.75rem', marginBottom: '0.375rem' }}>
                        {spell.description}
                      </p>
                      <div style={{ 
                        display: 'flex',
                        gap: '0.75rem',
                        fontSize: '0.75rem',
                        flexWrap: 'wrap'
                      }}>
                        {spell.roll && (
                          <span style={{ color: 'var(--color-white)' }}>
                            <strong>Cast:</strong> {spell.roll}
                          </span>
                        )}
                        {spell.damage && (
                          <span style={{ color: 'var(--color-white)' }}>
                            <strong>Damage:</strong> {spell.damage}{spell.damage_extra && spell.damage_extra !== "0" && ` [${spell.damage_extra}]`} {spell.damage_type}
                          </span>
                        )}
                        {spell.target_defense && spell.target_defense !== 'none' && (
                          <span style={{ color: 'var(--color-cloud)' }}>
                            Target: {spell.target_defense} {spell.defense_difficulty}+
                          </span>
                        )}
                        <span style={{ color: 'var(--color-cloud)' }}>
                          Range: {spell.min_range}-{spell.max_range}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Traits */}
          {creature.traits.length > 0 && (
            <Card variant="default">
              <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
                <h2 style={{ color: 'var(--color-white)', fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
                  Traits
                </h2>
              </CardHeader>
              <CardBody style={{ padding: '0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {creature.traits.map((trait, index) => (
                    <div key={index}>
                      <h3 style={{ color: 'var(--color-white)', fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                        {trait.name}
                      </h3>
                      <p style={{ color: 'var(--color-cloud)', margin: 0, lineHeight: '1.3', fontSize: '0.75rem' }}>
                        {trait.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Description */}
          <Card variant="default">
            <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
              <h2 style={{ color: 'var(--color-white)', fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>
                Description
              </h2>
            </CardHeader>
            <CardBody style={{ padding: '0.75rem 1.25rem' }}>
              <p style={{ color: 'var(--color-cloud)', lineHeight: '1.4', margin: 0, fontSize: '0.75rem' }}>
                {creature.description}
              </p>
            </CardBody>
          </Card>

          {/* Tactics */}
          <Card variant="default">
            <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
              <h2 style={{ color: 'var(--color-white)', fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>
                Tactics
              </h2>
            </CardHeader>
            <CardBody style={{ padding: '0.75rem 1.25rem' }}>
              <p style={{ color: 'var(--color-cloud)', lineHeight: '1.4', margin: 0, fontSize: '0.75rem' }}>
                {creature.tactics}
              </p>
            </CardBody>
          </Card>


          {/* Loot */}
          {creature.loot.length > 0 && (
            <Card variant="default">
              <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
                <h2 style={{ color: 'var(--color-white)', fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>
                  Loot
                </h2>
              </CardHeader>
              <CardBody style={{ padding: '0.75rem 1.25rem' }}>
                <ul style={{ color: 'var(--color-cloud)', margin: 0, paddingLeft: '1rem', fontSize: '0.75rem' }}>
                  {creature.loot.map((item, index) => (
                    <li key={index} style={{ marginBottom: '0.125rem' }}>{item}</li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Languages */}
          {creature.languages.length > 0 && (
            <Card variant="default">
              <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
                <h2 style={{ color: 'var(--color-white)', fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>
                  Languages
                </h2>
              </CardHeader>
              <CardBody style={{ padding: '0.75rem 1.25rem' }}>
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
                  {creature.languages.join(', ')}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatureDetail;