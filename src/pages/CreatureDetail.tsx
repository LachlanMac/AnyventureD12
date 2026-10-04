import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import CreatureHeader from '../components/creature/CreatureHeader';
import CreatureStatGrid from '../components/creature/CreatureStatGrid';
import MitigationGrid from '../components/creature/MitigationGrid';
import CreatureCastingAbilities from '../components/creature/CreatureCastingAbilities';
import CreatureActionCard from '../components/creature/CreatureActionCard';
import CreatureReactionCard from '../components/creature/CreatureReactionCard';
import CreatureSpellCard from '../components/creature/CreatureSpellCard';
import CreatureTraitCard from '../components/creature/CreatureTraitCard';
import CreatureSidebar from '../components/creature/CreatureSidebar';
import { useCreature } from '../hooks/useCreatures';
import { getAllSpells } from '../utils/creatureUtils';
import { getDiceForSkill } from '../utils/combatUtils';

const CreatureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: creature, loading, error } = useCreature(id);

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

  const { regular: regularSpells, custom: customSpells } = getAllSpells(creature);

  // Calculate effective mitigation (base + equipment)
  const effectiveMitigation = (() => {
    const base = JSON.parse(JSON.stringify(creature.mitigation || {}));
    if (creature.resolvedEquipment) {
      for (const [, item] of Object.entries(creature.resolvedEquipment) as [string, any][]) {
        if (item?.mitigation) {
          for (const [type, value] of Object.entries(item.mitigation) as [string, any][]) {
            if (!base[type]) base[type] = { min: 0, max: 25 };
            if (typeof value === 'object' && value !== null) {
              base[type].min += value.min || 0;
              base[type].max += value.max || 0;
            } else if (typeof value === 'number') {
              base[type].min += value;
            }
          }
        }
      }
    }
    return base;
  })();

  // Generate weapon attacks from resolved equipment
  const equipmentAttacks = (() => {
    const attacks: any[] = [];
    if (creature.resolvedEquipment) {
      const categoryMap: Record<string, string> = {
        brawling: 'brawling', throwing: 'throwing',
        simpleMelee: 'simpleMeleeWeapons', simpleRanged: 'simpleRangedWeapons',
        complexMelee: 'complexMeleeWeapons', complexRanged: 'complexRangedWeapons',
        simpleMeleeWeapons: 'simpleMeleeWeapons', simpleRangedWeapons: 'simpleRangedWeapons',
        complexMeleeWeapons: 'complexMeleeWeapons', complexRangedWeapons: 'complexRangedWeapons',
      };

      for (const [, item] of Object.entries(creature.resolvedEquipment) as [string, any][]) {
        if (!item || item.type !== 'weapon') continue;
        const rawCat = item.weapon_category || 'simpleMelee';
        const skillKey = categoryMap[rawCat] || rawCat;
        const ws = creature.weaponSkills?.[skillKey] || { talent: 0, skill: 0 };
        const diceSize = getDiceForSkill(ws.skill);
        const rollFormula = ws.talent > 0 ? `${ws.talent}d${diceSize}` : '1d6';
        const primary = item.primary || {};

        attacks.push({
          name: item.name,
          cost: primary.energy || 0,
          type: 'attack',
          magic: false,
          basic: true,
          round: false,
          daily: false,
          spellType: 'normal',
          description: `The ${creature.name} makes an attack with their ${item.name}, dealing ${primary.damage_type || 'physical'} damage.`,
          reaction: false,
          _isEquipmentAttack: true,
          attack: {
            roll: rollFormula,
            damage: primary.damage || '0',
            damage_extra: primary.damage_extra || '0',
            damage_type: primary.damage_type || 'physical',
            category: primary.category || 'slash',
            min_range: primary.min_range || 1,
            max_range: primary.max_range || 1
          }
        });
      }
    }

    // Add unarmed attack if enabled
    if (creature.canUnarmedAttack) {
      const physTalent = creature.attributes?.physique?.talent || 1;
      const fitnessSkill = creature.skills?.fitness?.value || 0;
      const diceSize = getDiceForSkill(fitnessSkill);
      const attackName = creature.unarmedAttackName || 'Unarmed Strike';

      attacks.push({
        name: attackName,
        cost: 0,
        type: 'attack',
        magic: false,
        basic: true,
        round: false,
        daily: false,
        spellType: 'normal',
        description: `The ${creature.name} makes a ${attackName.toLowerCase()} attack, dealing ${physTalent} physical damage per hit.`,
        reaction: false,
        _isEquipmentAttack: true,
        attack: {
          roll: `${physTalent}d${diceSize}`,
          damage: String(physTalent),
          damage_extra: String(physTalent),
          damage_type: 'physical',
          category: 'blunt',
          min_range: 1,
          max_range: 1
        }
      });
    }

    return attacks;
  })();

  // Separate spell-type abilities from regular actions/reactions
  const nonSpellActions = [...equipmentAttacks, ...creature.actions.filter((a: any) => a.type !== 'spell')];
  const nonSpellReactions = creature.reactions.filter((r: any) => r.type !== 'spell');
  const spellActions = creature.actions.filter((a: any) => a.type === 'spell');
  const spellReactions = creature.reactions.filter((r: any) => r.type === 'spell');
  const hasAnySpells = regularSpells.length > 0 || customSpells.length > 0 || spellActions.length > 0 || spellReactions.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/bestiary"
          style={{
            color: 'var(--color-old-gold)',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Bestiary
        </Link>
      </div>

      {/* Variant Navigation */}
      {creature.variants && creature.variants.length > 0 && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-cloud)', fontSize: '0.8rem', marginRight: '0.5rem' }}>Variants:</span>
          <Link
            to={`/bestiary/${creature._id}`}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              backgroundColor: 'rgba(130, 80, 200, 0.3)',
              border: '1px solid rgba(130, 80, 200, 0.5)',
              color: '#b794f4',
            }}
          >
            {creature.name} {creature.variantOf ? '' : '(Base)'}
          </Link>
          {creature.variants.map((v: any) => (
            <Link
              key={v._id}
              to={`/bestiary/${v._id}`}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                textDecoration: 'none',
                backgroundColor: 'rgba(130, 80, 200, 0.1)',
                border: '1px solid rgba(130, 80, 200, 0.3)',
                color: '#b794f4',
              }}
            >
              {v.name}
            </Link>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Stat Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Block with Stats and Mitigations */}
          <Card variant="default">
            <CardBody>
              <CreatureHeader creature={creature} />
              <CreatureStatGrid attributes={creature.attributes} skills={creature.skills} />
              <MitigationGrid mitigation={effectiveMitigation} />
              <CreatureCastingAbilities magicSkills={creature.magicSkills} />
            </CardBody>
          </Card>

          {/* Actions */}
          {nonSpellActions.length > 0 && (
            <Card variant="default">
              <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
                <h2
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    margin: 0,
                  }}
                >
                  Actions
                </h2>
              </CardHeader>
              <CardBody style={{ padding: '0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {nonSpellActions.map((action: any, index: number) => (
                    <CreatureActionCard key={index} action={action} creatureTier={creature.tier} />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Reactions */}
          {nonSpellReactions.length > 0 && (
            <Card variant="default">
              <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
                <h2
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    margin: 0,
                  }}
                >
                  Reactions
                </h2>
              </CardHeader>
              <CardBody style={{ padding: '0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {nonSpellReactions.map((reaction: any, index: number) => (
                    <CreatureReactionCard key={index} reaction={reaction} creatureTier={creature.tier} />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Spells */}
          {hasAnySpells && (
            <Card variant="default">
              <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
                <h2
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    margin: 0,
                  }}
                >
                  Spells
                </h2>
              </CardHeader>
              <CardBody style={{ padding: '0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Regular Spells */}
                  {regularSpells.map((spell) => (
                    <CreatureSpellCard key={spell._id} spell={spell} />
                  ))}

                  {/* Custom Spells */}
                  {customSpells.map((spell, index) => (
                    <CreatureSpellCard key={`custom-${index}`} spell={spell} isCustom />
                  ))}

                  {/* Spell-type Actions */}
                  {spellActions.map((action: any, index: number) => (
                    <CreatureActionCard key={`spell-action-${index}`} action={action} creatureTier={creature.tier} label="Action" />
                  ))}

                  {/* Spell-type Reactions */}
                  {spellReactions.map((reaction: any, index: number) => (
                    <CreatureReactionCard key={`spell-reaction-${index}`} reaction={reaction} creatureTier={creature.tier} label="Reaction" />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Traits */}
          {creature.traits.length > 0 && (
            <Card variant="default">
              <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
                <h2
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    margin: 0,
                  }}
                >
                  Traits
                </h2>
              </CardHeader>
              <CardBody style={{ padding: '0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {creature.traits.map((trait, index) => (
                    <CreatureTraitCard key={index} trait={trait} />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <CreatureSidebar creature={creature} />
      </div>
    </div>
  );
};

export default CreatureDetail;
