import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import { Character } from '../types/character';

// Import character view components
import CharacterHeader from '../components/character/view/CharacterHeader';
import TabNavigation, { TabType } from '../components/character/view/TabNavigation';
import InfoTab from '../components/character/view/InfoTab';
import ModulesTab from '../components/character/view/ModulesTab';
import ActionsTab from '../components/character/view/ActionsTab';
import TraitsTab from '../components/character/view/TraitsTab';
import BackgroundTab from '../components/character/view/BackgroundTab';
import SpellsTab from '../components/character/view/SpellsTab';
import SongsTab from '../components/character/view/SongsTab';
import InventoryTab from '../components/character/view/InventoryTab';

// Type for spells that come from the API
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

// Extended Character type to include API-specific fields
interface CharacterWithAPI extends Character {
  _id: string;
  spells: CharacterSpell[];
  spellSlots: number;
  createdAt: string;
  updatedAt: string;
}

const CharacterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { confirm } = useToast();
  const justCreated = new URLSearchParams(location.search).get('created') === 'true';
  const campaignId = new URLSearchParams(location.search).get('campaign');
  const tabFromUrl = new URLSearchParams(location.search).get('tab') as TabType;

  const [character, setCharacter] = useState<CharacterWithAPI | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || 'info');
  const [canEdit, setCanEdit] = useState(false);
  const personalityModule = character?.modules.find(
    (m: any) => m.moduleId && typeof m.moduleId !== 'string' && m.moduleId.mtype === 'secondary'
  );

  const personalityName =
    personalityModule && typeof personalityModule.moduleId !== 'string'
      ? personalityModule.moduleId.name
      : undefined;

  // Handler to update character state
  const handleUpdateCharacter = (updatedCharacter: CharacterWithAPI) => {
    setCharacter(updatedCharacter);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch character data
        const characterResponse = await fetch(`/api/characters/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!characterResponse.ok) {
          if (characterResponse.status === 403) {
            throw new Error('You do not have permission to view this character');
          }
          throw new Error('Failed to fetch character data');
        }

        const characterData = await characterResponse.json();
        setCharacter(characterData);

        // Determine if user can edit this character
        const isCharacterOwner = characterData.userId === user?.id;
        let isCampaignOwner = false;

        // If coming from a campaign, fetch campaign data to check ownership
        if (campaignId) {
          try {
            const campaignResponse = await fetch(`/api/campaigns/${campaignId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
            if (campaignResponse.ok) {
              const campaignData = await campaignResponse.json();
              setCampaign(campaignData);
              isCampaignOwner = campaignData.owner._id === user?.id;
            }
          } catch (err) {
            console.warn('Could not fetch campaign data:', err);
          }
        }

        // User can edit if they own the character OR own the campaign
        setCanEdit(isCharacterOwner || isCampaignOwner);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [id, user, campaignId]);

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Character',
      message: 'Are you sure you want to delete this character? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (!confirmed) {
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

  const handleResourceChange = async (
    resource: 'health' | 'energy' | 'resolve' | 'morale',
    newCurrent: number
  ) => {
    if (!character) return;

    try {
      // Update character locally first for immediate feedback
      const currentResourceData = character.resources[resource];
      if (!currentResourceData) return;

      const updatedCharacter = {
        ...character,
        resources: {
          ...character.resources,
          [resource]: {
            ...currentResourceData,
            current: newCurrent,
          },
        },
      };
      setCharacter(updatedCharacter);

      // Send update to server
      const response = await fetch(`/api/characters/${id}/resources`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resources: updatedCharacter.resources,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update character resources');
      }

      // Get updated character from server to ensure sync
      const updatedData = await response.json();
      setCharacter(updatedData);
    } catch (err) {
      console.error('Error updating character resources:', err);
      // Revert on error
      setCharacter(character);
      setError('Failed to update resources. Please try again.');
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

        {/* Campaign navigation */}
        {campaign && (
          <div style={{ marginBottom: '1rem' }}>
            <Button
              variant="secondary"
              onClick={() => navigate(`/campaigns/${campaign._id}`)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              }
            >
              Back to {campaign.name}
            </Button>
            {!canEdit && (
              <div
                style={{
                  display: 'inline-block',
                  marginLeft: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(255, 165, 0, 0.2)',
                  border: '1px solid rgba(255, 165, 0, 0.5)',
                  borderRadius: '0.25rem',
                  color: '#ffa500',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                }}
              >
                View Only
              </div>
            )}
          </div>
        )}

        {/* Character header */}
        <CharacterHeader
          character={character}
          onDelete={canEdit ? handleDelete : undefined}
          onResourceChange={canEdit ? handleResourceChange : undefined}
        />

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
            <ModulesTab
              characterId={character._id}
              modules={character.modules}
              modulePoints={character.modulePoints}
              onUpdateModulePoints={handleUpdateCharacter}
            />
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && <ActionsTab character={character} />}

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
          {activeTab === 'songs' && (
            <SongsTab characterId={character._id} />
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <InventoryTab
              character={character}
              onCharacterUpdate={(updatedChar) => setCharacter(updatedChar as CharacterWithAPI)}
            />
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
