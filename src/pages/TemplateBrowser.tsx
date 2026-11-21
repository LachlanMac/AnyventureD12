import React from 'react';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

const TemplateBrowser: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--color-white)',
            marginBottom: '0.5rem',
          }}
        >
          Build Templates
        </h1>
        <p style={{ color: 'var(--color-cloud)', fontSize: '0.95rem' }}>
          Pre-built module configurations for common character archetypes. Select a template to see
          which modules and options it includes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 style={{ color: 'var(--color-white)', fontSize: '1.25rem' }}>Coming Soon</h2>
        </CardHeader>
        <CardBody>
          <p style={{ color: 'var(--color-cloud)' }}>
            Templates will let you browse and apply pre-made module builds to your characters. You
            will also be able to export your own character builds as templates to share with others.
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default TemplateBrowser;
