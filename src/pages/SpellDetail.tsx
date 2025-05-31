import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

interface Spell {
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
}

const SpellDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    // You could add a toast notification here
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate('/spells')}>
            ← Back to Spells
          </Button>
          <Button variant="outline" onClick={copySpellLink}>
            📋 Copy Link
          </Button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <h1
            style={{
              color: 'var(--color-white)',
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            {spell.name}
          </h1>
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
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              color: 'var(--color-cloud)',
              fontSize: '1.125rem',
              textTransform: 'capitalize',
            }}
          >
            {spell.subschool}
          </span>
          
          {spell.concentration && (
            <span
              style={{
                color: 'var(--color-metal-gold)',
                fontSize: '0.875rem',
                backgroundColor: 'rgba(215, 183, 64, 0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                fontWeight: 'bold',
              }}
            >
              Concentration
            </span>
          )}
          
          {spell.reaction && (
            <span
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-white)',
                backgroundColor: 'var(--color-dark-elevated)',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                fontWeight: 'bold',
              }}
            >
              Reaction
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2">
          <Card variant="default" style={{ marginBottom: '1.5rem' }}>
            <CardHeader>
              <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Description</h2>
            </CardHeader>
            <CardBody>
              <p style={{ color: 'var(--color-cloud)', lineHeight: '1.6', margin: 0 }}>
                {spell.description}
              </p>
            </CardBody>
          </Card>

          {/* Casting Requirements */}
          <Card variant="default" style={{ marginBottom: '1.5rem' }}>
            <CardHeader>
              <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Casting Requirements</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Check to Cast</div>
                  <div style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.125rem' }}>
                    {spell.checkToCast}
                  </div>
                </div>
                
                <div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Energy Cost</div>
                  <div style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.125rem' }}>
                    {spell.energy}
                  </div>
                </div>
                
                <div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Range</div>
                  <div style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.125rem' }}>
                    {spell.range}
                  </div>
                </div>
                
                <div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Duration</div>
                  <div style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.125rem' }}>
                    {spell.duration}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Components */}
          {spell.components && spell.components.length > 0 && (
            <Card variant="default" style={{ marginBottom: '1.5rem' }}>
              <CardHeader>
                <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Components</h2>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {spell.components.map((component, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {component}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Damage */}
          {spell.damage > 0 && (
            <Card variant="default">
              <CardHeader>
                <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Damage</h2>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Damage</div>
                    <div style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                      {spell.damage}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Type</div>
                    <div
                      style={{
                        color: damageTypeColors[spell.damageType.toLowerCase()] || 'var(--color-cloud)',
                        fontWeight: 'bold',
                        fontSize: '1.125rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {spell.damageType}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Special Properties */}
          {(spell.concentration || spell.reaction) && (
            <Card variant="default" style={{ marginTop: '1.5rem' }}>
              <CardHeader>
                <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Special Properties</h2>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {spell.concentration && (
                    <div style={{ color: 'var(--color-cloud)' }}>
                      <strong style={{ color: 'var(--color-metal-gold)' }}>Concentration:</strong> This spell requires concentration to maintain. You cannot concentrate on multiple spells at once.
                    </div>
                  )}
                  {spell.reaction && (
                    <div style={{ color: 'var(--color-cloud)' }}>
                      <strong style={{ color: 'var(--color-metal-gold)' }}>Reaction:</strong> This spell can be cast as a reaction, allowing you to cast it in response to a trigger or event.
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column - Quick Stats */}
        <div className="lg:col-span-1">
          <Card variant="default" style={{ position: 'sticky', top: '1rem' }}>
            <CardHeader>
              <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Quick Stats</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>School</div>
                  <div
                    style={{
                      color: schoolColors[spell.school.toLowerCase()] || 'var(--color-cloud)',
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    {spell.school}
                  </div>
                </div>
                
                <div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Subschool</div>
                  <div style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.125rem', textTransform: 'capitalize' }}>
                    {spell.subschool}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Cast DC</div>
                  <div style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.125rem' }}>
                    {spell.checkToCast}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Energy Cost</div>
                  <div style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.125rem' }}>
                    {spell.energy}
                  </div>
                </div>

                {spell.damage > 0 && (
                  <div>
                    <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Damage</div>
                    <div style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1.125rem' }}>
                      {spell.damage} {spell.damageType}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-dark-border)' }}>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Share this spell
                  </div>
                  <Button variant="outline" onClick={copySpellLink} style={{ width: '100%' }}>
                    📋 Copy Link
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpellDetail;