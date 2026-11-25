import React, { useState } from 'react';
import { MODULE_POINT_PRESETS } from '../../constants/modulePoints';

interface ModulePointsSelectProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

/** Starting module points: the same presets as character creation, plus Custom. */
const ModulePointsSelect: React.FC<ModulePointsSelectProps> = ({ value, onChange, className }) => {
  const isPreset = MODULE_POINT_PRESETS.some((preset) => preset.value === value);
  const [custom, setCustom] = useState(!isPreset);

  return (
    <div>
      <select
        value={custom ? 'custom' : String(value)}
        onChange={(e) => {
          if (e.target.value === 'custom') {
            setCustom(true);
          } else {
            setCustom(false);
            onChange(parseInt(e.target.value));
          }
        }}
        className={className}
      >
        {MODULE_POINT_PRESETS.map((preset) => (
          <option key={preset.value} value={preset.value}>
            {preset.value} - {preset.label}
          </option>
        ))}
        <option value="custom">Custom...</option>
      </select>
      {custom && (
        <input
          type="number"
          min="1"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          placeholder="Enter module points..."
          className={className}
          style={{ marginTop: '0.5rem' }}
        />
      )}
    </div>
  );
};

export default ModulePointsSelect;
