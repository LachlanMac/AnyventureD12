import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import anyventureCharacters from '../assets/anyventure.png';

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
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                fontWeight: 700,
                letterSpacing: '0.1em',
                margin: '0',
                textTransform: 'uppercase',
                position: 'relative',
              }}
            >
              <span
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-metal-gold) 0%, var(--color-old-gold) 50%, var(--color-sunset) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 30px rgba(215, 183, 64, 0.3)',
                }}
              >
                Anyventure
              </span>
              <span
                style={{
                  color: 'var(--color-sat-purple)',
                  textShadow: '0 0 30px rgba(138, 43, 226, 0.5)',
                }}
              >
                DX
              </span>
            </h1>
            <div
              style={{
                width: '100%',
                height: '4px',
                background:
                  'linear-gradient(90deg, transparent 0%, var(--color-metal-gold) 50%, transparent 100%)',
                marginTop: '1rem',
                borderRadius: '2px',
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
            A classless TTRPG where your choices shape your destiny. Build unique characters through
            modules, not classes. Master skills through practice, not levels.
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
            title="No Classes, Only Choices"
            description="Build your character through a modular system. Mix and match personality, core, and secondary modules to create truly unique heroes."
            icon="🎭"
            color="var(--color-sat-purple)"
          />
          <FeatureCard
            title="Skill-Based Progression"
            description="Master 20 basic skills across 5 attributes. Your talents determine how many dice you roll, while skill level determines the die type (d4 to d20)."
            icon="🎲"
            color="var(--color-stormy)"
          />
          <FeatureCard
            title="Dynamic Combat"
            description="Use single-roll combat to determine your attack success and damage and roll defense checks against attacks."
            icon="⚔️"
            color="var(--color-sunset)"
          />
          <FeatureCard
            title="Five Schools of Magic"
            description="Master Black, Primal, Mysticism, Divine, or Meta Magic. Each school has unique subschools and exotic branches to explore."
            icon="✨"
            color="var(--color-old-gold)"
          />
          <FeatureCard
            title="Crafting System"
            description="Create items through Engineering, Fabrication, Alchemy, Cooking, Glyphcraft, or Bioshaping. All items have a recipe and can be crafted by players."
            icon="🔨"
            color="var(--color-evening)"
          />
          <FeatureCard
            title="Rich World Building"
            description="17 unique races, 18 cultures, and countless combinations. From the dragonkind to the tidewalkers, each brings unique abilities."
            icon="🌍"
            color="var(--color-muted)"
          />
        </div>
      </div>

      {/* How to Play Section */}
      <div
        style={{
          backgroundColor: 'var(--color-dark-surface)',
          padding: '4rem 0',
          marginTop: '4rem',
        }}
      >
        <div className="container mx-auto px-4">
          <h2
            style={{
              textAlign: 'center',
              fontSize: '2.5rem',
              color: 'var(--color-metal-gold)',
              marginBottom: '3rem',
              fontWeight: 'bold',
            }}
          >
            How to Get Started
          </h2>

          <div
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            style={{ maxWidth: '1000px', margin: '0 auto' }}
          >
            <StepCard
              number="1"
              title="Choose Your Race"
              description="Select from 17 unique races, each with innate bonuses and traits that shape your character's potential."
            />
            <StepCard
              number="2"
              title="Pick Your Culture"
              description="Your cultural background adds flavor and initial skills, representing where you grew up and learned."
            />
            <StepCard
              number="3"
              title="Allocate Attributes"
              description="Distribute 6 points among Physique, Finesse, Mind, Knowledge, and Social to define your capabilities."
            />
            <StepCard
              number="4"
              title="Select Modules"
              description="Choose core and secondary modules to gain abilities, actions, and specializations unique to your vision."
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/modules">
              <Button variant="secondary" size="lg">
                Browse All Modules
              </Button>
            </Link>
          </div>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          style={{ maxWidth: '1200px', margin: '0 auto' }}
        >
          <ResourceCard
            title="Item Compendium"
            description="Browse weapons, armor, and equipment. From simple daggers to legendary artifacts."
            linkText="View Items"
            linkTo="/items"
            icon="🗡️"
          />
          <ResourceCard
            title="Spell Library"
            description="Explore spells across all five schools of magic. Learn their requirements and effects."
            linkText="View Spells"
            linkTo="/spells"
            icon="📜"
          />
          <ResourceCard
            title="Module Directory"
            description="Discover all available modules to plan your character's growth and abilities."
            linkText="View Modules"
            linkTo="/modules"
            icon="📚"
          />
          <ResourceCard
            title="Conditions Reference"
            description="Quick reference for all status conditions and their effects in combat and roleplay."
            linkText="View Conditions"
            linkTo="/conditions"
            icon="⚡"
          />
          <ResourceCard
            title="Recipe Compendium"
            description="Browse all crafting recipes for alchemy, cooking, engineering, fabrication, and more."
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

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => (
  <div style={{ textAlign: 'center' }}>
    <div
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-metal-gold)',
        color: 'var(--color-dark-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1rem',
        fontSize: '1.5rem',
        fontWeight: 'bold',
      }}
    >
      {number}
    </div>
    <h3
      style={{
        fontSize: '1.125rem',
        fontWeight: 'bold',
        color: 'var(--color-white)',
        marginBottom: '0.5rem',
      }}
    >
      {title}
    </h3>
    <p
      style={{
        color: 'var(--color-cloud)',
        fontSize: '0.875rem',
        lineHeight: '1.5',
      }}
    >
      {description}
    </p>
  </div>
);

interface ResourceCardProps {
  title: string;
  description: string;
  linkText: string;
  linkTo: string;
  icon: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  description,
  linkText,
  linkTo,
  icon,
}) => (
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
    <p
      style={{
        color: 'var(--color-cloud)',
        marginBottom: '1rem',
        textAlign: 'center',
        lineHeight: '1.5',
      }}
    >
      {description}
    </p>
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
