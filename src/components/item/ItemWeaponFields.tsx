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

const getDamageChart = (base: number, growth: number, aimed: boolean, hands: number): string => {
  const maxHits = hands === 2 ? 6 : 5;
  const tiers: string[] = [];
  for (let i = 1; i <= maxHits; i++) {
    if (aimed && i === 1) {
      tiers.push('—');
    } else {
      const effectiveHits = aimed ? i - 1 : i;
      tiers.push(String(base + growth * effectiveHits));
    }
  }
  return tiers.join(', ');
};

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

    const base = parseInt(data.damage) || 0;
    const growth = parseInt(data.damage_extra) || 0;
    const aimed = data.aimed || false;
    const hands = item.hands || 1;

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

        {/* Row 1: Base, Growth, Aimed, Damage Type, Attack Type */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.75rem',
          }}
        >
          <div>
            <label style={smallLabelStyle}>Base</label>
            <input
              type="text"
              value={data.damage || ''}
              onChange={(e) => handleChange('damage', e.target.value)}
              style={fieldInputStyle}
            />
          </div>
          <div>
            <label style={smallLabelStyle}>Growth</label>
            <input
              type="text"
              value={data.damage_extra || ''}
              onChange={(e) => handleChange('damage_extra', e.target.value)}
              style={fieldInputStyle}
            />
          </div>
          <div>
            <label style={smallLabelStyle}>Aimed</label>
            <div style={{ display: 'flex', alignItems: 'center', height: '2.25rem' }}>
              <input
                type="checkbox"
                checked={aimed}
                onChange={(e) => handleChange('aimed', e.target.checked)}
              />
            </div>
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

        {/* Row 2: Bonus Attack, Energy Cost, Min Range, Max Range, Ammo Capacity */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
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
          <div>
            <label style={smallLabelStyle}>Ammo Capacity</label>
            <input
              type="number"
              value={data.ammo_capacity || 0}
              onChange={(e) => handleChange('ammo_capacity', parseInt(e.target.value) || 0)}
              min="0"
              style={fieldInputStyle}
            />
          </div>
        </div>

        {/* Damage Chart Preview */}
        {(base > 0 || growth > 0) && (
          <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
            <label style={{ ...smallLabelStyle, fontSize: '0.8rem', opacity: 0.7 }}>
              Damage Chart: [{getDamageChart(base, growth, aimed, hands)}]
            </label>
          </div>
        )}

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
