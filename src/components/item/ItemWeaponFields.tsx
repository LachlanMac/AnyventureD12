import React from 'react';
import { Item } from '../../types/character';
import {
  fieldInputStyle,
  smallLabelStyle,
  sectionBoxStyle,
  damageTypes,
  damageCategories,
  rangeOptions,
} from './itemFormConstants';

interface ItemWeaponFieldsProps {
  item: Partial<Item>;
  onChange: (field: string, value: any) => void;
}

const ItemWeaponFields: React.FC<ItemWeaponFieldsProps> = ({ item, onChange }) => {
  if (item.type !== 'weapon') return null;

  const renderAttackSection = (
    label: string,
    attackKey: 'primary' | 'secondary',
    attackData: any
  ) => {
    const data = attackData || {};

    const handleChange = (field: string, value: any) => {
      onChange(attackKey, { ...data, [field]: value });
    };

    return (
      <div style={{ ...sectionBoxStyle, marginTop: '0.5rem' }}>
        <h4
          style={{
            margin: 0,
            marginBottom: '1rem',
            fontSize: '1rem',
            color: 'var(--color-white)',
            fontWeight: '600',
          }}
        >
          {label}
        </h4>

        {/* Row 1: Damage, Extra Damage, Damage Type, Attack Type */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
          }}
        >
          <div>
            <label style={smallLabelStyle}>Damage</label>
            <input
              type="text"
              value={data.damage || ''}
              onChange={(e) => handleChange('damage', e.target.value)}
              style={fieldInputStyle}
            />
          </div>
          <div>
            <label style={smallLabelStyle}>Extra Damage</label>
            <input
              type="text"
              value={data.damage_extra || ''}
              onChange={(e) => handleChange('damage_extra', e.target.value)}
              style={fieldInputStyle}
            />
          </div>
          <div>
            <label style={smallLabelStyle}>Damage Type</label>
            <select
              value={data.damage_type || 'physical'}
              onChange={(e) => handleChange('damage_type', e.target.value)}
              style={fieldInputStyle}
            >
              {damageTypes.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={smallLabelStyle}>Attack Type</label>
            <select
              value={data.category || 'slash'}
              onChange={(e) => handleChange('category', e.target.value)}
              style={fieldInputStyle}
            >
              {damageCategories.map((dc) => (
                <option key={dc.value} value={dc.value}>
                  {dc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Bonus Attack, Energy Cost, Min Range, Max Range */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
            marginTop: '0.75rem',
          }}
        >
          <div>
            <label style={smallLabelStyle}>Bonus Attack</label>
            <input
              type="number"
              value={data.bonus_attack || 0}
              onChange={(e) => handleChange('bonus_attack', parseInt(e.target.value) || 0)}
              style={fieldInputStyle}
            />
          </div>
          <div>
            <label style={smallLabelStyle}>Energy Cost</label>
            <input
              type="number"
              value={data.energy || 0}
              onChange={(e) => handleChange('energy', parseInt(e.target.value) || 0)}
              style={fieldInputStyle}
            />
          </div>
          <div>
            <label style={smallLabelStyle}>Min Range</label>
            <select
              value={data.min_range || 0}
              onChange={(e) => handleChange('min_range', parseInt(e.target.value) || 0)}
              style={fieldInputStyle}
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={smallLabelStyle}>Max Range</label>
            <select
              value={data.max_range || 1}
              onChange={(e) => handleChange('max_range', parseInt(e.target.value) || 1)}
              style={fieldInputStyle}
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bonus damage element (e.g. a flaming sword deals physical + heat) */}
        {(data.secondary_damage || data.secondary_damage_type) && (
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ ...smallLabelStyle, fontSize: '0.85rem', fontWeight: '600', opacity: 1 }}>
              Bonus Damage Element
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
              }}
            >
              <div>
                <label style={smallLabelStyle}>Base</label>
                <input
                  type="number"
                  value={data.secondary_damage || 0}
                  onChange={(e) =>
                    handleChange('secondary_damage', parseInt(e.target.value) || 0)
                  }
                  style={fieldInputStyle}
                />
              </div>
              <div>
                <label style={smallLabelStyle}>Extra</label>
                <input
                  type="number"
                  value={data.secondary_damage_extra || 0}
                  onChange={(e) =>
                    handleChange('secondary_damage_extra', parseInt(e.target.value) || 0)
                  }
                  style={fieldInputStyle}
                />
              </div>
              <div>
                <label style={smallLabelStyle}>Type</label>
                <select
                  value={data.secondary_damage_type || 'physical'}
                  onChange={(e) => handleChange('secondary_damage_type', e.target.value)}
                  style={fieldInputStyle}
                >
                  {damageTypes.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Primary Attack */}
      {renderAttackSection('Primary Attack', 'primary', item.primary)}

      {/* Secondary Attack */}
      {renderAttackSection('Secondary Attack', 'secondary', item.secondary)}
    </div>
  );
};

export default ItemWeaponFields;
