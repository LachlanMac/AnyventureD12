// Simplified src/components/character/view/TraitsTab.tsx

import React from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';

interface ModuleTrait {
  name: string;
  description: string;
  source: string;
  type: string;
}

interface TraitCategories {
  General: ModuleTrait[];
  Crafting: ModuleTrait[];
  Ancestry: ModuleTrait[];
  Uncategorized: ModuleTrait[];
}

interface TraitsTabProps {
  character: {
    derivedTraits?: TraitCategories;
    [key: string]: any;
  };
  characterId: string;
  personality?: string;
}

const TraitsTab: React.FC<TraitsTabProps> = ({ character, personality: _personality }) => {
  const traitCategories = character.derivedTraits || {
    General: [],
    Crafting: [],
    Ancestry: [],
    Uncategorized: [],
  };

  const renderTraitCategory = (categoryName: string, traits: ModuleTrait[] = []) => {
    if (!traits || traits.length === 0) return null;
    return (
      <div key={categoryName} style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            color: 'var(--color-metal-gold)',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          {categoryName} Traits
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1rem',
          }}
        >
          {traits.map((trait, index) => (
            <Card key={`${trait.name}-${index}`} variant="default">
              <CardHeader
                style={{
                  backgroundColor: 'var(--color-sat-purple-faded)',
                }}
              >
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
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {trait.name}
                  </h2>
                  <span
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: 'var(--color-cloud)',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                    }}
                  >
                    {trait.source}
                  </span>
                </div>
              </CardHeader>
              <CardBody>
                <p
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                  }}
                >
                  {trait.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Check if we have any traits across all categories
  const hasAnyTraits = Object.values(traitCategories).some(
    (category) => category && category.length > 0
  );

  return (
    <div>
      {!hasAnyTraits ? (
        <Card variant="default">
          <CardBody>
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--color-cloud)',
              }}
            >
              No traits found. Traits are derived from selected module options.
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Display traits by category */}
          {renderTraitCategory('Ancestry', traitCategories.Ancestry)}
          {renderTraitCategory('General', traitCategories.General)}
          {renderTraitCategory('Crafting', traitCategories.Crafting)}
          {renderTraitCategory('Uncategorized', traitCategories.Uncategorized)}
        </>
      )}
    </div>
  );
};

export default TraitsTab;
