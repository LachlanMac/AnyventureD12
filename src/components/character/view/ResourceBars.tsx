import React, { useState } from 'react';

interface InjuryData {
  injuryId?: {
    pain?: number;
    stress?: number;
  };
}

interface ResourceBarProps {
  resources: {
    health: { current: number; max: number };
    energy: { current: number; max: number };
    resolve: { current: number; max: number };
    morale?: { current: number; max: number };
    pain?: { custom: number; calculated: number };
    stress?: { custom: number; calculated: number };
  };
  injuries?: InjuryData[];
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
  injuries = [],
  onResourceChange,
  onPainStressChange: _onPainStressChange,
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
              onClick={() => { if (current > 0) handleResourceChange(resource, current - 1); }}
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

  // Calculate pain from injuries + health status + override
  const calcPain = () => {
    const injuryPain = injuries.reduce((sum, i) => sum + (i.injuryId?.pain || 0), 0);
    let healthPain = 0;
    if (resources.health.max > 0) {
      if (resources.health.current < 5) healthPain = 4;
      else if (resources.health.current < resources.health.max / 2) healthPain = 2;
    }
    const override = resources.pain?.custom || 0;
    return Math.max(0, injuryPain + healthPain + override);
  };

  // Calculate stress from injuries + resolve status + override
  const calcStress = () => {
    const injuryStress = injuries.reduce((sum, i) => sum + (i.injuryId?.stress || 0), 0);
    let resolvePain = 0;
    if (resources.resolve.max > 0) {
      if (resources.resolve.current < 3) resolvePain = 4;
      else if (resources.resolve.current < resources.resolve.max / 2) resolvePain = 2;
    }
    const override = resources.stress?.custom || 0;
    return Math.max(0, injuryStress + resolvePain + override);
  };

  // Render read-only pain/stress meter
  const renderPainStressMeter = (
    name: string,
    value: number,
    color: string
  ) => {
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
              color: value > 0 ? color : 'var(--color-white)',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            {value}
          </span>
          {value > 0 && (
            <span
              style={{
                fontSize: '0.625rem',
                color: color,
                fontStyle: 'italic',
              }}
            >
              {value >= 16 ? '(Critical)' : value >= 11 ? '(Severe)' : value >= 6 ? '(Moderate)' : '(Mild)'}
            </span>
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
      {renderPainStressMeter('Pain', calcPain(), 'var(--color-sunset)')}

      {/* Resolve */}
      {renderEditableResource('Resolve', 'resolve', 'var(--color-sat-purple)')}

      {/* Stress meter under Resolve */}
      {renderPainStressMeter('Stress', calcStress(), 'var(--color-sat-purple)')}

      {/* Morale */}
      {resources.morale && renderEditableResource('Morale', 'morale', 'var(--color-forest)')}

      {/* Energy */}
      {renderEditableResource('Energy', 'energy', 'var(--color-metal-gold)')}
    </div>
  );
};

export default ResourceBars;
