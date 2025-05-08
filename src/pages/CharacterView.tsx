import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';

// Import character view components
import CharacterHeader from '../components/character/view/CharacterHeader';
import TabNavigation, { TabType } from '../components/character/view/TabNavigation';
import InfoTab from '../components/character/view/InfoTab';
import ModulesTab from '../components/character/view/ModulesTab';
import ActionsTab from '../components/character/view/ActionsTab';
import TraitsTab from '../components/character/view/TraitsTab';
import BackgroundTab from '../components/character/view/BackgroundTab';

// Type definitions included here for completeness
interface Action {
  name: string;
  description: string;
  type: 'Action' | 'Reaction' | 'Free Action';
  sourceModule: string;
  sourceModuleOption: string;
}

interface Trait {
  traitId: string;
  name: string;
  type: 'positive' | 'negative';
  description: string;
  dateAdded: string;
}

interface SkillData {
  value: number; // Dice type (1-6)
  talent: number; // Number of dice (0-3)
}

interface Character {
  _id: string;
  userId: string;
  name: string;
  race: string;
  attributes: {
    physique: number;
    agility: number;
    mind: number;
    knowledge: number;
    social: number;
  };
  traits: Trait[];
  skills: {
    fitness: SkillData;
    deflect: SkillData;
    might: SkillData;
    evade: SkillData;
    stealth: SkillData;
    coordination: SkillData;
    resilience: SkillData;
    concentration: SkillData;
    senses: SkillData;
    science: SkillData;
    technology: SkillData;
    medicine: SkillData;
    xenology: SkillData;
    negotiation: SkillData;
    behavior: SkillData;
    presence: SkillData;
  };
  weaponSkills: {
    rangedWeapons: SkillData;
    meleeWeapons: SkillData;
    weaponSystems: SkillData;
    heavyRangedWeapons: SkillData;
  };
  craftingSkills: {
    engineering: SkillData;
    fabrication: SkillData;
    biosculpting: SkillData;
    synthesis: SkillData;
  };
  resources: {
    health: { current: number; max: number };
    stamina: { current: number; max: number };
    resolve: { current: number; max: number };
  };
  languages: string[];
  stances: string[];
  physicalTraits: {
    size: string;
    weight: string;
    height: string;
    gender: string;
  };
  biography: string;
  appearance: string;
  actions: Action[];
  modules: any[]; // Simplified for this example
  level: number;
  experience: number;
  modulePoints: {
    total: number;
    spent: number;
  };
  movement: number;
  createdAt: string;
  updatedAt: string;
}

const CharacterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const justCreated = new URLSearchParams(location.search).get('created') === 'true';

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        
        // Use the actual API endpoint instead of mock data
        const response = await fetch(`/api/characters/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch character data');
        }
        
        const characterData = await response.json();
        console.log('Character data from API:', characterData); // Log to check structure
        
        setCharacter(characterData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching character:', err);
        
        // Fallback to mock data for development if needed
        const mockCharacter: Character = {
          _id: id || '12345',
          userId: 'test-user-id',
          name: 'Zara Chen',
          race: 'Human',
          attributes: {
            physique: 2,
            agility: 3,
            mind: 2,
            knowledge: 1,
            social: 2,
          },
          traits: [],
          skills: {
            // Physique Skills
            fitness: { value: 2, talent: 0 },
            deflect: { value: 3, talent: 0 },
            might: { value: 2, talent: 0 },

            // Agility Skills
            evade: { value: 3, talent: 0 },
            stealth: { value: 4, talent: 0 },
            coordination: { value: 3, talent: 0 },

            // Mind Skills
            resilience: { value: 2, talent: 0 },
            concentration: { value: 3, talent: 0 },
            senses: { value: 4, talent: 0 },

            // Knowledge Skills
            science: { value: 2, talent: 0 },
            technology: { value: 1, talent: 0 },
            medicine: { value: 3, talent: 0 },
            xenology: { value: 2, talent: 0 },

            // Social Skills
            negotiation: { value: 2, talent: 0 },
            behavior: { value: 3, talent: 0 },
            presence: { value: 2, talent: 0 },
          },
          weaponSkills: {
            rangedWeapons: { value: 3, talent: 2 },
            meleeWeapons: { value: 2, talent: 1 },
            weaponSystems: { value: 1, talent: 0 },
            heavyRangedWeapons: { value: 2, talent: 0 },
          },
          craftingSkills: {
            engineering: { value: 1, talent: 1 },
            fabrication: { value: 2, talent: 1 },
            biosculpting: { value: 1, talent: 0 },
            synthesis: { value: 2, talent: 0 },
          },
          resources: {
            health: { current: 12, max: 12 },
            stamina: { current: 7, max: 7 },
            resolve: { current: 7, max: 7 },
          },
          languages: ['Common', 'Terran Standard'],
          stances: ['Defensive Stance'],
          physicalTraits: {
            size: 'Medium',
            weight: '165 lbs',
            height: '5\'9"',
            gender: 'Female',
          },
          biography:
            'Born on the lunar colony of New Armstrong, Zara always dreamed of exploring beyond the solar system. After graduating top of her class at the Galactic Academy, she joined the Stellar Exploration Corps and quickly rose through the ranks due to her exceptional navigation skills and cool head in crisis situations.',
          appearance:
            'Tall with an athletic build, short black hair with a silver streak, and piercing blue eyes. Usually seen wearing a customized navy blue flight suit with red detailing and a well-worn leather jacket adorned with mission patches.',
          actions: [
            {
              name: 'Quick Dodge',
              description: 'You can use your Dodge Modifier to Defend against Ray Attacks',
              type: 'Reaction',
              sourceModule: 'Acrobat',
              sourceModuleOption: 'Quick Dodge',
            },
            {
              name: 'Rolling Dodge',
              description:
                'Gain +1 Dodge until the start of your next turn. Each time you Dodge an Attack successfully, gain another +1 Dodge until the start of your next turn',
              type: 'Reaction',
              sourceModule: 'Acrobat',
              sourceModuleOption: 'Rolling Dodge',
            },
          ],
          modules: [],
          level: 3,
          experience: 1250,
          modulePoints: {
            total: 10,
            spent: 1,
          },
          movement: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('Using mock character data:', mockCharacter);
        setCharacter(mockCharacter);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  // Log the character data just before rendering
  useEffect(() => {
    if (character) {
      console.log('Character before rendering:', character);
    }
  }, [character]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this character?')) {
      return;
    }

    try {
      // In a real app, this would call your API
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      // Redirect to character list
      navigate('/characters');
    } catch (err) {
      console.error('Error deleting character:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div
          style={{
            backgroundColor: 'rgba(152, 94, 109, 0.2)',
            border: '1px solid var(--color-sunset)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}
          >
            Error
          </h2>
          <p style={{ color: 'var(--color-white)' }}>{error}</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/characters">
              <Button variant="accent">Return to Characters</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}
          >
            Character Not Found
          </h2>
          <p style={{ color: 'var(--color-cloud)' }}>
            The character you're looking for doesn't exist or has been deleted.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/characters">
              <Button variant="accent">Return to Characters</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {justCreated && (
          <div
            style={{
              backgroundColor: 'rgba(85, 65, 130, 0.2)',
              border: '1px solid var(--color-sat-purple)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: 'var(--color-white)',
            }}
          >
            Character successfully created!
          </div>
        )}

        {/* Character header */}
        <CharacterHeader character={character} onDelete={handleDelete} />

        {/* Tab navigation */}
        <div style={{ marginTop: '2rem' }}>
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Tab content */}
        <div style={{ marginTop: '1.5rem' }}>
          {/* Character Info Tab (now combining Info and Skills) */}
          {activeTab === 'info' && <InfoTab character={character} />}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <ModulesTab characterId={character._id} modules={character.modules} />
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && <ActionsTab actions={character.actions} />}

          {/* Traits Tab */}
          {activeTab === 'traits' && (
            <TraitsTab traits={character.traits} characterId={character._id} />
          )}

          {/* Background Tab */}
          {activeTab === 'background' && (
            <BackgroundTab
              physicalTraits={character.physicalTraits}
              appearance={character.appearance}
              biography={character.biography}
            />
          )}
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '2rem',
          }}
        >
          <Link
            to="/characters"
            style={{
              color: 'var(--color-metal-gold)',
              textDecoration: 'none',
            }}
          >
            Return to Characters
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CharacterView;