import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';

interface Campaign {
  _id: string;
  name: string;
  owner: {
    _id: string;
    username: string;
  };
  playerSlots: {
    _id: string;
    character?: {
      _id: string;
      name: string;
      portraitUrl?: string;
      player: {
        _id: string;
        username: string;
      };
    };
    inviteToken?: string;
    isOpen: boolean;
  }[];
}

interface PlayerSlotManagerProps {
  campaign: Campaign;
  isOwner: boolean;
  onSlotUpdated: () => void;
}

const PlayerSlotManager: React.FC<PlayerSlotManagerProps> = ({
  campaign,
  isOwner,
  onSlotUpdated,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, confirm } = useToast();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [inviteLinks, setInviteLinks] = useState<{ [key: number]: string }>({});
  const [showInviteLink, setShowInviteLink] = useState<{ [key: number]: boolean }>({});

  const handleGenerateInvite = async (slotIndex: number) => {
    if (!isOwner) return;

    setLoading((prev) => ({ ...prev, [`invite-${slotIndex}`]: true }));

    try {
      const response = await fetch(`/api/campaigns/${campaign._id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ slotIndex }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate invite link');
      }

      const data = await response.json();

      // Store the full invite link
      const fullInviteLink = data.inviteLink.startsWith('http')
        ? data.inviteLink
        : `${window.location.origin}${data.inviteLink}`;

      setInviteLinks((prev) => ({ ...prev, [slotIndex]: fullInviteLink }));
      setShowInviteLink((prev) => ({ ...prev, [slotIndex]: true }));

      // Auto-copy to clipboard
      try {
        await navigator.clipboard.writeText(fullInviteLink);
        showSuccess('Invite link generated and copied to clipboard!');
      } catch (err) {
        // Silent fail, user can still use the copy button
      }

      onSlotUpdated();
    } catch (error) {
      showError(
        `Failed to generate invite link: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading((prev) => ({ ...prev, [`invite-${slotIndex}`]: false }));
    }
  };

  const handleToggleSlot = async (slotIndex: number, isOpen: boolean) => {
    if (!isOwner) return;

    setLoading((prev) => ({ ...prev, [`toggle-${slotIndex}`]: true }));

    try {
      const response = await fetch(`/api/campaigns/${campaign._id}/slots`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ slotIndex, isOpen }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle slot');
      }

      // Clear invite link if closing slot
      if (!isOpen) {
        setInviteLinks((prev) => {
          const newLinks = { ...prev };
          delete newLinks[slotIndex];
          return newLinks;
        });
        setShowInviteLink((prev) => ({ ...prev, [slotIndex]: false }));
      }

      onSlotUpdated();
    } catch (error) {
      showError('Failed to update slot');
    } finally {
      setLoading((prev) => ({ ...prev, [`toggle-${slotIndex}`]: false }));
    }
  };

  const handleKickPlayer = async (characterId: string) => {
    if (!isOwner) return;

    const confirmed = await confirm({
      title: 'Kick Player',
      message: 'Are you sure you want to kick this player?',
      confirmText: 'Kick',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, [`kick-${characterId}`]: true }));

    try {
      const response = await fetch(`/api/campaigns/${campaign._id}/players`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ characterId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to kick player');
      }

      onSlotUpdated();
    } catch (error) {
      showError('Failed to kick player');
    } finally {
      setLoading((prev) => ({ ...prev, [`kick-${characterId}`]: false }));
    }
  };

  const handleLeaveCampaign = async (characterId: string) => {
    const confirmed = await confirm({
      title: 'Leave Campaign',
      message: 'Are you sure you want to leave this campaign?',
      confirmText: 'Leave',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, [`leave-${characterId}`]: true }));

    try {
      const response = await fetch(`/api/campaigns/${campaign._id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ characterId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to leave campaign');
      }

      onSlotUpdated();
    } catch (error) {
      showError('Failed to leave campaign');
    } finally {
      setLoading((prev) => ({ ...prev, [`leave-${characterId}`]: false }));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Invite link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showSuccess('Invite link copied to clipboard!');
      } catch (fallbackError) {
        showError('Failed to copy invite link');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="space-y-4">
      {campaign.playerSlots.map((slot, index) => (
        <div
          key={slot._id}
          className="p-4 border rounded-lg"
          style={{
            backgroundColor: 'var(--color-dark-base)',
            border: '1px solid var(--color-dark-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all"
                style={{
                  backgroundColor: slot.character?.portraitUrl
                    ? 'transparent'
                    : 'var(--color-stormy)',
                }}
                onClick={() =>
                  slot.character &&
                  navigate(`/characters/${slot.character._id}?campaign=${campaign._id}`)
                }
              >
                {slot.character?.portraitUrl ? (
                  <img
                    src={slot.character.portraitUrl}
                    alt={slot.character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold">#{index + 1}</span>
                )}
              </div>

              <div
                className={slot.character ? 'cursor-pointer' : ''}
                onClick={() =>
                  slot.character &&
                  navigate(`/characters/${slot.character._id}?campaign=${campaign._id}`)
                }
              >
                {slot.character ? (
                  <div>
                    <h3 className="text-white font-semibold hover:text-yellow-400 transition-colors">
                      {slot.character.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Player: {slot.character.player.username}
                    </p>
                  </div>
                ) : slot.isOpen ? (
                  <div>
                    <h3 className="text-yellow-400 font-semibold">Open Slot</h3>
                    <p className="text-gray-400 text-sm">Waiting for player to join</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-gray-500 font-semibold">Closed Slot</h3>
                    <p className="text-gray-400 text-sm">Not accepting players</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {slot.character ? (
                // Slot has character
                <>
                  {isOwner && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleKickPlayer(slot.character!._id)}
                      disabled={loading[`kick-${slot.character._id}`]}
                    >
                      {loading[`kick-${slot.character._id}`] ? 'Kicking...' : 'Kick'}
                    </Button>
                  )}
                  {slot.character.player._id === user?.id && !isOwner && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleLeaveCampaign(slot.character!._id)}
                      disabled={loading[`leave-${slot.character._id}`]}
                    >
                      {loading[`leave-${slot.character._id}`] ? 'Leaving...' : 'Leave'}
                    </Button>
                  )}
                </>
              ) : isOwner ? (
                // Owner controls for empty slots
                <div className="flex items-center space-x-2">
                  {slot.isOpen ? (
                    <>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleGenerateInvite(index)}
                        disabled={loading[`invite-${index}`] || !!inviteLinks[index]}
                      >
                        {loading[`invite-${index}`]
                          ? 'Generating...'
                          : inviteLinks[index]
                            ? 'Invite Generated'
                            : 'Generate Invite'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleSlot(index, false)}
                        disabled={loading[`toggle-${index}`]}
                      >
                        {loading[`toggle-${index}`] ? 'Closing...' : 'Close Slot'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => handleToggleSlot(index, true)}
                      disabled={loading[`toggle-${index}`]}
                    >
                      {loading[`toggle-${index}`] ? 'Opening...' : 'Open Slot'}
                    </Button>
                  )}
                </div>
              ) : (
                // Non-owner view
                slot.isOpen && <span className="text-yellow-400 text-sm">Accepting Players</span>
              )}
            </div>
          </div>

          {/* Invite Link Display */}
          {isOwner && showInviteLink[index] && inviteLinks[index] && (
            <div
              className="mt-4 p-3 rounded"
              style={{
                backgroundColor: 'rgba(215, 183, 64, 0.1)',
                border: '1px solid rgba(215, 183, 64, 0.3)',
                animation: 'fadeIn 0.3s ease-in',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--color-metal-gold)' }}
                  >
                    Invite Link Generated!
                  </label>
                  <input
                    type="text"
                    value={inviteLinks[index]}
                    readOnly
                    className="w-full px-3 py-2 text-white text-sm rounded focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-dark-base)',
                      border: '1px solid var(--color-dark-border)',
                    }}
                  />
                </div>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => copyToClipboard(inviteLinks[index])}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--color-cloud)' }}>
                Share this link with the player you want to invite. The link will expire once used
                or if the slot is closed.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlayerSlotManager;
