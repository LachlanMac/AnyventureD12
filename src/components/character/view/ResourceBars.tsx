import React, { useState } from 'react';

interface ResourceBarProps {
  resources: {
    health: { current: number; max: number };
    energy: { current: number; max: number };
    resolve: { current: number; max: number };
  };
  onResourceChange?: (resource: 'health' | 'energy' | 'resolve', newCurrent: number) => void;
  readOnly?: boolean;
}

const ResourceBars: React.FC<ResourceBarProps> = ({ resources, onResourceChange, readOnly = false }) => {
  const [editingResource, setEditingResource] = useState<string | null>(null);
  
  // Helper function to render stat bars
  const renderStatBar = (value: number, max: number, color: string = 'var(--color-sat-purple)') => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
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
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    );
  };

  // Helper function to handle resource changes
  const handleResourceChange = (resource: 'health' | 'energy' | 'resolve', newValue: number) => {
    const max = resources[resource].max;
    const clampedValue = Math.max(0, Math.min(newValue, max));
    if (onResourceChange) {
      onResourceChange(resource, clampedValue);
    }
    setEditingResource(null);
  };

  // Helper function to render editable resource
  const renderEditableResource = (
    name: string,
    resource: 'health' | 'energy' | 'resolve',
    color: string
  ) => {
    const current = resources[resource].current;
    const max = resources[resource].max;
    const isEditing = editingResource === resource;

    return (
      <div
        style={{
          backgroundColor: 'var(--color-dark-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '0.375rem',
          padding: '0.5rem',
        }}
      >
        <div
          style={{
            color: 'var(--color-cloud)',
            fontSize: '0.875rem',
            marginBottom: '0.25rem',
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
            marginBottom: '0.25rem',
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
                padding: '0.25rem 0.5rem',
                fontSize: '1rem',
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

          {/* Resource value in center */}
          <div
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            {isEditing && !readOnly ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
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
                    fontSize: '1rem',
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
                <span style={{ fontSize: '0.875rem' }}>/ {max}</span>
              </div>
            ) : (
              <div
                style={{
                  cursor: readOnly ? 'default' : 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => !readOnly && setEditingResource(resource)}
              >
                {current} / {max}
              </div>
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
                padding: '0.25rem 0.5rem',
                fontSize: '1rem',
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
        {renderStatBar(current, max, color)}
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {/* Health */}
      {renderEditableResource('Health', 'health', 'var(--color-sunset)')}
      
      {/* Resolve */}
      {renderEditableResource('Resolve', 'resolve', 'var(--color-sat-purple)')}
      
      {/* Energy */}
      {renderEditableResource('Energy', 'energy', 'var(--color-metal-gold)')}
    </div>
  );
};

export default ResourceBars;
