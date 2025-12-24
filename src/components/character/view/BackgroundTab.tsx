import React, { useState } from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import Button from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';
import { charactersApi } from '../../../api/characters';

interface BackgroundTabProps {
  physicalTraits: {
    size: string;
    weight: string;
    height: string;
    gender: string;
  };
  appearance: string;
  race: string;
  culture: string;
  biography: string;
  portraitUrl?: string | null;
  characterId: string;
  onBiographyUpdate: (biography: string) => void;
  canEdit?: boolean;
}

const BackgroundTab: React.FC<BackgroundTabProps> = ({
  physicalTraits,
  appearance,
  biography,
  race,
  culture,
  portraitUrl,
  characterId,
  onBiographyUpdate,
  canEdit = true,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  const handleGenerateBiography = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      showToast('Generating AI biography... This may take a moment.', 'info');

      const response = await charactersApi.generateBiography(characterId);

      if (response.biography) {
        onBiographyUpdate(response.biography);
        showToast('Biography generated successfully!', 'success');
      } else {
        throw new Error('No biography returned from server');
      }
    } catch (error: any) {
      console.error('Error generating biography:', error);

      // Check for specific error messages
      if (error.response?.status === 503) {
        showToast('Cannot connect to AI server. Please ensure it is running.', 'error');
      } else if (error.response?.status === 504) {
        showToast('AI server request timed out. Please try again.', 'error');
      } else {
        showToast(
          error.response?.data?.message || 'Failed to generate biography. Please try again.',
          'error'
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {/* Character Portrait */}
      {portraitUrl && (
        <Card variant="default" style={{ marginBottom: '1.5rem' }}>
          <CardHeader>
            <h2
              style={{
                color: 'var(--color-white)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              Character Portrait
            </h2>
          </CardHeader>
          <CardBody>
            <div className="flex justify-center">
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-dark-elevated)',
                  border: '1px solid var(--color-dark-border)',
                }}
              >
                <img
                  src={portraitUrl}
                  alt="Character portrait"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      )}
      {/* Origins */}
      <Card variant="default" style={{ marginBottom: '1.5rem' }}>
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Origins
          </h2>
        </CardHeader>
        <CardBody>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Ancestry</div>
              <div style={{ color: 'var(--color-white)' }}>{race || 'Not specified'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Culture</div>
              <div style={{ color: 'var(--color-white)' }}>{culture || 'Not specified'}</div>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card variant="default" style={{ marginBottom: '1.5rem' }}>
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Physical Characteristics
          </h2>
        </CardHeader>
        <CardBody>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Gender</div>
              <div style={{ color: 'var(--color-white)' }}>
                {physicalTraits.gender || 'Not specified'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Height</div>
              <div style={{ color: 'var(--color-white)' }}>
                {physicalTraits.height || 'Not specified'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Weight</div>
              <div style={{ color: 'var(--color-white)' }}>
                {physicalTraits.weight || 'Not specified'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Size</div>
              <div style={{ color: 'var(--color-white)' }}>{physicalTraits.size || 'Medium'}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card variant="default" style={{ marginBottom: '1.5rem' }}>
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Appearance
          </h2>
        </CardHeader>
        <CardBody>
          <p style={{ color: 'var(--color-cloud)' }}>
            {appearance || 'No appearance description provided.'}
          </p>
        </CardBody>
      </Card>

      <Card variant="default">
        <CardHeader>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                color: 'var(--color-white)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              Biography
            </h2>
            {canEdit && (
              <Button
                onClick={handleGenerateBiography}
                disabled={isGenerating}
                size="sm"
                variant="secondary"
              >
                {isGenerating ? 'Generating...' : 'Generate Biography'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <p style={{ color: 'var(--color-cloud)', whiteSpace: 'pre-wrap' }}>
            {biography || 'No biography provided.'}
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default BackgroundTab;
