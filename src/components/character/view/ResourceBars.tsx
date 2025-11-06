import React, { useState } from 'react';

interface ResourceBarProps {
  resources: {
    health: { current: number; max: number };
    energy: { current: number; max: number };
    resolve: { current: number; max: number };
    morale?: { current: number; max: number };
    pain?: { custom: number; calculated: number };
    stress?: { custom: number; calculated: number };
  };
  onResourceChange?: (
    resource: 'health' | 'energy' | 'resolve' | 'morale',
    newCurrent: number
  ) => void;
  onPainStressChange?: (
    type: 'pain' | 'stress',
    newCustomValue: number
  ) => void;
  readOnly?: boolean;
}

const ResourceBars: React.FC<ResourceBarProps> = ({
  resources,
  onResourceChange,
  onPainStressChange,
  readOnly = false,
}) => {
  const [editingResource, setEditingResource] = useState<string | null>(null);

  // Helper function to render stat bars with text overlay
  const renderStatBar = (value: number, max: number, color: string = 'var(--color-sat-purple)') => {
    const percentage = Math.min((value / max) * 100, 100);
    // Add transparency to the color for better text visibility
    const colorWithAlpha = color.replace('var(--color-sunset)', 'rgba(255, 107, 107, 0.8)')
      .replace('var(--color-sat-purple)', 'rgba(147, 112, 219, 0.8)')
      .replace('var(--color-metal-gold)', 'rgba(255, 215, 0, 0.8)')
      .replace('var(--color-forest)', 'rgba(76, 175, 80, 0.8)');

    return (
      <div
        style={{
          position: 'relative',
          height: '1.5rem',
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
            backgroundColor: colorWithAlpha,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    );
  };

  // Helper function to handle resource changes
  const handleResourceChange = (
    resource: 'health' | 'energy' | 'resolve' | 'morale',
    newValue: number
  ) => {
    const resourceData = resources[resource];
    if (!resourceData) return;

    const max = resourceData.max;
    const clampedValue = Math.max(0, Math.min(newValue, max));
    if (onResourceChange) {
      onResourceChange(resource, clampedValue);
    }
    setEditingResource(null);
  };

  // Helper function to render editable resource
  const renderEditableResource = (
    name: string,
    resource: 'health' | 'energy' | 'resolve' | 'morale',
    color: string
  ) => {
    const resourceData = resources[resource];
    if (!resourceData) return null;

    const current = resourceData.current;
    const max = resourceData.max;
    const isEditing = editingResource === resource;

    return (
      <div
        style={{
          backgroundColor: 'var(--color-dark-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '0.375rem',
          padding: '0.25rem',
        }}
      >
        <div
          style={{
            color: 'var(--color-cloud)',
            fontSize: '0.75rem',
            marginBottom: '0.125rem',
            textAlign: 'center',
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.25rem',
          }}
        >
          {/* -1 button on far left */}
          {!readOnly ? (
            <button
              style={{
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.25rem',
                padding: '0.125rem 0.375rem',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                cursor: current <= 0 ? 'not-allowed' : 'pointer',
                opacity: current <= 0 ? 0.5 : 1,
                minWidth: '2rem',
              }}
              onClick={() => handleResourceChange(resource, current - 1)}
              disabled={current <= 0}
            >
              −
            </button>
          ) : (
            <div style={{ width: '2rem' }} />
          )}

          {/* Progress bar with text overlay */}
          <div style={{ position: 'relative', flex: 1 }}>
            {renderStatBar(current, max, color)}
            {/* Text overlay on the bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-white)',
                fontSize: '1rem',
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '0 0 3px rgba(0,0,0,0.8)',
                pointerEvents: isEditing ? 'auto' : 'none',
              }}
            >
              {isEditing && !readOnly ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <input
                    type="number"
                    min="0"
                    max={max}
                    defaultValue={current}
                    autoFocus
                    style={{
                      width: '50px',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-metal-gold)',
                      borderRadius: '0.25rem',
                      padding: '0.125rem',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                    }}
                    onBlur={(e) => handleResourceChange(resource, parseInt(e.target.value) || 0)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleResourceChange(resource, parseInt(e.currentTarget.value) || 0);
                      } else if (e.key === 'Escape') {
                        setEditingResource(null);
                      }
                    }}
                  />
                  <span style={{ fontSize: '0.75rem' }}>/ {max}</span>
                </div>
              ) : (
                <div
                  style={{
                    cursor: readOnly ? 'default' : 'pointer',
                    userSelect: 'none',
                    pointerEvents: 'auto',
                  }}
                  onClick={() => !readOnly && setEditingResource(resource)}
                >
                  {current} / {max}
                </div>
              )}
            </div>
          </div>

          {/* +1 button on far right */}
          {!readOnly ? (
            <button
              style={{
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.25rem',
                padding: '0.125rem 0.375rem',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                cursor: current >= max ? 'not-allowed' : 'pointer',
                opacity: current >= max ? 0.5 : 1,
                minWidth: '2rem',
              }}
              onClick={() => handleResourceChange(resource, current + 1)}
              disabled={current >= max}
            >
              +
            </button>
          ) : (
            <div style={{ width: '2rem' }} />
          )}
        </div>
      </div>
    );
  };

  // Helper function to render pain/stress meters (no max, just a value)
  const renderPainStressMeter = (
    name: string,
    type: 'pain' | 'stress',
    color: string
  ) => {
    const data = resources[type];
    if (!data) return null;

    const totalValue = Math.max(0, (data.calculated || 0) + (data.custom || 0));

    return (
      <div
        style={{
          backgroundColor: 'var(--color-dark-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '0.375rem',
          padding: '0.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          {/* -1 button on far left */}
          {!readOnly ? (
            <button
              style={{
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.25rem',
                padding: '0.125rem 0.375rem',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                minWidth: '2rem',
              }}
              onClick={() => {
                if (onPainStressChange) {
                  onPainStressChange(type, (data.custom || 0) - 1);
                }
              }}
            >
              −
            </button>
          ) : (
            <div style={{ width: '2rem' }} />
          )}

          {/* Label and value in center */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                color: 'var(--color-cloud)',
                fontSize: '0.875rem',
              }}
            >
              {name}:
            </span>
            <span
              style={{
                color: totalValue > 0 ? color : 'var(--color-white)',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              {totalValue}
            </span>
            {/* Show breakdown tooltip if there's calculated value */}
            {data.calculated !== 0 && (
              <span
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--color-cloud)',
                }}
              >
                (Calc: {data.calculated}, Custom: {data.custom || 0})
              </span>
            )}
          </div>

          {/* +1 button on far right */}
          {!readOnly ? (
            <button
              style={{
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.25rem',
                padding: '0.125rem 0.375rem',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                minWidth: '2rem',
              }}
              onClick={() => {
                if (onPainStressChange) {
                  onPainStressChange(type, (data.custom || 0) + 1);
                }
              }}
            >
              +
            </button>
          ) : (
            <div style={{ width: '2rem' }} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}
    >
      {/* Health */}
      {renderEditableResource('Health', 'health', 'var(--color-sunset)')}

      {/* Pain meter under Health */}
      {resources.pain && renderPainStressMeter('Pain', 'pain', 'var(--color-sunset)')}

      {/* Resolve */}
      {renderEditableResource('Resolve', 'resolve', 'var(--color-sat-purple)')}

      {/* Stress meter under Resolve */}
      {resources.stress && renderPainStressMeter('Stress', 'stress', 'var(--color-sat-purple)')}

      {/* Morale */}
      {resources.morale && renderEditableResource('Morale', 'morale', 'var(--color-forest)')}

      {/* Energy */}
      {renderEditableResource('Energy', 'energy', 'var(--color-metal-gold)')}
    </div>
  );
};

export default ResourceBars;
