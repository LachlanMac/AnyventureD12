import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import anyventureCharacters from '../assets/anyventure.png';
import anyventureLogo from '../assets/Logo-2-Color-B.png';

const Home: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-dark-base)' }}>
      {/* Hero Section */}
      <div
        style={{
          background:
            'linear-gradient(180deg, var(--color-dark-surface) 0%, var(--color-dark-base) 100%)',
          paddingBottom: '4rem',
        }}
      >
        <div className="container mx-auto px-4 py-8">
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <img
              src={anyventureLogo}
              alt="Anyventure Logo"
              style={{
                maxWidth: '800px',
                width: '100%',
                height: 'auto',
                margin: '0 auto',
              }}
            />
          </div>

          {/* Tagline */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '1.5rem',
              color: 'var(--color-cloud)',
              maxWidth: '800px',
              margin: '0 auto 3rem',
              lineHeight: '1.8',
            }}
          >
          A classless, level-less TTRPG where your choices shape your destiny.
          </p>

          {/* Characters Image */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <img
              src={anyventureCharacters}
              alt="Anyventure Characters"
              style={{
                maxWidth: '400px',
                width: '100%',
                height: 'auto',
                margin: '0 auto',
                borderRadius: '50%',
                boxShadow: '0 0 40px rgba(215, 183, 64, 0.3)',
              }}
            />
          </div>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/characters/create">
              <Button variant="accent" size="lg">
                Create Your First Character
              </Button>
            </Link>
            <Link to="/characters">
              <Button variant="outline" size="lg">
                View Characters
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="container mx-auto px-4 py-12">
        <h2
          style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            color: 'var(--color-metal-gold)',
            marginBottom: '3rem',
            fontWeight: 'bold',
          }}
        >
          What Makes Anyventure Unique
        </h2>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{ maxWidth: '1200px', margin: '0 auto' }}
        >
          <FeatureCard
            title="No Classes. No Levels."
            description="Build your character through a modular system where your skills grow over time. Create any archetype combination imaginable."
            icon="🎭"
            color="var(--color-sat-purple)"
          />
          <FeatureCard
            title="Talent / Skill Progression"
            description="Talents determine how many dice you roll. Skills determine what tier of dice you roll (from d4 to d24)."
            icon="🎲"
            color="var(--color-stormy)"
          />
          <FeatureCard
            title="Dynamic Combat"
            description="Tactical, 2 Action system with one roll attack & damage resolution."
            icon="⚔️"
            color="var(--color-sunset)"
          />
          <FeatureCard
            title="Magic System"
            description="No Spell Slots. Fail and Fizzle magic system with 6 unique schools; Black, White, Primal, Meta, Mysticism and Arcane. Each school has three subschools."
            icon="✨"
            color="var(--color-old-gold)"
          />
          <FeatureCard
            title="Crafting System"
            description="Create items through Engineering, Fabrication, Alchemy, Cooking, Glyphcraft, or Biosculpting with hundreds of recipes and unique customization."
            icon="🔨"
            color="var(--color-evening)"
          />
          <FeatureCard
            title="Unique Character Creation"
            description="Choose from several ancestries, cultures, personalities and traits to customize your character."
            icon="🌍"
            color="var(--color-muted)"
          />
        </div>
      </div>

      {/* Resources Section */}
      <div className="container mx-auto px-4 py-12">
        <h2
          style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            color: 'var(--color-metal-gold)',
            marginBottom: '3rem',
            fontWeight: 'bold',
          }}
        >
          Game Resources
        </h2>

        <div
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6"
          style={{ maxWidth: '1200px', margin: '0 auto' }}
        >
          <ResourceCard title="Item Compendium" linkText="View Items" linkTo="/items" icon="🗡️" />
          <ResourceCard title="Spell Library" linkText="View Spells" linkTo="/spells" icon="📜" />
          <ResourceCard title="Song Compendium" linkText="View Songs" linkTo="/songs" icon="🎵" />
          <ResourceCard
            title="Module Directory"
            linkText="View Modules"
            linkTo="/modules"
            icon="📚"
          />
          <ResourceCard
            title="Conditions Reference"
            linkText="View Conditions"
            linkTo="/conditions"
            icon="⚡"
          />
          <ResourceCard
            title="Recipe Compendium"
            linkText="View Recipes"
            linkTo="/recipes"
            icon="🔨"
          />
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, color }) => (
  <div
    style={{
      backgroundColor: 'var(--color-dark-surface)',
      borderRadius: '0.5rem',
      padding: '2rem',
      border: '1px solid var(--color-dark-border)',
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 10px 30px -10px ${color}40`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div
      style={{
        fontSize: '3rem',
        marginBottom: '1rem',
        textAlign: 'center',
      }}
    >
      {icon}
    </div>
    <h3
      style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: 'var(--color-white)',
        marginBottom: '0.75rem',
        textAlign: 'center',
      }}
    >
      {title}
    </h3>
    <p
      style={{
        color: 'var(--color-cloud)',
        lineHeight: '1.6',
        textAlign: 'center',
      }}
    >
      {description}
    </p>
  </div>
);

interface ResourceCardProps {
  title: string;
  linkText: string;
  linkTo: string;
  icon: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ title, linkText, linkTo, icon }) => (
  <Link
    to={linkTo}
    style={{
      display: 'block',
      backgroundColor: 'var(--color-dark-surface)',
      borderRadius: '0.5rem',
      padding: '2rem',
      border: '1px solid var(--color-dark-border)',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.borderColor = 'var(--color-metal-gold)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--color-dark-border)';
    }}
  >
    <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>{icon}</div>
    <h3
      style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: 'var(--color-white)',
        marginBottom: '0.75rem',
        textAlign: 'center',
      }}
    >
      {title}
    </h3>
    {/* description removed for compact single-line layout */}
    <div
      style={{
        color: 'var(--color-metal-gold)',
        fontWeight: 'bold',
        textAlign: 'center',
      }}
    >
      {linkText} →
    </div>
  </Link>
);

export default Home;
