import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatRange } from '../utils/rangeUtils';

interface Spell {
  _id: string;
  name: string;
  description: string;
  charge?: string | null;
  duration: string;
  range: number | string;
  school: string;
  subschool: string;
  checkToCast: number;
  components: string[];
  energy: number;
  damage: number;
  damageType: string;
  concentration: boolean;
  reaction: boolean;
}

const SpellDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [spell, setSpell] = useState<Spell | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpell = async () => {
      if (!id) {
        setError('No spell ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/spells/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch spell');
        }
        const spellData = await response.json();
        setSpell(spellData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching spell:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchSpell();
  }, [id]);

  const schoolColors: Record<string, string> = {
    black: 'var(--color-sunset)',
    primal: 'var(--color-old-gold)',
    alteration: 'var(--color-sat-purple)',
    divine: 'var(--color-stormy)',
    mysticism: 'var(--color-evening)',
  };

  const damageTypeColors: Record<string, string> = {
    physical: '#9CA3AF',
    heat: '#EF4444',
    cold: '#3B82F6',
    lightning: '#FBBF24',
    dark: '#6B21A8',
    divine: '#F59E0B',
    arcane: '#8B5CF6',
    psychic: '#EC4899',
    toxic: '#10B981',
  };

  const copySpellLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess('Spell link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !spell) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="default">
          <CardBody>
            <p style={{ color: 'var(--color-sunset)', marginBottom: '1rem' }}>
              Error: {error || 'Spell not found'}
            </p>
            <Link to="/spells" style={{ color: 'var(--color-metal-gold)' }}>
              ← Back to Spell Compendium
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate('/spells')}>
            ← Back to Spells
          </Button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1
            style={{
              color: 'var(--color-white)',
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '0.5rem',
            }}
          >
            {spell.name}
          </h1>
          <div
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}
          >
            <span
              style={{
                color: schoolColors[spell.school.toLowerCase()] || 'var(--color-cloud)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                textTransform: 'capitalize',
              }}
            >
              {spell.school}
            </span>
            <span style={{ color: 'var(--color-muted)', fontSize: '1.25rem' }}>•</span>
            <span
              style={{
                color: 'var(--color-cloud)',
                fontSize: '1.25rem',
                textTransform: 'capitalize',
              }}
            >
              {spell.subschool}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {spell.concentration && (
            <span
              style={{
                color: 'var(--color-metal-gold)',
                fontSize: '0.875rem',
                backgroundColor: 'rgba(215, 183, 64, 0.2)',
                padding: '0.375rem 1rem',
                borderRadius: '999px',
                fontWeight: 'bold',
                border: '1px solid var(--color-metal-gold)',
              }}
            >
              Concentration
            </span>
          )}

          {spell.reaction && (
            <span
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-sunset)',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                padding: '0.375rem 1rem',
                borderRadius: '999px',
                fontWeight: 'bold',
                border: '1px solid var(--color-sunset)',
              }}
            >
              Reaction
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <Card variant="default" style={{ marginBottom: '1.5rem' }}>
          <CardHeader>
            <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Description</h2>
          </CardHeader>
          <CardBody>
            <p
              style={{
                color: 'var(--color-cloud)',
                lineHeight: '1.6',
                margin: 0,
                fontSize: '1rem',
              }}
            >
              {spell.description}
            </p>
            {spell.damage > 0 && (
              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-dark-border)',
                }}
              >
                <h3
                  style={{
                    color: 'var(--color-metal-gold)',
                    fontSize: '1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Damage
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                  <span
                    style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.25rem' }}
                  >
                    {spell.damage}
                  </span>
                  <span
                    style={{
                      color:
                        damageTypeColors[spell.damageType.toLowerCase()] || 'var(--color-cloud)',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    {spell.damageType}
                  </span>
                </div>
              </div>
            )}
            {spell.charge && (
              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-dark-border)',
                }}
              >
                <h3
                  style={{
                    color: 'var(--color-metal-gold)',
                    fontSize: '1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Charge Effect
                </h3>
                <p
                  style={{
                    color: 'var(--color-cloud)',
                    lineHeight: '1.6',
                    margin: 0,
                    fontSize: '1rem',
                  }}
                >
                  {spell.charge}
                </p>
              </div>
            )}
            {spell.components && spell.components.length > 0 && spell.components[0] !== '' && (
              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-dark-border)',
                }}
              >
                <h3
                  style={{
                    color: 'var(--color-metal-gold)',
                    fontSize: '1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Components
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {spell.components.map((component, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-cloud)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {component}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Casting Requirements */}
        <Card variant="default" style={{ marginBottom: '1.5rem' }}>
          <CardHeader>
            <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Casting Requirements</h2>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    color: 'var(--color-muted)',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  Check to Cast
                </div>
                <div
                  style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.25rem' }}
                >
                  {spell.checkToCast}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    color: 'var(--color-muted)',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  Energy Cost
                </div>
                <div
                  style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.25rem' }}
                >
                  {spell.energy}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    color: 'var(--color-muted)',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  Range
                </div>
                <div
                  style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.25rem' }}
                >
                  {formatRange(spell.range, 'spell')}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    color: 'var(--color-muted)',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  Duration
                </div>
                <div
                  style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.25rem' }}
                >
                  {spell.duration}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Special Properties */}
        {(spell.concentration || spell.reaction) && (
          <Card variant="default" style={{ marginBottom: '1.5rem' }}>
            <CardHeader>
              <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Special Properties</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {spell.concentration && (
                  <div style={{ color: 'var(--color-cloud)', fontSize: '1rem' }}>
                    <strong style={{ color: 'var(--color-metal-gold)' }}>Concentration:</strong>{' '}
                    This spell requires concentration to maintain. You cannot concentrate on
                    multiple spells at once.
                  </div>
                )}
                {spell.reaction && (
                  <div style={{ color: 'var(--color-cloud)', fontSize: '1rem' }}>
                    <strong style={{ color: 'var(--color-metal-gold)' }}>Reaction:</strong> This
                    spell can be cast as a reaction, allowing you to cast it in response to a
                    trigger or event.
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Share Section */}
        <Card
          variant="default"
          style={{ marginTop: '2rem', backgroundColor: 'var(--color-dark-elevated)' }}
        >
          <CardBody>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '1rem' }}>
                Share this Spell
              </h3>
              <Button variant="primary" onClick={copySpellLink}>
                📋 Copy Link to Clipboard
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SpellDetail;
