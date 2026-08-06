import React from 'react';
import { Item } from '../../types/character';
import { fieldInputStyle, smallLabelStyle, mitigationTypes } from './itemFormConstants';

interface ItemMitigationFieldsProps {
  item: Partial<Item>;
  onChange: (field: string, value: any) => void;
}

const ItemMitigationFields: React.FC<ItemMitigationFieldsProps> = ({ item, onChange }) => {
  const mitigation = item.mitigation || {};

  const getValue = (type: string, field: 'min' | 'max'): number => {
    const val = mitigation[type];
    if (!val) return 0;
    if (typeof val === 'object' && val !== null) return val[field] || 0;
    // Legacy: flat number treated as min
    return field === 'min' ? (val as number) : 0;
  };

  const handleChange = (type: string, field: 'min' | 'max', newValue: number) => {
    const current = mitigation[type] || { min: 0, max: 0 };
    const updated = typeof current === 'object' ? { ...current } : { min: current, max: 0 };
    updated[field] = newValue;
    onChange('mitigation', {
      ...mitigation,
      [type]: updated,
    });
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
      }}
    >
      {mitigationTypes.map((type) => (
        <div key={type}>
          <label style={smallLabelStyle}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </label>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...smallLabelStyle, fontSize: '0.6rem', opacity: 0.7 }}>Mit.</label>
              <input
                type="number"
                value={getValue(type, 'min')}
                onChange={(e) => handleChange(type, 'min', parseInt(e.target.value) || 0)}
                style={fieldInputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ ...smallLabelStyle, fontSize: '0.6rem', opacity: 0.7 }}>Limit</label>
              <input
                type="number"
                value={getValue(type, 'max')}
                onChange={(e) => handleChange(type, 'max', parseInt(e.target.value) || 0)}
                style={fieldInputStyle}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItemMitigationFields;
