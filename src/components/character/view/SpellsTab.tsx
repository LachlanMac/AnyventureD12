// src/components/character/view/SpellsTab.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import Card, { CardHeader, CardBody } from '../../ui/Card';

interface Spell {
  spellId: {
    _id: string;
    name: string;
    description: string;
    duration: string;
    range: string;
    school: string;
    subschool: string;
    checkToCast: number;
    components: string[];
    energy: number;
    damage: number;
    damageType: string;
    concentration: boolean;
    reaction: boolean;
  };
  dateAdded: string;
  favorite: boolean;
  notes: string;
}

interface SpellsTabProps {
  characterId: string;
  spells: Spell[];
  spellSlots: number;
}

const SpellsTab: React.FC<SpellsTabProps> = ({ characterId, spells, spellSlots }) => {
  // Helper function to get color based on spell school
  const getSchoolColor = (school: string) => {
    switch (school?.toLowerCase()) {
      case 'alteration':
        return 'var(--color-sat-purple-faded)';
      case 'black':
        return 'rgba(25, 34, 49, 0.8)';
      case 'divine':
        return 'rgba(215, 183, 64, 0.7)';
      case 'mysticism':
        return 'rgba(85, 65, 130, 0.7)';
      case 'primal':
        return 'rgba(152, 94, 109, 0.7)';
      default:
        return 'var(--color-dark-elevated)';
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Spells
          </h2>
          <p style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
            {spells.length} / {spellSlots} spell slots used
          </p>
        </div>
        <Link to={`/characters/${characterId}/spells`}>
          <Button variant="accent">Manage Spells</Button>
        </Link>
      </div>

      {spells.length === 0 ? (
        <Card variant="default">
          <CardBody>
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  color: 'var(--color-cloud)',
                  marginBottom: '1rem',
                }}
              >
                No spells known yet. Add spells to enhance your magical abilities.
              </div>
              <Link to={`/characters/${characterId}/spells`}>
                <Button variant="secondary">Add Spells</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spells.map((spell) => (
            <Card key={spell.spellId._id} variant="default" hoverEffect={true}>
              <CardHeader
                style={{
                  backgroundColor: getSchoolColor(spell.spellId.school),
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {spell.spellId.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span
                      style={{
                        color: 'var(--color-white)',
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.375rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '0.25rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {spell.spellId.school}
                    </span>
                    <span
                      style={{
                        color: 'var(--color-white)',
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.375rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '0.25rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {spell.spellId.subschool}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <p
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  {spell.spellId.description}
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-cloud)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Range:</span> {spell.spellId.range}
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Duration:</span> {spell.spellId.duration}
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Energy Cost:</span> {spell.spellId.energy}
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Check to Cast:</span> {spell.spellId.checkToCast}
                  </div>
                  {spell.spellId.damage > 0 && (
                    <>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>Damage:</span> {spell.spellId.damage}
                      </div>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>Damage Type:</span>{' '}
                        {spell.spellId.damageType}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Additional spell properties */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                  }}
                >
                  {spell.spellId.concentration && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.375rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        borderRadius: '0.25rem',
                        color: 'var(--color-metal-gold)',
                      }}
                    >
                      Concentration
                    </span>
                  )}
                  
                  {spell.spellId.reaction && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.375rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        borderRadius: '0.25rem',
                        color: 'var(--color-sunset)',
                      }}
                    >
                      Reaction
                    </span>
                  )}
                  
                  {spell.spellId.components && spell.spellId.components.length > 0 && 
                   spell.spellId.components[0] !== "" && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.375rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        borderRadius: '0.25rem',
                        color: 'var(--color-white)',
                      }}
                    >
                      Components: {spell.spellId.components.join(', ')}
                    </span>
                  )}
                </div>
                
                {/* Spell notes if present */}
                {spell.notes && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      color: 'var(--color-cloud)',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Notes:</div>
                    {spell.notes}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpellsTab;