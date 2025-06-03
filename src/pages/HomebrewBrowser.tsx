import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

const HomebrewBrowser: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '3rem',
        }}
      >
        <h1
          style={{
            color: 'var(--color-white)',
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          Homebrew Content
        </h1>
        <p
          style={{
            color: 'var(--color-cloud)',
            fontSize: '1.25rem',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          Discover, create, and share custom items and spells with the community
        </p>
      </div>

      {/* Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        {/* Items Section */}
        <Card variant="default" hoverEffect>
          <CardHeader
            style={{
              backgroundColor: 'var(--color-metal-gold)',
              opacity: 0.8,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2
                style={{
                  color: 'var(--color-white)',
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                Homebrew Items
              </h2>
              <span
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: 'var(--color-white)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                }}
              >
                🗡️ ITEMS
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <p
              style={{
                color: 'var(--color-cloud)',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginBottom: '2rem',
              }}
            >
              Browse and create custom weapons, armor, accessories, and other equipment. Design
              unique items with custom stats, damage types, and special properties.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <Button
                variant="primary"
                onClick={() => navigate('/homebrew/items')}
                style={{ width: '100%' }}
              >
                Browse Items
              </Button>

              {user && (
                <Button
                  variant="accent"
                  onClick={() => navigate('/homebrew/items/create')}
                  style={{ width: '100%' }}
                >
                  Create New Item
                </Button>
              )}

              {!user && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    borderRadius: '0.375rem',
                  }}
                >
                  <p style={{ color: 'var(--color-cloud)', fontSize: '0.875rem', margin: 0 }}>
                    <Link to="/login" style={{ color: 'var(--color-metal-gold)' }}>
                      Sign in
                    </Link>{' '}
                    to create your own items
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Spells Section */}
        <Card variant="default" hoverEffect>
          <CardHeader
            style={{
              backgroundColor: 'var(--color-sat-purple)',
              opacity: 0.8,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2
                style={{
                  color: 'var(--color-white)',
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                Homebrew Spells
              </h2>
              <span
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: 'var(--color-white)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                }}
              >
                ✨ SPELLS
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <p
              style={{
                color: 'var(--color-cloud)',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginBottom: '2rem',
              }}
            >
              Explore and craft custom magic spells across all schools of magic. Design unique
              effects, casting requirements, and magical properties.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <Button
                variant="primary"
                onClick={() => navigate('/homebrew/spells')}
                style={{ width: '100%' }}
              >
                Browse Spells
              </Button>

              {user && (
                <Button
                  variant="accent"
                  onClick={() => navigate('/homebrew/spells/create')}
                  style={{ width: '100%' }}
                >
                  Create New Spell
                </Button>
              )}

              {!user && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    borderRadius: '0.375rem',
                  }}
                >
                  <p style={{ color: 'var(--color-cloud)', fontSize: '0.875rem', margin: 0 }}>
                    <Link to="/login" style={{ color: 'var(--color-metal-gold)' }}>
                      Sign in
                    </Link>{' '}
                    to create your own spells
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Additional Info */}
      <div
        style={{
          marginTop: '3rem',
          textAlign: 'center',
        }}
      >
        <Card variant="default" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <CardBody>
            <h3
              style={{
                color: 'var(--color-metal-gold)',
                fontSize: '1.5rem',
                marginBottom: '1rem',
              }}
            >
              Community Guidelines
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                color: 'var(--color-cloud)',
                fontSize: '0.875rem',
              }}
            >
              <div>
                <strong style={{ color: 'var(--color-white)' }}>Balance First</strong>
                <p style={{ margin: '0.5rem 0 0 0' }}>
                  Create content that enhances gameplay without breaking game balance
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-white)' }}>Be Creative</strong>
                <p style={{ margin: '0.5rem 0 0 0' }}>
                  Design unique and interesting mechanics that add flavor to the game
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-white)' }}>Community Driven</strong>
                <p style={{ margin: '0.5rem 0 0 0' }}>
                  Vote on and provide feedback to help improve homebrew content
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default HomebrewBrowser;
