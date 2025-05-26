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
import SpellsTab from '../components/character/view/SpellsTab';
import InventoryTab from '../components/character/view/InventoryTab';

// Type definitions included here for completeness
interface Action {
  name: string;
  description: string;
  type: 'Action' | 'Reaction';
  sourceModule: string;
  sourceModuleOption: string;
}
interface CharacterSpell {
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

interface SkillData {
  value: number; // Dice type (1-6)
  talent: number; // Number of dice (0-3)
}

interface Character {
  _id: string;
  userId: string;
  name: string;
  race: string;
  culture: string;
  stressors: string[];
  attributes: {
    physique: number;
    finesse: number;
    mind: number;
    knowledge: number;
    social: number;
  };
  spells: CharacterSpell[];
  spellSlots: number;
  skills: {
    fitness: SkillData;
    deflection: SkillData;
    might: SkillData;
    endurance: SkillData;
    evasion: SkillData;
    stealth: SkillData;
    coordination: SkillData;
    thievery: SkillData;
    resilience: SkillData;
    concentration: SkillData;
    senses: SkillData;
    logic: SkillData;
    wildcraft: SkillData;
    academics: SkillData;
    magic: SkillData;
    medicine: SkillData;
    expression: SkillData;
    persuasion: SkillData;
    insight: SkillData;
    presence: SkillData;
  };

  weaponSkills: {
    unarmed: SkillData;
    throwing: SkillData;
    simpleRangedWeapons: SkillData;
    simpleMeleeWeapons: SkillData;
    complexRangedWeapons: SkillData;
    complexMeleeWeapons: SkillData;
  };
  craftingSkills: {
    engineering: SkillData;
    fabrication: SkillData;
    alchemy: SkillData;
    cooking: SkillData;
    glyphcraft: SkillData;
  };
  magicSkills: {
    black: SkillData;
    primal: SkillData;
    alteration: SkillData;
    divine: SkillData;
    mystic: SkillData;
  };
  resources: {
    health: { current: number; max: number };
    energy: { current: number; max: number };
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
  portraitUrl: string;
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
  inventory: any[];
  equipment: any;
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
  const personalityModule = character?.modules.find(
    (m: any) => m.moduleId && typeof m.moduleId !== 'string' && m.moduleId.mtype === 'secondary'
  );

  const personalityName =
    personalityModule && typeof personalityModule.moduleId !== 'string'
      ? personalityModule.moduleId.name
      : undefined;
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
          {character && activeTab === 'traits' && (
            <TraitsTab
              character={character}
              characterId={character._id}
              personality={personalityName}
              stressors={character.stressors || []}
            />
          )}
          {activeTab === 'spells' && (
            <SpellsTab
              characterId={character._id}
              spells={character.spells || []}
              spellSlots={character.spellSlots || 10}
            />
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <InventoryTab character={character} onCharacterUpdate={setCharacter} />
          )}

          {/* Background Tab */}
          {activeTab === 'background' && (
            <BackgroundTab
              physicalTraits={character.physicalTraits}
              appearance={character.appearance}
              biography={character.biography}
              race={character.race}
              culture={character.culture}
              portraitUrl={character.portraitUrl}
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
