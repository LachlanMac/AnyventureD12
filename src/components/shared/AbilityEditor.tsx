import React from 'react';
import Button from '../ui/Button';

export interface AbilityEntry {
  name: string;
  cost: number;
  type: 'attack' | 'spell' | 'utility' | 'movement';
  magic: boolean;
  description: string;
  reaction: boolean;
  basic: boolean;
  round: boolean;
  daily: boolean;
  charges?: number;
  spellType: 'normal' | 'innate' | 'unique';
  trigger?: string;
  attack?: {
    roll: string;
    damage: string;
    damage_extra: string;
    damage_type: string;
    secondary_damage?: string;
    secondary_damage_extra?: string;
    secondary_damage_type?: string;
    category: 'pierce' | 'slash' | 'blunt' | 'ranged';
    min_range: number;
    max_range: number;
  };
  spell?: {
    roll: string;
    damage: string;
    damage_extra: string;
    damage_type: string;
    secondary_damage?: string;
    secondary_damage_extra?: string;
    secondary_damage_type?: string;
    target_defense: 'evasion' | 'deflection' | 'resilience' | 'none';
    defense_difficulty: number;
    min_range: number;
    max_range: number;
    charge?: string;
    duration?: string;
    range?: string;
    school?: string;
    subschool?: string;
    checkToCast?: number;
    components?: string[];
    ritualDuration?: string;
    concentration?: boolean;
    foundry_icon?: string;
  };
}

interface AbilityEditorProps {
  abilities: AbilityEntry[];
  onAbilitiesChange: (abilities: AbilityEntry[]) => void;
  showCharges?: boolean;
}

const subschoolMap: Record<string, { value: string; label: string }[]> = {
  primal: [
    { value: 'elemental', label: 'Elemental' },
    { value: 'nature', label: 'Nature' },
    { value: 'draconic', label: 'Draconic' },
    { value: 'custom', label: 'Custom' },
  ],
  black: [
    { value: 'necromancy', label: 'Necromancy' },
    { value: 'witchcraft', label: 'Witchcraft' },
    { value: 'fiend', label: 'Fiend' },
    { value: 'custom', label: 'Custom' },
  ],
  white: [
    { value: 'radiant', label: 'Radiant' },
    { value: 'protection', label: 'Protection' },
    { value: 'celestial', label: 'Celestial' },
    { value: 'custom', label: 'Custom' },
  ],
  mysticism: [
    { value: 'spirit', label: 'Spirit' },
    { value: 'divination', label: 'Divination' },
    { value: 'cosmic', label: 'Cosmic' },
    { value: 'custom', label: 'Custom' },
  ],
  meta: [
    { value: 'transmutation', label: 'Transmutation' },
    { value: 'illusion', label: 'Illusion' },
    { value: 'fey', label: 'Fey' },
    { value: 'custom', label: 'Custom' },
  ],
  arcane: [
    { value: 'conjuration', label: 'Conjuration' },
    { value: 'enchantment', label: 'Enchantment' },
    { value: 'chaos', label: 'Chaos' },
    { value: 'custom', label: 'Custom' },
  ],
};

const getRangeOptions = () => [
  { value: 0, label: 'Self' },
  { value: 1, label: 'Adjacent' },
  { value: 2, label: 'Nearby' },
  { value: 3, label: 'Very Short' },
  { value: 4, label: 'Short' },
  { value: 5, label: 'Moderate' },
  { value: 6, label: 'Far' },
  { value: 7, label: 'Very Far' },
  { value: 8, label: 'Distant' },
  { value: 9, label: 'Planar' },
];

const damageTypes = [
  'physical', 'heat', 'cold', 'electric', 'dark', 'divine', 'aetheric', 'psychic', 'toxic',
];

const AbilityEditor: React.FC<AbilityEditorProps> = ({ abilities, onAbilitiesChange, showCharges = false }) => {
  const addAbility = () => {
    onAbilitiesChange([
      ...abilities,
      {
        name: '',
        cost: 0,
        type: 'utility',
        magic: false,
        description: '',
        reaction: false,
        basic: false,
        round: false,
        daily: false,
        charges: 0,
        spellType: 'normal',
        attack: {
          roll: '0',
          damage: '2',
          damage_extra: '1',
          damage_type: 'physical',
          category: 'slash',
          min_range: 1,
          max_range: 1,
        },
      },
    ]);
  };

  const removeAbility = (index: number) => {
    onAbilitiesChange(abilities.filter((_, i) => i !== index));
  };

  const updateAbility = (index: number, field: string, value: any) => {
    const updated = [...abilities];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!(updated[index] as any)[parent]) {
        (updated[index] as any)[parent] = {};
      }
      ((updated[index] as any)[parent] as any)[child] = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    onAbilitiesChange(updated);
  };

  const updateAbilityProperty = (index: number, parentField: string, childField: string, value: any) => {
    const updated = [...abilities];
    if (!(updated[index] as any)[parentField]) {
      (updated[index] as any)[parentField] = {};
    }
    ((updated[index] as any)[parentField] as any)[childField] = value;
    onAbilitiesChange(updated);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">All Abilities</h3>
        <div className="flex gap-2">
          <Button onClick={addAbility}>Add Ability</Button>
        </div>
      </div>

      {abilities.length === 0 && (
        <p className="text-sm text-gray-400">No abilities added yet.</p>
      )}

      {abilities.map((ability, index) => (
        <div key={index} className="border border-gray-600 rounded p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Ability name"
              value={ability.name}
              onChange={(e) => updateAbility(index, 'name', e.target.value)}
              className="p-2 bg-gray-800 border border-gray-600 rounded"
            />
            <input
              type="number"
              placeholder="Energy cost"
              min="0"
              value={ability.cost}
              onChange={(e) => updateAbility(index, 'cost', parseInt(e.target.value))}
              className="p-2 bg-gray-800 border border-gray-600 rounded"
            />
            <select
              value={ability.type}
              onChange={(e) => updateAbility(index, 'type', e.target.value)}
              className="p-2 bg-gray-800 border border-gray-600 rounded"
            >
              <option value="attack">Attack</option>
              <option value="spell">Spell</option>
              <option value="utility">Utility</option>
              <option value="movement">Movement</option>
            </select>
            {ability.type === 'spell' && (
              <select
                value={ability.spellType}
                onChange={(e) => updateAbility(index, 'spellType', e.target.value)}
                className="p-2 bg-gray-800 border border-gray-600 rounded"
              >
                <option value="normal">Normal</option>
                <option value="innate">Innate</option>
                <option value="unique">Unique</option>
              </select>
            )}
            <div className="flex gap-2 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ability.reaction}
                  onChange={(e) => updateAbility(index, 'reaction', e.target.checked)}
                />
                <span className="text-sm">Reaction</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ability.magic}
                  onChange={(e) => updateAbility(index, 'magic', e.target.checked)}
                />
                <span className="text-sm">Magical</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ability.basic}
                  onChange={(e) => updateAbility(index, 'basic', e.target.checked)}
                />
                <span className="text-sm">Basic</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ability.round}
                  onChange={(e) => updateAbility(index, 'round', e.target.checked)}
                />
                <span className="text-sm">1/Round</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ability.daily}
                  onChange={(e) => updateAbility(index, 'daily', e.target.checked)}
                />
                <span className="text-sm">Daily</span>
              </label>
              {showCharges && (
                <label className="flex items-center gap-2">
                  <span className="text-sm">Charges:</span>
                  <input
                    type="number"
                    min="0"
                    value={ability.charges || 0}
                    onChange={(e) => updateAbility(index, 'charges', parseInt(e.target.value) || 0)}
                    className="w-16 p-1 bg-gray-800 border border-gray-600 rounded text-sm"
                  />
                </label>
              )}
            </div>
          </div>

          {ability.reaction && (
            <input
              type="text"
              placeholder="Trigger (what triggers this reaction?)"
              value={ability.trigger || ''}
              onChange={(e) => updateAbility(index, 'trigger', e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded mb-4"
            />
          )}

          <textarea
            placeholder="Ability description"
            value={ability.description}
            onChange={(e) => updateAbility(index, 'description', e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded mb-4"
            rows={2}
          />

          {/* Attack-specific fields */}
          {ability.type === 'attack' && (
            <div className="border-t border-gray-600 pt-4 mb-4">
              <h4 className="text-md font-medium mb-3">Attack Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Roll formula (e.g., 2d10)"
                  value={ability.attack?.roll || ''}
                  onChange={(e) => updateAbilityProperty(index, 'attack', 'roll', e.target.value)}
                  className="p-2 bg-gray-800 border border-gray-600 rounded"
                />
                <select
                  value={ability.attack?.category || 'pierce'}
                  onChange={(e) => updateAbilityProperty(index, 'attack', 'category', e.target.value)}
                  className="p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  <option value="pierce">Pierce</option>
                  <option value="slash">Slash</option>
                  <option value="blunt">Blunt</option>
                  <option value="ranged">Ranged</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Min Range</label>
                    <select
                      value={ability.attack?.min_range ?? 1}
                      onChange={(e) => updateAbilityProperty(index, 'attack', 'min_range', parseInt(e.target.value))}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                    >
                      {getRangeOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Max Range</label>
                    <select
                      value={ability.attack?.max_range ?? 1}
                      onChange={(e) => updateAbilityProperty(index, 'attack', 'max_range', parseInt(e.target.value))}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                    >
                      {getRangeOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Damage</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Damage"
                      value={ability.attack?.damage || ''}
                      onChange={(e) => updateAbilityProperty(index, 'attack', 'damage', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Extra"
                      value={ability.attack?.damage_extra || ''}
                      onChange={(e) => updateAbilityProperty(index, 'attack', 'damage_extra', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                    <select
                      value={ability.attack?.damage_type || 'physical'}
                      onChange={(e) => updateAbilityProperty(index, 'attack', 'damage_type', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    >
                      {damageTypes.map(dt => (
                        <option key={dt} value={dt}>{dt.charAt(0).toUpperCase() + dt.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Damage (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Damage"
                      value={ability.attack?.secondary_damage || ''}
                      onChange={(e) => updateAbilityProperty(index, 'attack', 'secondary_damage', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Extra"
                      value={ability.attack?.secondary_damage_extra || ''}
                      onChange={(e) => updateAbilityProperty(index, 'attack', 'secondary_damage_extra', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                    <select
                      value={ability.attack?.secondary_damage_type || ''}
                      onChange={(e) => updateAbilityProperty(index, 'attack', 'secondary_damage_type', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    >
                      <option value="">None</option>
                      {damageTypes.map(dt => (
                        <option key={dt} value={dt}>{dt.charAt(0).toUpperCase() + dt.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Spell-specific fields */}
          {ability.type === 'spell' && (
            <div className="border-t border-gray-600 pt-4 mb-4">
              <h4 className="text-md font-medium mb-3">Spell Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  value={ability.spell?.school || 'primal'}
                  onChange={(e) => {
                    updateAbilityProperty(index, 'spell', 'school', e.target.value);
                    const firstSub = subschoolMap[e.target.value]?.[0]?.value || '';
                    updateAbilityProperty(index, 'spell', 'subschool', firstSub);
                  }}
                  className="p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  <option value="primal">Primal</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="mysticism">Mysticism</option>
                  <option value="meta">Meta</option>
                  <option value="arcane">Arcane</option>
                </select>
                <select
                  value={ability.spell?.subschool || ''}
                  onChange={(e) => updateAbilityProperty(index, 'spell', 'subschool', e.target.value)}
                  className="p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  {(subschoolMap[ability.spell?.school || 'primal'] || []).map((sub) => (
                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Check to cast"
                  min="1"
                  value={ability.spell?.checkToCast || 4}
                  onChange={(e) => updateAbilityProperty(index, 'spell', 'checkToCast', parseInt(e.target.value))}
                  className="p-2 bg-gray-800 border border-gray-600 rounded"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  value={ability.spell?.duration || 'Instantaneous'}
                  onChange={(e) => updateAbilityProperty(index, 'spell', 'duration', e.target.value)}
                  className="p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  <option value="Instantaneous">Instantaneous</option>
                  <option value="1 round">1 Round</option>
                  <option value="1 minute">1 Minute</option>
                  <option value="10 minutes">10 Minutes</option>
                  <option value="1 hour">1 Hour</option>
                  <option value="8 hours">8 Hours</option>
                  <option value="1 day">1 Day</option>
                  <option value="3 days">3 Days</option>
                  <option value="Concentration">Concentration</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Until expended or 1 minute">Until Expended or 1 Minute</option>
                </select>
                <select
                  value={ability.spell?.target_defense || 'evasion'}
                  onChange={(e) => updateAbilityProperty(index, 'spell', 'target_defense', e.target.value)}
                  className="p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  <option value="evasion">Evasion</option>
                  <option value="deflection">Deflection</option>
                  <option value="resilience">Resilience</option>
                  <option value="none">None</option>
                </select>
                <select
                  value={ability.spell?.range || 'Self'}
                  onChange={(e) => updateAbilityProperty(index, 'spell', 'range', e.target.value)}
                  className="p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  <option value="Self">Self</option>
                  <option value="Single Target">Single Target</option>
                  <option value="Multiple Targets">Multiple Targets</option>
                  <option value="Area of Effect">Area of Effect</option>
                  <option value="Cone">Cone</option>
                  <option value="Line">Line</option>
                  <option value="Touch">Touch</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Min Range</label>
                  <select
                    value={ability.spell?.min_range ?? 0}
                    onChange={(e) => updateAbilityProperty(index, 'spell', 'min_range', parseInt(e.target.value))}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                  >
                    {getRangeOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Max Range</label>
                  <select
                    value={ability.spell?.max_range ?? 5}
                    onChange={(e) => updateAbilityProperty(index, 'spell', 'max_range', parseInt(e.target.value))}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                  >
                    {getRangeOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="number"
                  placeholder="Defense difficulty"
                  min="0"
                  value={ability.spell?.defense_difficulty || 6}
                  onChange={(e) => updateAbilityProperty(index, 'spell', 'defense_difficulty', parseInt(e.target.value))}
                  className="p-2 bg-gray-800 border border-gray-600 rounded"
                />
                <input
                  type="text"
                  placeholder="Roll formula (e.g., 2d8)"
                  value={ability.spell?.roll || ''}
                  onChange={(e) => updateAbilityProperty(index, 'spell', 'roll', e.target.value)}
                  className="p-2 bg-gray-800 border border-gray-600 rounded"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Spell Damage</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Damage"
                      value={ability.spell?.damage || ''}
                      onChange={(e) => updateAbilityProperty(index, 'spell', 'damage', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Extra"
                      value={ability.spell?.damage_extra || ''}
                      onChange={(e) => updateAbilityProperty(index, 'spell', 'damage_extra', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                    <select
                      value={ability.spell?.damage_type || 'aetheric'}
                      onChange={(e) => updateAbilityProperty(index, 'spell', 'damage_type', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    >
                      {damageTypes.map(dt => (
                        <option key={dt} value={dt}>{dt.charAt(0).toUpperCase() + dt.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Damage (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Damage"
                      value={ability.spell?.secondary_damage || ''}
                      onChange={(e) => updateAbilityProperty(index, 'spell', 'secondary_damage', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Extra"
                      value={ability.spell?.secondary_damage_extra || ''}
                      onChange={(e) => updateAbilityProperty(index, 'spell', 'secondary_damage_extra', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    />
                    <select
                      value={ability.spell?.secondary_damage_type || ''}
                      onChange={(e) => updateAbilityProperty(index, 'spell', 'secondary_damage_type', e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                    >
                      <option value="">None</option>
                      {damageTypes.map(dt => (
                        <option key={dt} value={dt}>{dt.charAt(0).toUpperCase() + dt.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <textarea
                placeholder="Charge description (optional)"
                value={ability.spell?.charge || ''}
                onChange={(e) => updateAbilityProperty(index, 'spell', 'charge', e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded mb-4"
                rows={2}
              />
            </div>
          )}

          <Button onClick={() => removeAbility(index)} variant="danger" size="sm">
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AbilityEditor;
