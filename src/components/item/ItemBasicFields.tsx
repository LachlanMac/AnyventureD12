import React from 'react';
import { Item } from '../../types/character';
import {
  fieldInputStyle,
  fieldLabelStyle,
  rarities,
} from './itemFormConstants';

interface ItemBasicFieldsProps {
  item: Partial<Item>;
  onChange: (field: string, value: any) => void;
}

const ItemBasicFields: React.FC<ItemBasicFieldsProps> = ({ item, onChange }) => {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Description - full width */}
      <div>
        <label style={fieldLabelStyle}>Description</label>
        <textarea
          value={item.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          style={{ ...fieldInputStyle, resize: 'vertical', minHeight: '60px' }}
        />
      </div>

      {/* Weight, Value, Encumbrance, Rarity - 4-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
        }}
      >
        <div>
          <label style={fieldLabelStyle}>Weight</label>
          <input
            type="number"
            value={item.weight || 0}
            onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
            step="0.1"
            style={fieldInputStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>Value (Silver)</label>
          <input
            type="number"
            value={item.value || 0}
            onChange={(e) => onChange('value', parseInt(e.target.value) || 0)}
            style={fieldInputStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>Encumbrance Penalty</label>
          <input
            type="number"
            value={item.encumbrance_penalty || 0}
            onChange={(e) => onChange('encumbrance_penalty', parseInt(e.target.value) || 0)}
            style={fieldInputStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>Rarity</label>
          <select
            value={item.rarity || 'common'}
            onChange={(e) => onChange('rarity', e.target.value)}
            style={fieldInputStyle}
          >
            {rarities.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ItemBasicFields;
