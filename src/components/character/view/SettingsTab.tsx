import React, { useState } from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import { Character } from '../../../types/character';

interface SettingsTabProps {
  character: Character;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ character }) => {
  const [isPublic, setIsPublic] = useState(character.public ?? true);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePublicToggle = async (newValue: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/characters/${character._id}/public`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ public: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update character visibility');
      }

      setIsPublic(newValue);
    } catch (error) {
      console.error('Error updating character visibility:', error);
      // Revert on error
      setIsPublic(isPublic);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card variant="default">
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Character Visibility
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <p style={{ color: 'var(--color-cloud)' }}>
              Control who can view this character. Public characters can be viewed by anyone with
              the character link, while private characters can only be viewed by you.
            </p>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => handlePublicToggle(true)}
                disabled={isUpdating}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  isPublic
                    ? 'bg-green-600 text-white'
                    : 'bg-dark-elevated text-cloud border border-dark-border hover:bg-dark-border'
                }`}
              >
                Public
              </button>

              <button
                onClick={() => handlePublicToggle(false)}
                disabled={isUpdating}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  !isPublic
                    ? 'bg-sunset text-white'
                    : 'bg-dark-elevated text-cloud border border-dark-border hover:bg-dark-border'
                }`}
              >
                Private
              </button>
            </div>

            {isUpdating && (
              <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>Updating...</div>
            )}

            <div className="mt-6 p-4 bg-dark-elevated rounded-lg">
              <h3
                style={{
                  color: 'var(--color-white)',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}
              >
                Current Status: {isPublic ? 'Public' : 'Private'}
              </h3>
              <p style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                {isPublic
                  ? 'Anyone with the link can view this character, but only you can edit it.'
                  : 'Only you can view and edit this character.'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SettingsTab;
