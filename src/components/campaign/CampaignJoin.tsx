import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

interface Campaign {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    username: string;
  };
  startingTalents: number;
  startingModulePoints: number;
  picture?: string;
  playerSlots: {
    _id: string;
    character?: {
      _id: string;
      name: string;
      player: {
        _id: string;
        username: string;
      };
    };
    inviteToken?: string;
    isOpen: boolean;
  }[];
}

interface Character {
  _id: string;
  name: string;
  ancestry: {
    ancestryId: {
      name: string;
    };
  };
  characterCulture: {
    cultureId: {
      name: string;
    };
  };
  level: number;
}

const CampaignJoin: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaignInfo = async () => {
    try {
      const response = await fetch(`/api/campaigns/join/${token}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Invalid or expired invite link');
        }
        throw new Error('Failed to load campaign information');
      }

      const data = await response.json();
      setCampaign(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCharacters = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch('/api/characters', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (token) {
      fetchCampaignInfo();
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserCharacters();
    }
  }, [isAuthenticated]);

  const handleJoinWithCharacter = async () => {
    if (!selectedCharacterId || !token) return;

    setJoining(true);
    try {
      const response = await fetch(`/api/campaigns/join/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ characterId: selectedCharacterId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join campaign');
      }

      const data = await response.json();
      navigate(`/campaigns/${data.campaign._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join campaign');
    } finally {
      setJoining(false);
    }
  };

  const handleCreateCharacter = () => {
    // Store the invite token in localStorage so we can return after character creation
    localStorage.setItem('pendingCampaignInvite', token || '');
    navigate('/characters/create');
  };

  const getThemeColor = () => {
    return 'linear-gradient(to right, rgba(215, 183, 64, 0.5), rgba(215, 183, 64, 0.1))';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '2rem',
          backgroundColor: 'rgba(152, 94, 109, 0.2)',
          borderRadius: '0.5rem',
          border: '1px solid var(--color-sunset)',
          color: 'var(--color-white)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Error</h2>
        <p>{error}</p>
        <div style={{ marginTop: '1rem' }}>
          <Button variant="secondary" onClick={() => navigate('/campaigns')}>
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div
          className="rounded-lg p-8 text-center"
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            border: '1px solid var(--color-dark-border)',
          }}
        >
          <h1
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Join Campaign
          </h1>
          <p className="text-gray-300 mb-6">You need to be logged in to join a campaign.</p>
          <Button variant="accent" onClick={() => navigate('/login')}>
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Campaign Info */}
      <div
        className="rounded-lg mb-6 overflow-hidden"
        style={{
          background: getThemeColor(),
          backgroundImage: campaign.picture
            ? `url(/uploads/campaigns/${campaign.picture})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: campaign.picture ? 'overlay' : undefined,
        }}
      >
        <div className="p-8">
          <h1
            className="text-4xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {campaign.name}
          </h1>
          <p className="text-lg text-gray-200 mb-4">{campaign.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div>
              <span className="text-gray-300 text-sm">Game Master</span>
              <p className="font-semibold">{campaign.owner.username}</p>
            </div>
            <div>
              <span className="text-gray-300 text-sm">Starting Talents</span>
              <p className="font-semibold">{campaign.startingTalents}</p>
            </div>
            <div>
              <span className="text-gray-300 text-sm">Starting Module Points</span>
              <p className="font-semibold">{campaign.startingModulePoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Options */}
      <div
        className="rounded-lg p-6"
        style={{
          backgroundColor: 'var(--color-dark-surface)',
          border: '1px solid var(--color-dark-border)',
        }}
      >
        <h2
          className="text-2xl font-bold text-white mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Join Campaign
        </h2>

        {characters.length > 0 ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Select a Character</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((character) => (
                  <div
                    key={character._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCharacterId === character._id
                        ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    style={{
                      backgroundColor:
                        selectedCharacterId === character._id
                          ? 'rgba(59, 130, 246, 0.1)'
                          : 'var(--color-dark-base)',
                    }}
                    onClick={() => {
                      setSelectedCharacterId(character._id);
                    }}
                  >
                    <h4 className="text-white font-semibold">{character.name}</h4>
                    <p className="text-gray-400 text-sm">
                      {character.ancestry.ancestryId.name}{' '}
                      {character.characterCulture.cultureId.name}
                    </p>
                    <p className="text-gray-400 text-sm">Level {character.level}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="accent"
                onClick={handleJoinWithCharacter}
                disabled={!selectedCharacterId || joining}
              >
                {joining ? 'Joining...' : 'Join with Selected Character'}
              </Button>

              <Button variant="secondary" onClick={handleCreateCharacter}>
                Create New Character
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-300 mb-6">
              You don't have any characters yet. Create a character to join this campaign.
            </p>
            <Button variant="accent" onClick={handleCreateCharacter}>
              Create Character
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignJoin;
