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
      pain?: { custom: number; calculated: number };
      stress?: { custom: number; calculated: number };
    };
    movement: number;
    sprintSpeed?: number;
    swim_speed?: number;
    climb_speed?: number;
    fly_speed?: number;
    encumbrance_penalty?: number;
    encumbrance_check?: number;
    sprint_check?: number;
    injuries?: any[];
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
      aetheric?: number;
      psychic?: number;
      toxic?: number;
    };
  };
  onDelete?: () => void;
  onResourceChange?: (
    resource: 'health' | 'energy' | 'resolve' | 'morale',
    newCurrent: number
  ) => void;
  onPainStressChange?: (
    type: 'pain' | 'stress',
    newCustomValue: number
  ) => void;
}

const CharacterHeader: React.FC<CharacterHeaderProps> = ({
  character,
  onDelete,
  onResourceChange,
  onPainStressChange,
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

          <div className="flex gap-2 items-center">
            {/* Visibility Toggle */}
            {onDelete && (
              <button
                onClick={handlePublicToggle}
                disabled={isUpdatingVisibility}
                style={{
                  position: 'relative',
                  width: '3rem',
                  height: '1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: isUpdatingVisibility ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  backgroundColor: isPublic ? 'var(--color-success)' : 'var(--color-dark-border)',
                  opacity: isUpdatingVisibility ? 0.7 : 1,
                  flexShrink: 0,
                }}
                title={isPublic ? 'Public - click to make private' : 'Private - click to make public'}
              >
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: isPublic ? 'calc(100% - 1.25rem - 2px)' : '2px',
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'left 0.2s ease',
                }} />
              </button>
            )}
            {onDelete && (
              <span style={{ fontSize: '0.7rem', color: 'var(--color-cloud)', whiteSpace: 'nowrap' }}>
                {isPublic ? 'Public' : 'Private'}
              </span>
            )}

            {/* Export Foundry */}
            <button
              onClick={handleExportToFoundry}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                border: '1px solid var(--color-dark-border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-cloud)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-dark-surface)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-dark-elevated)'; }}
              title="Export to Foundry VTT"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              FVTT
            </button>

            {/* Edit */}
            <Link to={`/characters/${character._id}/edit`}>
              <button
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  border: '1px solid var(--color-dark-border)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-cloud)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-dark-surface)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-dark-elevated)'; }}
              >
                Edit
              </button>
            </Link>
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
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>Ancestry</div>
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
                        {character.characterCulture.selectedRestriction.name}
                      </div>
                    )}
                    {character.characterCulture.selectedBenefit && (
                      <div style={{ color: 'var(--color-success)' }}>
                        {character.characterCulture.selectedBenefit.name}
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
              injuries={character.injuries}
              onResourceChange={onResourceChange}
              onPainStressChange={onPainStressChange}
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
                        Type
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
                        Mit.
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
                        Limit
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
                            {typeof value === 'object' ? (value as any).min : value}
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
                            {typeof value === 'object' ? (value as any).max : 25}
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
