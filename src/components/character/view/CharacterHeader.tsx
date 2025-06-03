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
    modulePoints?: {
      total: number;
      spent: number;
    };
    resources: {
      health: { current: number; max: number };
      energy: { current: number; max: number };
      resolve: { current: number; max: number };
    };
    movement: number;
    sprintSpeed?: number;
    languages?: string[];
    stances?: string[];
    portraitUrl?: string | null;
    mitigation?: {
      physical?: number;
      heat?: number;
      cold?: number;
      lightning?: number;
      dark?: number;
      divine?: number;
      aether?: number;
      psychic?: number;
      toxic?: number;
    };
  };
  onDelete?: () => void;
  onResourceChange?: (resource: 'health' | 'energy' | 'resolve', newCurrent: number) => void;
}

const CharacterHeader: React.FC<CharacterHeaderProps> = ({ character, onDelete, onResourceChange }) => {
  const [portraitUrl, setPortraitUrl] = useState<string | null>(character.portraitUrl || null);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>Race</div>
                <div style={{ color: 'var(--color-white)' }}>{character.race}</div>
              </div>

              <div>
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>Culture</div>
                <div style={{ color: 'var(--color-white)' }}>
                  {character.culture || 'Not specified'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>Movement</div>
                <div style={{ color: 'var(--color-white)' }}>{character.movement} Units</div>
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

              {character.languages && character.languages.length > 0 && (
                <div>
                  <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>Languages</div>
                  <div style={{ color: 'var(--color-white)' }}>
                    {character.languages.join(', ')}
                  </div>
                </div>
              )}

              {character.stances && character.stances.length > 0 && (
                <div>
                  <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>Stances</div>
                  <div style={{ color: 'var(--color-white)' }}>{character.stances.join(', ')}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resources and Mitigation Section */}
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Resource bars and Movement - left column */}
          <div className="flex-1">
            <ResourceBars 
              resources={character.resources} 
              onResourceChange={onResourceChange}
              readOnly={!onResourceChange}
            />

            {/* Movement Speeds */}
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>Movement Speed</div>
                  <div style={{ color: 'var(--color-white)', fontWeight: '600' }}>
                    {character.movement} Units
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>Sprint Speed</div>
                  <div style={{ color: 'var(--color-white)', fontWeight: '600' }}>
                    {character.sprintSpeed || (character.movement * 2)} Units
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>Climb Speed</div>
                  <div style={{ color: 'var(--color-white)', fontWeight: '600' }}>
                    3 Units
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>Swim Speed</div>
                  <div style={{ color: 'var(--color-white)', fontWeight: '600' }}>
                    3 Units
                  </div>
                </div>
              </div>
            </div>
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
                    {character.mitigation && Object.entries(character.mitigation).map(([type, value], index) => (
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
