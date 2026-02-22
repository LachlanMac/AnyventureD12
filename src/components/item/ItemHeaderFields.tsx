import React from 'react';
import { Item } from '../../types/character';
import {
  fieldInputStyle,
  fieldLabelStyle,
  itemTypes,
  weaponCategories,
  consumableCategories,
  shieldCategories,
} from './itemFormConstants';

interface ItemHeaderFieldsProps {
  item: Partial<Item>;
  onChange: (field: string, value: any) => void;
}

const typesWithCategory = ['weapon', 'consumable', 'shield'];

const ItemHeaderFields: React.FC<ItemHeaderFieldsProps> = ({ item, onChange }) => {
  const hasCategory = typesWithCategory.includes(item.type || '');

  const getCategoryOptions = () => {
    switch (item.type) {
      case 'weapon':
        return weaponCategories;
      case 'consumable':
        return consumableCategories;
      case 'shield':
        return shieldCategories;
      default:
        return [];
    }
  };

  const getCategoryField = () => {
    switch (item.type) {
      case 'weapon':
        return 'weapon_category';
      case 'consumable':
        return 'consumable_category';
      case 'shield':
        return 'shield_category';
      default:
        return '';
    }
  };

  const getCategoryValue = () => {
    switch (item.type) {
      case 'weapon':
        return item.weapon_category || 'simpleMelee';
      case 'consumable':
        return item.consumable_category || 'potions';
      case 'shield':
        return item.shield_category || 'light';
      default:
        return '';
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Name - full width */}
      <div>
        <label style={fieldLabelStyle}>Name</label>
        <input
          type="text"
          value={item.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          style={{ ...fieldInputStyle, fontSize: '1.1rem' }}
        />
      </div>

      {/* Type + Category row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: hasCategory ? '1fr 1fr' : '1fr',
          gap: '0.75rem',
        }}
      >
        <div>
          <label style={fieldLabelStyle}>Type</label>
          <select
            value={item.type || 'weapon'}
            onChange={(e) => onChange('type', e.target.value)}
            style={fieldInputStyle}
          >
            {itemTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {hasCategory && (
          <div>
            <label style={fieldLabelStyle}>Category</label>
            <select
              value={getCategoryValue()}
              onChange={(e) => onChange(getCategoryField(), e.target.value)}
              style={fieldInputStyle}
            >
              {getCategoryOptions().map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemHeaderFields;
