import React from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';

interface BackgroundTabProps {
  physicalTraits: {
    size: string;
    weight: string;
    height: string;
    gender: string;
  };
  appearance: string;
  biography: string;
  portraitUrl?: string | null;
}

const BackgroundTab: React.FC<BackgroundTabProps> = ({ 
  physicalTraits, 
  appearance, 
  biography,
  portraitUrl
}) => {
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
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                Gender
              </div>
              <div style={{ color: 'var(--color-white)' }}>
                {physicalTraits.gender || 'Not specified'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                Height
              </div>
              <div style={{ color: 'var(--color-white)' }}>
                {physicalTraits.height || 'Not specified'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                Weight
              </div>
              <div style={{ color: 'var(--color-white)' }}>
                {physicalTraits.weight || 'Not specified'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                Size
              </div>
              <div style={{ color: 'var(--color-white)' }}>
                {physicalTraits.size || 'Medium'}
              </div>
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
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Biography
          </h2>
        </CardHeader>
        <CardBody>
          <p style={{ color: 'var(--color-cloud)' }}>
            {biography || 'No biography provided.'}
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default BackgroundTab;