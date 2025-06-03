import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import CampaignCreator from '../components/campaign/CampaignCreator';

// Define Campaign type
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
  createdAt: string;
  updatedAt: string;
}

const Campaigns: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showInfo } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  // Function to generate a gradient for campaigns
  const getThemeColor = () => {
    return 'linear-gradient(to right, rgba(215, 183, 64, 0.5), rgba(215, 183, 64, 0.1))';
  };

  const handleCreateCampaign = () => {
    setShowCreateModal(true);
  };

  const handleCampaignCreated = () => {
    fetchCampaigns();
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
          <Button variant="accent" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
          }}
        >
          Campaigns
        </h1>
        <Button
          variant="accent"
          onClick={handleCreateCampaign}
          rightIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          }
        >
          Create Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            borderRadius: '0.5rem',
            padding: '3rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              backgroundColor: 'var(--color-stormy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
              />
            </svg>
          </div>
          <h2
            style={{
              color: 'var(--color-white)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
          >
            No Campaigns Found
          </h2>
          <p style={{ color: 'var(--color-cloud)', maxWidth: '400px', margin: '0 auto' }}>
            No campaigns are available at the moment. Create a new campaign to start a cosmic
            adventure!
          </p>
          <Button variant="accent" onClick={handleCreateCampaign}>Create First Campaign</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="hover-lift"
              style={{
                backgroundColor: 'var(--color-dark-surface)',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: '1px solid var(--color-dark-border)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              <div
                style={{
                  padding: '1.5rem',
                  backgroundImage: campaign.picture 
                    ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(/uploads/campaigns/${campaign.picture})`
                    : getThemeColor(),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  position: 'relative',
                  minHeight: '150px',
                }}
              >
                <div>
                <h3
                  style={{
                    color: 'var(--color-white)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  {campaign.name}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                    Players: {campaign.playerSlots.filter(slot => slot.character).length}/{campaign.playerSlots.length}
                  </span>
                </div>
                </div>
              </div>
              <div style={{ padding: '1rem 1.5rem' }}>
                <p
                  style={{
                    color: 'var(--color-cloud)',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {campaign.description}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--color-dark-border)',
                    paddingTop: '1rem',
                  }}
                >
                  <div>
                    <span
                      style={{
                        color: 'var(--color-cloud)',
                        fontSize: '0.875rem',
                      }}
                    >
                      GM: {campaign.owner.username}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        navigate(`/campaigns/${campaign._id}`);
                      }}
                    >
                      Details
                    </Button>

                    {campaign.playerSlots.filter(slot => slot.character).length < campaign.playerSlots.length && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => {
                          // Handle join action
                          showInfo(`Joining campaign: ${campaign.name}`);
                        }}
                      >
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CampaignCreator
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCampaignCreated={handleCampaignCreated}
      />
    </div>
  );
};

export default Campaigns;
