import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';
import PlayerSlotManager from './PlayerSlotManager';
import CampaignEditor from './CampaignEditor';

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
      userId: string;
      player: {
        _id: string;
        username: string;
      };
    };
    inviteToken?: string;
    isOpen: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

const CampaignView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Campaign not found');
        } else if (response.status === 403) {
          throw new Error('Access denied');
        }
        throw new Error('Failed to fetch campaign');
      }

      const data = await response.json();
      setCampaign(data);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchCampaign();
    }
  }, [id, user]);

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    setCampaign(updatedCampaign);
    setShowEditor(false);
  };

  const handleSlotUpdated = () => {
    fetchCampaign();
  };

  const handleDeleteCampaign = async () => {
    if (!campaign || !isOwner) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/campaigns/${campaign._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete campaign');
      }

      // Navigate back to campaigns list
      navigate('/campaigns');
    } catch (err) {
      console.error('Error deleting campaign:', err);
      showError(err instanceof Error ? err.message : 'Failed to delete campaign');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
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

  const isOwner = campaign.owner._id === user?.id;
  const userCharacter = campaign.playerSlots.find(
    (slot) => slot.character?.userId === user?.id
  )?.character;

  const getThemeColor = () => {
    return 'linear-gradient(to right, rgba(215, 183, 64, 0.5), rgba(215, 183, 64, 0.1))';
  };

  return (
    <div>
      {/* Campaign Header */}
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1
                className="text-4xl font-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {campaign.name}
              </h1>
              <p className="text-lg text-gray-200 mb-4">{campaign.description}</p>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowEditor(true)}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  }
                >
                  Edit Campaign
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(true)}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  }
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    color: '#ef4444',
                  }}
                >
                  Delete Campaign
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span
              style={{
                color: 'var(--color-metal-gold)',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(215, 183, 64, 0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                border: '1px solid rgba(215, 183, 64, 0.3)',
              }}
            >
              Players: {campaign.playerSlots.filter((slot) => slot.character).length}/
              {campaign.playerSlots.length}
            </span>
          </div>

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

      {/* Navigation */}
      <div className="flex gap-4 mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/campaigns')}
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
          Back to Campaigns
        </Button>

        {userCharacter && !isOwner && (
          <Button variant="secondary" onClick={() => navigate(`/characters/${userCharacter._id}`)}>
            View My Character
          </Button>
        )}
      </div>

      {/* Player Slots Management */}
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
          Player Slots
        </h2>

        <PlayerSlotManager
          campaign={campaign}
          isOwner={isOwner}
          onSlotUpdated={handleSlotUpdated}
        />
      </div>

      {/* Campaign Editor Modal */}
      {showEditor && (
        <CampaignEditor
          campaign={campaign}
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          onCampaignUpdated={handleCampaignUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-dark-surface)',
              borderRadius: '0.5rem',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              border: '1px solid var(--color-dark-border)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '4rem',
                  height: '4rem',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  border: '2px solid rgba(239, 68, 68, 0.5)',
                }}
              >
                <svg className="w-8 h-8" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3
                style={{
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}
              >
                Delete Campaign
              </h3>
              <p style={{ color: 'var(--color-cloud)' }}>
                Are you sure you want to delete "{campaign?.name}"? This action cannot be undone and
                will remove all campaign data permanently.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleDeleteCampaign}
                disabled={deleting}
                style={{
                  backgroundColor: deleting ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  color: '#ef4444',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete Campaign'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignView;
