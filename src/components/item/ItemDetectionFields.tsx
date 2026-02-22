import React from 'react';
import { Item } from '../../types/character';
import {
  fieldInputStyle,
  smallLabelStyle,
  detectionOptions,
  detectionTypes,
  immunityTypes,
} from './itemFormConstants';

interface ItemDetectionFieldsProps {
  item: Partial<Item>;
  onChange: (field: string, value: any) => void;
}

// Default structures so this always renders
const defaultDetections: Record<string, number> = {
  normal: 0, darksight: 0, infravision: 0, deadsight: 0,
  echolocation: 0, tremorsense: 0, truesight: 0, aethersight: 0,
};

const defaultImmunities: Record<string, boolean> = {
  // Mental conditions (9)
  afraid: false, alert: false, broken: false, charmed: false,
  confused: false, dazed: false, maddened: false, numbed: false, stunned: false,
  // Physical conditions (13)
  bleeding: false, blinded: false, deafened: false, ignited: false,
  impaired: false, incapacitated: false, muted: false, obscured: false,
  poisoned: false, prone: false, stasis: false, unconscious: false, winded: false,
};

const ItemDetectionFields: React.FC<ItemDetectionFieldsProps> = ({ item, onChange }) => {
  const detections = item.detections && Object.keys(item.detections).length > 0
    ? item.detections
    : defaultDetections;
  const immunities = item.immunities && Object.keys(item.immunities).length > 0
    ? item.immunities
    : defaultImmunities;

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {/* Detections */}
      <div>
        <h4
          style={{
            margin: 0,
            marginBottom: '0.75rem',
            fontSize: '0.95rem',
            color: 'var(--color-white)',
            fontWeight: '600',
          }}
        >
          Detections
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
          }}
        >
          {detectionTypes.map((type) => (
            <div key={type}>
              <label style={smallLabelStyle}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
              <select
                value={(detections as any)[type] || 0}
                onChange={(e) =>
                  onChange('detections', {
                    ...detections,
                    [type]: parseInt(e.target.value) || 0,
                  })
                }
                style={fieldInputStyle}
              >
                {detectionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Immunities */}
      <div>
        <h4
          style={{
            margin: 0,
            marginBottom: '0.75rem',
            fontSize: '0.95rem',
            color: 'var(--color-white)',
            fontWeight: '600',
          }}
        >
          Immunities
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
          }}
        >
          {immunityTypes.map((type) => {
            const isActive = !!(immunities as any)[type];
            return (
              <label
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: isActive ? 'var(--color-white)' : 'var(--color-cloud)',
                  backgroundColor: isActive
                    ? 'rgba(138, 116, 192, 0.15)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(138, 116, 192, 0.3)'
                    : '1px solid var(--color-dark-border)',
                  transition: 'all 0.2s',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) =>
                    onChange('immunities', {
                      ...immunities,
                      [type]: e.target.checked,
                    })
                  }
                  style={{ display: 'none' }}
                />
                <span
                  style={{
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '0.25rem',
                    border: isActive
                      ? '2px solid rgba(138, 116, 192, 0.6)'
                      : '2px solid var(--color-dark-border)',
                    backgroundColor: isActive
                      ? 'rgba(138, 116, 192, 0.4)'
                      : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.7rem',
                    color: 'var(--color-white)',
                  }}
                >
                  {isActive ? '\u2713' : ''}
                </span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ItemDetectionFields;
