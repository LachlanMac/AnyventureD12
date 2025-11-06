import React from 'react';
import { Attributes } from '../../../types/character';
import { ATTRIBUTE_SKILLS } from '../../../constants/skillConstants';

interface AttributesTabProps {
  attributes: Attributes;
  attributePointsRemaining: number;
  onUpdateAttribute: (
    attribute: keyof import('../../../types/character').Attributes,
    newValue: number
  ) => void;
}

const AttributesTab: React.FC<AttributesTabProps> = ({
  attributes,
  attributePointsRemaining,
  onUpdateAttribute,
}) => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <h2
          style={{
            color: 'var(--color-white)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}
        >
          Attributes
        </h2>
        <div
          style={{
            backgroundColor: 'var(--color-dark-elevated)',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            color: attributePointsRemaining > 0 ? 'var(--color-metal-gold)' : 'var(--color-white)',
          }}
        >
          Points Remaining: <span style={{ fontWeight: 'bold' }}>{attributePointsRemaining}</span>
        </div>
      </div>

      {/* Explanatory text for Attributes */}
      <div
        style={{
          padding: '0.75rem',
          marginBottom: '1.5rem',
          backgroundColor: 'rgba(85, 65, 130, 0.15)',
          borderRadius: '0.375rem',
          borderLeft: '3px solid var(--color-sat-purple)',
        }}
      >
        <p
          style={{
            color: 'var(--color-cloud)',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            margin: 0,
          }}
        >
          Attributes are the talents your character is born with, reflecting innate ability. Attributes determine how many dice you roll for the skills that fall under each attribute. For example, 3 points in finesse allow you to roll 3 dice for evasion, stealth, coordination and thievery and take the highest result. Under normal circumstances, you will not have an opportunity to increase these talents further, so allocate them wisely.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Object.entries(ATTRIBUTE_SKILLS).map(([attributeId, skills]) => (
          <div key={attributeId}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <label style={{ color: 'var(--color-metal-gold)', fontWeight: 'bold' }}>
                {attributeId.charAt(0).toUpperCase() + attributeId.slice(1)}
              </label>
              <div>
                <span
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                  }}
                >
                   {skills.map((skill) => skill.name).join(', ')} 
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <button
                type="button"
                disabled={attributes[attributeId as keyof Attributes] <= 1}
                onClick={() =>
                  onUpdateAttribute(
                    attributeId as keyof Attributes,
                    Math.max(1, attributes[attributeId as keyof Attributes] - 1)
                  )
                }
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: 'none',
                  cursor:
                    attributes[attributeId as keyof Attributes] <= 1 ? 'not-allowed' : 'pointer',
                  opacity: attributes[attributeId as keyof Attributes] <= 1 ? 0.5 : 1,
                }}
              >
                -
              </button>

              <div
                style={{
                  width: '3rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-sat-purple-faded)',
                  color: 'var(--color-white)',
                  borderRadius: '0.375rem',
                  fontWeight: 'bold',
                }}
              >
                {attributes[attributeId as keyof Attributes]}
              </div>

              <button
                type="button"
                disabled={
                  attributes[attributeId as keyof Attributes] >= 4 || attributePointsRemaining <= 0
                }
                onClick={() =>
                  onUpdateAttribute(
                    attributeId as keyof Attributes,
                    Math.min(4, attributes[attributeId as keyof Attributes] + 1)
                  )
                }
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: 'none',
                  cursor:
                    attributes[attributeId as keyof Attributes] >= 4 ||
                    attributePointsRemaining <= 0
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    attributes[attributeId as keyof Attributes] >= 4 ||
                    attributePointsRemaining <= 0
                      ? 0.5
                      : 1,
                }}
              >
                +
              </button>

              <div
                style={{
                  position: 'relative',
                  height: '0.75rem',
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.375rem',
                  flex: 1,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${(attributes[attributeId as keyof Attributes] / 4) * 100}%`,
                    backgroundColor: 'var(--color-sat-purple)',
                    borderRadius: '0.375rem',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttributesTab;
