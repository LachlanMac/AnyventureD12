import React from 'react';
import { Item } from '../../types/character';
import { fieldInputStyle, fieldLabelStyle, smallLabelStyle, movementTypes } from './itemFormConstants';

interface ItemResourceFieldsProps {
  item: Partial<Item>;
  onChange: (field: string, value: any) => void;
}

const defaultMovement = {
  walk: { bonus: 0, set: 0 },
  swim: { bonus: 0, set: 0 },
  climb: { bonus: 0, set: 0 },
  fly: { bonus: 0, set: 0 },
};

const ItemResourceFields: React.FC<ItemResourceFieldsProps> = ({ item, onChange }) => {
  const movement = item.movement || defaultMovement;

  const handleMovementChange = (type: string, field: 'bonus' | 'set', value: number) => {
    onChange('movement', {
      ...defaultMovement,
      ...movement,
      [type]: {
        ...(movement as any)[type],
        [field]: value,
      },
    });
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Resources row: Health, Energy, Resolve */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
        }}
      >
        {/* Health */}
        <div>
          <label style={fieldLabelStyle}>Health</label>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <label style={smallLabelStyle}>Max</label>
              <input
                type="number"
                value={item.health?.max || 0}
                onChange={(e) =>
                  onChange('health', {
                    ...item.health,
                    max: parseInt(e.target.value) || 0,
                  })
                }
                style={fieldInputStyle}
              />
            </div>
            <div>
              <label style={smallLabelStyle}>Recovery</label>
              <input
                type="number"
                value={item.health?.recovery || 0}
                onChange={(e) =>
                  onChange('health', {
                    ...item.health,
                    recovery: parseInt(e.target.value) || 0,
                  })
                }
                style={fieldInputStyle}
              />
            </div>
          </div>
        </div>

        {/* Energy */}
        <div>
          <label style={fieldLabelStyle}>Energy</label>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <label style={smallLabelStyle}>Max</label>
              <input
                type="number"
                value={item.energy?.max || 0}
                onChange={(e) =>
                  onChange('energy', {
                    ...item.energy,
                    max: parseInt(e.target.value) || 0,
                  })
                }
                style={fieldInputStyle}
              />
            </div>
            <div>
              <label style={smallLabelStyle}>Regen</label>
              <input
                type="number"
                value={item.energy?.recovery || 0}
                onChange={(e) =>
                  onChange('energy', {
                    ...item.energy,
                    recovery: parseInt(e.target.value) || 0,
                  })
                }
                style={fieldInputStyle}
              />
            </div>
          </div>
        </div>

        {/* Resolve */}
        <div>
          <label style={fieldLabelStyle}>Resolve</label>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <label style={smallLabelStyle}>Max</label>
              <input
                type="number"
                value={item.resolve?.max || 0}
                onChange={(e) =>
                  onChange('resolve', {
                    ...item.resolve,
                    max: parseInt(e.target.value) || 0,
                  })
                }
                style={fieldInputStyle}
              />
            </div>
            <div>
              <label style={smallLabelStyle}>Recovery</label>
              <input
                type="number"
                value={item.resolve?.recovery || 0}
                onChange={(e) =>
                  onChange('resolve', {
                    ...item.resolve,
                    recovery: parseInt(e.target.value) || 0,
                  })
                }
                style={fieldInputStyle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pain & Stress row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
        }}
      >
        <div>
          <label style={fieldLabelStyle}>Pain Penalty</label>
          <input
            type="number"
            value={item.pain || 0}
            onChange={(e) => onChange('pain', parseInt(e.target.value) || 0)}
            style={fieldInputStyle}
          />
        </div>
        <div>
          <label style={fieldLabelStyle}>Stress Penalty</label>
          <input
            type="number"
            value={item.stress || 0}
            onChange={(e) => onChange('stress', parseInt(e.target.value) || 0)}
            style={fieldInputStyle}
          />
        </div>
      </div>

      {/* Movement grid: 4 types x 2 columns (bonus + override) */}
      <div>
        <label style={fieldLabelStyle}>Movement</label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
          }}
        >
          {movementTypes.map((type) => (
            <div key={type}>
              <label style={smallLabelStyle}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div>
                  <label style={{ ...smallLabelStyle, fontSize: '0.65rem' }}>Bonus</label>
                  <input
                    type="number"
                    value={(movement as any)[type]?.bonus || 0}
                    onChange={(e) =>
                      handleMovementChange(type, 'bonus', parseInt(e.target.value) || 0)
                    }
                    style={fieldInputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{ ...smallLabelStyle, fontSize: '0.65rem' }}
                    title="Override: if set > 0, ignores bonuses and uses this value instead"
                  >
                    Override
                  </label>
                  <input
                    type="number"
                    value={(movement as any)[type]?.set || 0}
                    onChange={(e) =>
                      handleMovementChange(type, 'set', parseInt(e.target.value) || 0)
                    }
                    min="0"
                    style={fieldInputStyle}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemResourceFields;
