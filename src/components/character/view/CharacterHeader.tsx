import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import CharacterPortraitUploader from '../CharacterPortraitUploader';
import ResourceBars from './ResourceBars';

interface CharacterHeaderProps {
  character: {
    _id: string;
    name: string;
    race: string;
    culture: string;
    public?: boolean;
    characterCulture?: {
      cultureId: any;
      selectedRestriction?: any;
      selectedBenefit?: any;
      selectedRitual?: any;
      selectedStartingItem?: any;
    };
    modulePoints?: {
      total: number;
      spent: number;
    };
    resources: {
      health: { current: number; max: number };
      energy: { current: number; max: number };
      resolve: { current: number; max: number };
      morale?: { current: number; max: number };
    };
    movement: number;
    sprintSpeed?: number;
    swim_speed?: number;
    climb_speed?: number;
    fly_speed?: number;
    encumbrance_penalty?: number;
    encumbrance_check?: number;
    sprint_check?: number;
    languages?: string[];
    stances?: string[];
    portraitUrl?: string | null;
    mitigation?: {
      physical?: number;
      heat?: number;
      cold?: number;
      electric?: number;
      dark?: number;
      divine?: number;
      aether?: number;
      psychic?: number;
      toxic?: number;
    };
  };
  onDelete?: () => void;
  onResourceChange?: (
    resource: 'health' | 'energy' | 'resolve' | 'morale',
    newCurrent: number
  ) => void;
}

const CharacterHeader: React.FC<CharacterHeaderProps> = ({
  character,
  onDelete,
  onResourceChange,
}) => {
  const [portraitUrl, setPortraitUrl] = useState<string | null>(character.portraitUrl || null);
  const [isPublic, setIsPublic] = useState(character.public ?? true);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const { showError } = useToast();

  const handlePortraitChange = async (file: File) => {
    if (!file) return;

    try {
      // Create form data
      const formData = new FormData();
      formData.append('portrait', file);

      // Upload portrait
      const response = await fetch(`/api/portraits/${character._id}/portrait`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload portrait');
      }

      const data = await response.json();

      // Update portrait URL
      setPortraitUrl(data.portraitUrl);
    } catch (error) {
      console.error('Error uploading portrait:', error);
      showError('Failed to upload portrait. Please try again.');
    }
  };

  const handlePublicToggle = async () => {
    const newValue = !isPublic;
    setIsUpdatingVisibility(true);
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
      showError('Failed to update character visibility. Please try again.');
      // Don't revert on error since we want to show the failed state
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleExportToFoundry = async () => {
    try {
      const response = await fetch(`/api/characters/${character._id}/export-foundry`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export character');
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_foundry.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting character:', error);
      showError('Failed to export character to Foundry VTT. Please try again.');
    }
  };

  return (
    <Card variant="default">
      {/* Header with character name and action buttons */}
      <CardHeader
        style={{
          backgroundColor: 'var(--color-sat-purple-faded)',
          padding: '0.75rem 1.25rem',
        }}
      >
        <div className="flex justify-between items-center">
          <h1
            style={{
              color: 'var(--color-white)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 'bold',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            {character.name}
          </h1>

          <div className="flex gap-2">
            {/* Visibility Toggle */}
            {onDelete && (
              <button
                onClick={handlePublicToggle}
                disabled={isUpdatingVisibility}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: '1px solid',
                  cursor: isUpdatingVisibility ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: isPublic ? 'var(--color-green-600)' : 'var(--color-sunset)',
                  borderColor: isPublic ? 'var(--color-green-600)' : 'var(--color-sunset)',
                  color: 'white',
                  opacity: isUpdatingVisibility ? 0.7 : 1,
                }}
                title={isPublic ? 'Click to make private' : 'Click to make public'}
              >
                {isUpdatingVisibility ? '...' : isPublic ? 'Public' : 'Private'}
              </button>
            )}
            <button
              onClick={handleExportToFoundry}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: '2px solid #000',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: '#FF6400',
                color: '#000',
                boxShadow: '0 2px 4px rgba(255, 100, 0, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FF7A1A';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 100, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF6400';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 100, 0, 0.3)';
              }}
              title="Export to Foundry VTT"
            >
              Export FVTT
            </button>
            <Link to={`/characters/${character._id}/edit`}>
              <Button variant="secondary" size="sm">
                Edit
              </Button>
            </Link>
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Portrait section - left column */}
          <div className="flex-shrink-0 flex justify-center">
            <CharacterPortraitUploader
              currentPortrait={portraitUrl}
              onPortraitChange={handlePortraitChange}
              size="medium"
            />
          </div>

          {/* Character details - right column */}
          <div className="flex-1">
            {/* Main character info - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 mb-4">
              <div>
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>Race</div>
                <div style={{ color: 'var(--color-white)' }}>{character.race}</div>
              </div>

              <div>
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>Culture</div>
                <div style={{ color: 'var(--color-white)' }}>
                  {character.characterCulture?.cultureId?.name ||
                    character.culture ||
                    'Not specified'}
                </div>
                {character.characterCulture && (
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {character.characterCulture.selectedRestriction && (
                      <div style={{ color: 'var(--color-danger)', marginBottom: '0.125rem' }}>
                        ⚠ {character.characterCulture.selectedRestriction.name}
                      </div>
                    )}
                    {character.characterCulture.selectedBenefit && (
                      <div style={{ color: 'var(--color-success)', marginBottom: '0.125rem' }}>
                        ✓ {character.characterCulture.selectedBenefit.name}
                      </div>
                    )}
                    {character.characterCulture.selectedRitual && (
                      <div style={{ color: 'var(--color-warning)' }}>
                        ◆ {character.characterCulture.selectedRitual.name}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                  Module Points
                </div>
                <div style={{ color: 'var(--color-white)' }}>
                  {character.modulePoints
                    ? `${character.modulePoints.total - character.modulePoints.spent} / ${character.modulePoints.total}`
                    : 'Not available'}
                </div>
              </div>
            </div>

            {/* Movement and Encumbrance Tables */}
            <div className="mb-4 flex flex-col md:flex-row gap-4">
              {/* Movement Speeds Table */}
              <div
                style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--color-dark-border)',
                  overflow: 'hidden',
                  flex: 1,
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: 'var(--color-dark-bg)',
                        borderBottom: '1px solid var(--color-dark-border)',
                      }}
                    >
                      <th
                        style={{
                          color: 'var(--color-cloud)',
                          padding: '0.5rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                        }}
                      >
                        Movement
                      </th>
                      <th
                        style={{
                          color: 'var(--color-cloud)',
                          padding: '0.5rem',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                        }}
                      >
                        Normal
                      </th>
                      <th
                        style={{
                          color: 'var(--color-cloud)',
                          padding: '0.5rem',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                        }}
                      >
                        Sprint
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          fontWeight: '500',
                        }}
                      >
                        Walk
                      </td>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: '600',
                        }}
                      >
                        {character.movement}
                      </td>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: '600',
                        }}
                      >
                        {character.movement * 2}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          fontWeight: '500',
                        }}
                      >
                        Swim
                      </td>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: '600',
                        }}
                      >
                        {character.swim_speed || Math.floor(character.movement / 2)}
                      </td>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: '600',
                        }}
                      >
                        {(character.swim_speed || Math.floor(character.movement / 2)) * 2}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          fontWeight: '500',
                        }}
                      >
                        Climb
                      </td>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: '600',
                        }}
                      >
                        {character.climb_speed || Math.floor(character.movement / 2)}
                      </td>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: '600',
                        }}
                      >
                        {(character.climb_speed || Math.floor(character.movement / 2)) * 2}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Encumbrance Table */}
              <div
                style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--color-dark-border)',
                  overflow: 'hidden',
                  flex: 1,
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: 'var(--color-dark-bg)',
                        borderBottom: '1px solid var(--color-dark-border)',
                      }}
                    >
                      <th
                        style={{
                          color: 'var(--color-cloud)',
                          padding: '0.5rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                        }}
                        colSpan={2}
                      >
                        Encumbrance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          fontWeight: '500',
                        }}
                      >
                        Standard Check
                      </td>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: '600',
                        }}
                      >
                        {character.encumbrance_check === 0 || !character.encumbrance_check
                          ? 'None'
                          : character.encumbrance_check}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          fontWeight: '500',
                        }}
                      >
                        Sprint Check
                      </td>
                      <td
                        style={{
                          color: 'var(--color-white)',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: '600',
                        }}
                      >
                        {character.sprint_check === 0 || !character.sprint_check
                          ? 'None'
                          : character.sprint_check}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Languages and Stances - if they exist */}
            {((character.languages && character.languages.length > 0) ||
              (character.stances && character.stances.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                {character.languages && character.languages.length > 0 && (
                  <div>
                    <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                      Languages
                    </div>
                    <div style={{ color: 'var(--color-white)' }}>
                      {character.languages.join(', ')}
                    </div>
                  </div>
                )}

                {character.stances && character.stances.length > 0 && (
                  <div>
                    <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>Stances</div>
                    <div style={{ color: 'var(--color-white)' }}>
                      {character.stances.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resources and Mitigation Section */}
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Resource bars - left column */}
          <div className="flex-1">
            <ResourceBars
              resources={character.resources}
              onResourceChange={onResourceChange}
              readOnly={!onResourceChange}
            />
          </div>

          {/* Mitigation Table - right column */}
          {character.mitigation && (
            <div className="flex-1 flex justify-center">
              <div
                style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--color-dark-border)',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '500px',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: 'var(--color-dark-bg)',
                        borderBottom: '1px solid var(--color-dark-border)',
                      }}
                    >
                      <th
                        style={{
                          color: 'var(--color-cloud)',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                        }}
                      >
                        Mitigation
                      </th>
                      <th
                        style={{
                          color: 'var(--color-cloud)',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                        }}
                      >
                        Complete
                      </th>
                      <th
                        style={{
                          color: 'var(--color-cloud)',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                        }}
                      >
                        Half
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {character.mitigation &&
                      Object.entries(character.mitigation).map(([type, value], index) => (
                        <tr
                          key={type}
                          style={{
                            borderBottom:
                              index < Object.entries(character.mitigation || {}).length - 1
                                ? '1px solid var(--color-dark-border)'
                                : 'none',
                          }}
                        >
                          <td
                            style={{
                              color: 'var(--color-white)',
                              padding: '0.25rem 0.5rem',
                              textTransform: 'capitalize',
                              fontWeight: '500',
                              fontSize: '1rem',
                            }}
                          >
                            {type}
                          </td>
                          <td
                            style={{
                              color: 'var(--color-metal-gold)',
                              padding: '0.25rem 0.5rem',
                              textAlign: 'center',
                              fontWeight: '600',
                              fontSize: '1rem',
                            }}
                          >
                            {value}
                          </td>
                          <td
                            style={{
                              color: 'var(--color-sat-purple)',
                              padding: '0.25rem 0.5rem',
                              textAlign: 'center',
                              fontWeight: '600',
                              fontSize: '1rem',
                            }}
                          >
                            {value * 2}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default CharacterHeader;
