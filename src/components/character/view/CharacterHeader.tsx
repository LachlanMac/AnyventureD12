import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button'
import CharacterPortraitUploader from '../CharacterPortraitUploader';

interface CharacterHeaderProps {
  character: {
    _id: string;
    name: string;
    race: string;
    modulePoints?: {
      total: number;
      spent: number;
    };
    resources: {
      health: { current: number; max: number };
      stamina: { current: number; max: number };
      resolve: { current: number; max: number };
    };
    movement: number;
    languages?: string[];
    stances?: string[];
    portraitUrl?: string | null;
  };
  onDelete: () => void;
}

const CharacterHeader: React.FC<CharacterHeaderProps> = ({ character, onDelete }) => {
  const [portraitUrl, setPortraitUrl] = useState<string | null>(character.portraitUrl || null);

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
      alert('Failed to upload portrait. Please try again.');
    }
  };

  // Helper function to render resource bars
  const renderResourceBar = (current: number, max: number, color: string, label: string) => {
    const percentage = (current / max) * 100;
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span style={{ color: 'var(--color-cloud)' }}>{label}</span>
          <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
            {current}/{max}
          </span>
        </div>
        <div
          style={{
            position: 'relative',
            height: '0.75rem',
            backgroundColor: 'var(--color-dark-elevated)',
            borderRadius: '0.375rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${percentage}%`,
              backgroundColor: color,
              borderRadius: '0.375rem',
            }}
          />
        </div>
      </div>
    );
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
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={onDelete}>
              Delete
            </Button>
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

          {/* Resource bars - middle column */}
          <div className="flex-1">
            {renderResourceBar(
              character.resources.health.current,
              character.resources.health.max, 
              'var(--color-sunset)', 
              'Health'
            )}
            
            {renderResourceBar(
              character.resources.stamina.current,
              character.resources.stamina.max, 
              'var(--color-metal-gold)', 
              'Stamina'
            )}
            
            {renderResourceBar(
              character.resources.resolve.current, 
              character.resources.resolve.max, 
              'var(--color-sat-purple)', 
              'Resolve'
            )}
          </div>

          {/* Character details - right column */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                  Race
                </div>
                <div style={{ color: 'var(--color-white)' }}>
                  {character.race}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                  Movement
                </div>
                <div style={{ color: 'var(--color-white)' }}>
                  {character.movement} Units
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                  Module Points
                </div>
                <div style={{ color: 'var(--color-white)' }}>
                  {character.modulePoints ? 
                    `${character.modulePoints.total - character.modulePoints.spent} / ${character.modulePoints.total}` : 
                    'Not available'}
                </div>
              </div>

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
                  <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                    Stances
                  </div>
                  <div style={{ color: 'var(--color-white)' }}>
                    {character.stances.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CharacterHeader;