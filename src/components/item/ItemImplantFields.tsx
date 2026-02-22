import React from 'react';
import { Item } from '../../types/character';
import { fieldInputStyle, fieldLabelStyle, sectionBoxStyle, implantTypes } from './itemFormConstants';

interface ItemImplantFieldsProps {
  item: Partial<Item>;
  onChange: (field: string, value: any) => void;
}

const ItemImplantFields: React.FC<ItemImplantFieldsProps> = ({ item, onChange }) => {
  if (item.type !== 'implant') return null;

  const implantData = item.implant_data || {
    implant_type: 'eye',
    pain_penalty: 0,
    health_penalty: 0,
    resolve_penalty: 0,
    rejection_check: 0,
  };

  const handleChange = (field: string, value: any) => {
    onChange('implant_data', { ...implantData, [field]: value });
  };

  return (
    <div style={sectionBoxStyle}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
        }}
      >
        <div>
          <label style={fieldLabelStyle}>Implant Type</label>
          <select
            value={implantData.implant_type || 'eye'}
            onChange={(e) => handleChange('implant_type', e.target.value)}
            style={fieldInputStyle}
          >
            {implantTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={fieldLabelStyle}>Rejection Check RC</label>
          <input
            type="number"
            value={implantData.rejection_check || 0}
            onChange={(e) => handleChange('rejection_check', parseInt(e.target.value) || 0)}
            min={0}
            style={fieldInputStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>Pain Penalty</label>
          <input
            type="number"
            value={implantData.pain_penalty || 0}
            onChange={(e) => handleChange('pain_penalty', parseInt(e.target.value) || 0)}
            min={0}
            style={fieldInputStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>Health Penalty</label>
          <input
            type="number"
            value={implantData.health_penalty || 0}
            onChange={(e) => handleChange('health_penalty', parseInt(e.target.value) || 0)}
            min={0}
            style={fieldInputStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>Resolve Penalty</label>
          <input
            type="number"
            value={implantData.resolve_penalty || 0}
            onChange={(e) => handleChange('resolve_penalty', parseInt(e.target.value) || 0)}
            min={0}
            style={fieldInputStyle}
          />
        </div>
      </div>
    </div>
  );
};

export default ItemImplantFields;
