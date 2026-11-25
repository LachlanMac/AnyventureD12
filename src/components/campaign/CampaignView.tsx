import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import PlayerSlotManager from './PlayerSlotManager';
import CampaignEditor from './CampaignEditor';
import CampaignItemsTab from './CampaignItemsTab';
import CampaignStorageTab from './storage/CampaignStorageTab';

type CampaignTab = 'players' | 'items' | 'spells' | 'storage';

// gmOnly tabs are the GM's management views. Players reach storage from their
// character's Inventory tab, and campaign items from their item browser.
const CAMPAIGN_TABS: { id: CampaignTab; label: string; gmOnly?: boolean }[] = [
  { id: 'players', label: 'Players' },
  { id: 'items', label: 'Items', gmOnly: true },
  { id: 'spells', label: 'Spells', gmOnly: true },
  { id: 'storage', label: 'Storage', gmOnly: true },
];

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
  const [activeTab, setActiveTab] = useState<CampaignTab>('players');

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

  return (
    <div>
      {/* Campaign Header: picture with name and description, then one info bar */}
      <div
        className="rounded-lg mb-6 overflow-hidden"
        style={{ border: '1px solid var(--color-dark-border)' }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            backgroundImage: campaign.picture
              ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.65)), url(/uploads/campaigns/${campaign.picture})`
              : 'linear-gradient(to right, rgba(215, 183, 64, 0.5), rgba(215, 183, 64, 0.1))',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: campaign.picture ? '220px' : undefined,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div className="p-8">
            <h1
              className="text-4xl font-bold text-white mb-2"
              style={{
                fontFamily: 'var(--font-display)',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.7)',
              }}
            >
              {campaign.name}
            </h1>
            {campaign.description && (
              <p
                className="text-lg text-gray-200"
                style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.7)' }}
              >
                {campaign.description}
              </p>
            )}
          </div>
        </div>

        {/* Info bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            padding: '0.625rem 1.25rem',
            backgroundColor: 'var(--color-dark-elevated)',
            borderTop: '1px solid var(--color-dark-border)',
            fontSize: '0.9rem',
          }}
        >
          {[
            ['Game Master', campaign.owner.username],
            [
              'Players',
              `${campaign.playerSlots.filter((slot) => slot.character).length}/${campaign.playerSlots.length}`,
            ],
            ['Starting Talents', campaign.startingTalents],
            ['Starting Module Points', campaign.startingModulePoints],
          ].map(([label, value]) => (
            <span key={label as string} style={{ whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--color-cloud)' }}>{label}:</span>{' '}
              <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>{value}</span>
            </span>
          ))}

          {isOwner && (
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
              <Button variant="secondary" size="sm" onClick={() => setShowEditor(true)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </Button>
            </div>
          )}
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

      {/* Campaign Tabs */}
      <div
        className="rounded-lg"
        style={{
          backgroundColor: 'var(--color-dark-surface)',
          border: '1px solid var(--color-dark-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-dark-border)',
            overflowX: 'auto',
          }}
        >
          {CAMPAIGN_TABS.filter((tab) => isOwner || !tab.gmOnly).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.5rem',
                color: activeTab === tab.id ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-metal-gold)' : 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'players' && (
            <PlayerSlotManager
              campaign={campaign}
              isOwner={isOwner}
              onSlotUpdated={handleSlotUpdated}
            />
          )}

          {isOwner && activeTab === 'items' && (
            <CampaignItemsTab campaignId={campaign._id} isOwner={isOwner} />
          )}

          {isOwner && activeTab === 'spells' && (
            <EmptyState
              size="sm"
              title="No campaign spells yet"
              description="Custom spells you add here can be learned by any character in this campaign."
            />
          )}

          {isOwner && activeTab === 'storage' && <CampaignStorageTab campaignId={campaign._id} />}
        </div>
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
