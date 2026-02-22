import React from 'react';
import { Item } from '../../types/character';
import { fieldInputStyle, smallLabelStyle, mitigationTypes } from './itemFormConstants';

interface ItemMitigationFieldsProps {
  item: Partial<Item>;
  onChange: (field: string, value: any) => void;
}

const ItemMitigationFields: React.FC<ItemMitigationFieldsProps> = ({ item, onChange }) => {
  const mitigation = item.mitigation || {};

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
          <input
            type="number"
            value={mitigation[type] || 0}
            onChange={(e) =>
              onChange('mitigation', {
                ...mitigation,
                [type]: parseInt(e.target.value) || 0,
              })
            }
            style={fieldInputStyle}
          />
        </div>
      ))}
    </div>
  );
};

export default ItemMitigationFields;
