import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import CreatureHeader from '../components/creature/CreatureHeader';
import CreatureStatGrid from '../components/creature/CreatureStatGrid';
import MitigationGrid from '../components/creature/MitigationGrid';
import CreatureActionCard from '../components/creature/CreatureActionCard';
import CreatureReactionCard from '../components/creature/CreatureReactionCard';
import CreatureSpellCard from '../components/creature/CreatureSpellCard';
import CreatureTraitCard from '../components/creature/CreatureTraitCard';
import CreatureSidebar from '../components/creature/CreatureSidebar';
import { useCreature } from '../hooks/useCreature';
import { hasSpells, getAllSpells } from '../utils/creatureUtils';

const CreatureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { creature, loading, error } = useCreature(id);

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
          {/* Header Block with Stats and Mitigations */}
          <Card variant="default">
            <CardBody>
              <CreatureHeader creature={creature} />
              <CreatureStatGrid attributes={creature.attributes} skills={creature.skills} />
              <MitigationGrid mitigation={creature.mitigation} />
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
                    <CreatureActionCard key={index} action={action} />
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
                    <CreatureReactionCard key={index} reaction={reaction} />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Spells */}
          {hasSpells(creature) && (
            <Card variant="default">
              <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
                <h2 style={{ color: 'var(--color-white)', fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
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