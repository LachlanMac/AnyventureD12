import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Item } from '../../types/character';
import { skillCardStyle, skillNameStyle, bonusInputStyle, smallLabelStyle } from './itemFormConstants';

interface ItemBonusFieldsProps {
  item: Partial<Item>;
  onChange: (field: string, value: any) => void;
}

// Default structures for each bonus category
const defaultAttributes = {
  physique: { add_talent: 0, set_talent: 0 },
  finesse: { add_talent: 0, set_talent: 0 },
  mind: { add_talent: 0, set_talent: 0 },
  knowledge: { add_talent: 0, set_talent: 0 },
  social: { add_talent: 0, set_talent: 0 },
};

const defaultBasicSkills = {
  fitness: { add_bonus: 0, set_bonus: 0 },
  deflection: { add_bonus: 0, set_bonus: 0 },
  might: { add_bonus: 0, set_bonus: 0 },
  endurance: { add_bonus: 0, set_bonus: 0 },
  evasion: { add_bonus: 0, set_bonus: 0 },
  stealth: { add_bonus: 0, set_bonus: 0 },
  coordination: { add_bonus: 0, set_bonus: 0 },
  thievery: { add_bonus: 0, set_bonus: 0 },
  resilience: { add_bonus: 0, set_bonus: 0 },
  concentration: { add_bonus: 0, set_bonus: 0 },
  senses: { add_bonus: 0, set_bonus: 0 },
  logic: { add_bonus: 0, set_bonus: 0 },
  wildcraft: { add_bonus: 0, set_bonus: 0 },
  academics: { add_bonus: 0, set_bonus: 0 },
  magic: { add_bonus: 0, set_bonus: 0 },
  medicine: { add_bonus: 0, set_bonus: 0 },
  expression: { add_bonus: 0, set_bonus: 0 },
  presence: { add_bonus: 0, set_bonus: 0 },
  insight: { add_bonus: 0, set_bonus: 0 },
  persuasion: { add_bonus: 0, set_bonus: 0 },
};

const defaultWeaponSkills = {
  brawling: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  throwing: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  simpleRangedWeapons: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  simpleMeleeWeapons: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  complexRangedWeapons: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  complexMeleeWeapons: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
};

const defaultCraftSkills = {
  engineering: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  fabrication: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  alchemy: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  cooking: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  glyphcraft: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  biosculpting: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
};

const defaultMagicSkills = {
  black: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  primal: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  meta: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  white: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  mysticism: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
  arcane: { add_bonus: 0, set_bonus: 0, add_talent: 0, set_talent: 0 },
};

const ItemBonusFields: React.FC<ItemBonusFieldsProps> = ({ item, onChange }) => {
  const [expandedBonusTypes, setExpandedBonusTypes] = useState<Record<string, boolean>>({
    attributes: false,
    basic: false,
    weapon: false,
    craft: false,
    magic: false,
  });

  const toggleBonusType = (type: string) => {
    setExpandedBonusTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const formatWeaponSkillName = (skill: string): string => {
    const parts = skill.replace(/([A-Z])/g, ' $1').trim().split(' ');
    return parts
      .filter((p) => p.toLowerCase() !== 'weapons')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  };

  const formatSkillName = (skill: string): string => {
    return skill
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  };

  // Use item data if present, otherwise use defaults
  const attributes = item.attributes && Object.keys(item.attributes).length > 0
    ? item.attributes
    : defaultAttributes;
  const basic = item.basic && Object.keys(item.basic).length > 0
    ? item.basic
    : defaultBasicSkills;
  const weapon = item.weapon && Object.keys(item.weapon).length > 0
    ? item.weapon
    : defaultWeaponSkills;
  const craft = item.craft && Object.keys(item.craft).length > 0
    ? item.craft
    : defaultCraftSkills;
  const magic = item.magic && Object.keys(item.magic).length > 0
    ? item.magic
    : defaultMagicSkills;

  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    padding: '0.5rem 0',
    userSelect: 'none',
    color: 'var(--color-white)',
    fontWeight: '600',
    fontSize: '0.95rem',
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Attribute Bonuses */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleBonusType('attributes')}>
          {expandedBonusTypes.attributes ? (
            <ChevronDown size={16} style={{ color: 'var(--color-metal-gold)' }} />
          ) : (
            <ChevronRight size={16} style={{ color: 'var(--color-metal-gold)' }} />
          )}
          Attribute Bonuses
        </div>
        {expandedBonusTypes.attributes && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
            }}
          >
            {Object.entries(attributes).map(([attr, bonus]) => (
              <div key={attr} style={skillCardStyle}>
                <span style={skillNameStyle}>{attr}</span>
                <div>
                  <label style={smallLabelStyle}>Talent Bonus</label>
                  <input
                    type="number"
                    value={(bonus as any)?.add_talent || 0}
                    onChange={(e) =>
                      onChange('attributes', {
                        ...attributes,
                        [attr]: {
                          ...(bonus as any),
                          add_talent: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    style={bonusInputStyle}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Basic Skill Bonuses */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleBonusType('basic')}>
          {expandedBonusTypes.basic ? (
            <ChevronDown size={16} style={{ color: 'var(--color-metal-gold)' }} />
          ) : (
            <ChevronRight size={16} style={{ color: 'var(--color-metal-gold)' }} />
          )}
          Basic Skill Bonuses
        </div>
        {expandedBonusTypes.basic && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
            }}
          >
            {Object.entries(basic).map(([skill, bonus]) => (
              <div key={skill} style={skillCardStyle}>
                <span style={skillNameStyle}>{skill}</span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <label style={smallLabelStyle}>Skill Bonus</label>
                    <input
                      type="number"
                      value={(bonus as any)?.add_bonus || 0}
                      onChange={(e) =>
                        onChange('basic', {
                          ...basic,
                          [skill]: {
                            ...(bonus as any),
                            add_bonus: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      style={bonusInputStyle}
                    />
                  </div>
                  <div>
                    <label style={smallLabelStyle}>Set To</label>
                    <input
                      type="number"
                      value={(bonus as any)?.set_bonus || 0}
                      onChange={(e) =>
                        onChange('basic', {
                          ...basic,
                          [skill]: {
                            ...(bonus as any),
                            set_bonus: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      style={bonusInputStyle}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weapon Skill Bonuses */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleBonusType('weapon')}>
          {expandedBonusTypes.weapon ? (
            <ChevronDown size={16} style={{ color: 'var(--color-metal-gold)' }} />
          ) : (
            <ChevronRight size={16} style={{ color: 'var(--color-metal-gold)' }} />
          )}
          Weapon Skill Bonuses
        </div>
        {expandedBonusTypes.weapon && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
            }}
          >
            {Object.entries(weapon).map(([skill, bonus]) => (
              <div key={skill} style={skillCardStyle}>
                <span style={skillNameStyle}>{formatWeaponSkillName(skill)}</span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <label style={smallLabelStyle}>Skill Bonus</label>
                    <input
                      type="number"
                      value={(bonus as any)?.add_bonus || 0}
                      onChange={(e) =>
                        onChange('weapon', {
                          ...weapon,
                          [skill]: {
                            ...(bonus as any),
                            add_bonus: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      style={bonusInputStyle}
                    />
                  </div>
                  <div>
                    <label style={smallLabelStyle}>Talent Bonus</label>
                    <input
                      type="number"
                      value={(bonus as any)?.add_talent || 0}
                      onChange={(e) =>
                        onChange('weapon', {
                          ...weapon,
                          [skill]: {
                            ...(bonus as any),
                            add_talent: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      style={bonusInputStyle}
                    />
                  </div>
                  <div>
                    <label style={smallLabelStyle}>Set Skill</label>
                    <input
                      type="number"
                      value={(bonus as any)?.set_bonus || 0}
                      onChange={(e) =>
                        onChange('weapon', {
                          ...weapon,
                          [skill]: {
                            ...(bonus as any),
                            set_bonus: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      style={bonusInputStyle}
                    />
                  </div>
                  <div>
                    <label style={smallLabelStyle}>Set Talent</label>
                    <input
                      type="number"
                      value={(bonus as any)?.set_talent || 0}
                      onChange={(e) =>
                        onChange('weapon', {
                          ...weapon,
                          [skill]: {
                            ...(bonus as any),
                            set_talent: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      style={bonusInputStyle}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crafting Skill Bonuses */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleBonusType('craft')}>
          {expandedBonusTypes.craft ? (
            <ChevronDown size={16} style={{ color: 'var(--color-metal-gold)' }} />
          ) : (
            <ChevronRight size={16} style={{ color: 'var(--color-metal-gold)' }} />
          )}
          Crafting Skill Bonuses
        </div>
        {expandedBonusTypes.craft && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
            }}
          >
            {Object.entries(craft).map(([skill, bonus]) => (
              <div key={skill} style={skillCardStyle}>
                <span style={skillNameStyle}>{formatSkillName(skill)}</span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <label style={smallLabelStyle}>Skill Bonus</label>
                    <input
                      type="number"
                      value={(bonus as any)?.add_bonus || 0}
                      onChange={(e) =>
                        onChange('craft', {
                          ...craft,
                          [skill]: {
                            ...(bonus as any),
                            add_bonus: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      style={bonusInputStyle}
                    />
                  </div>
                  <div>
                    <label style={smallLabelStyle}>Talent Bonus</label>
                    <input
                      type="number"
                      value={(bonus as any)?.add_talent || 0}
                      onChange={(e) =>
                        onChange('craft', {
                          ...craft,
                          [skill]: {
                            ...(bonus as any),
                            add_talent: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      style={bonusInputStyle}
                    />
                  </div>
                  <div>
                    <label style={smallLabelStyle}>Set Skill</label>
                    <input
                      type="number"
                      value={(bonus as any)?.set_bonus || 0}
                      onChange={(e) =>
                        onChange('craft', {
                          ...craft,
                          [skill]: {
                            ...(bonus as any),
                            set_bonus: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      style={bonusInputStyle}
                    />
                  </div>
                  <div>
                    <label style={smallLabelStyle}>Set Talent</label>
                    <input
                      type="number"
                      value={(bonus as any)?.set_talent || 0}
                      onChange={(e) =>
                        onChange('craft', {
                          ...craft,
                          [skill]: {
                            ...(bonus as any),
                            set_talent: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      style={bonusInputStyle}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Magic Skill Bonuses */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleBonusType('magic')}>
          {expandedBonusTypes.magic ? (
            <ChevronDown size={16} style={{ color: 'var(--color-metal-gold)' }} />
          ) : (
            <ChevronRight size={16} style={{ color: 'var(--color-metal-gold)' }} />
          )}
          Magic Skill Bonuses
        </div>
        {expandedBonusTypes.magic && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
            }}
          >
            {Object.entries(magic).map(([skill, bonus]) => {
              return (
                <div key={skill} style={skillCardStyle}>
                  <span style={skillNameStyle}>{formatSkillName(skill)}</span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <label style={smallLabelStyle}>Skill Bonus</label>
                      <input
                        type="number"
                        value={(bonus as any)?.add_bonus || 0}
                        onChange={(e) =>
                          onChange('magic', {
                            ...magic,
                            [skill]: {
                              ...(bonus as any),
                              add_bonus: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        style={bonusInputStyle}
                      />
                    </div>
                    <div>
                      <label style={smallLabelStyle}>Talent Bonus</label>
                      <input
                        type="number"
                        value={(bonus as any)?.add_talent || 0}
                        onChange={(e) =>
                          onChange('magic', {
                            ...magic,
                            [skill]: {
                              ...(bonus as any),
                              add_talent: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        style={bonusInputStyle}
                      />
                    </div>
                    <div>
                      <label style={smallLabelStyle}>Set Skill</label>
                      <input
                        type="number"
                        value={(bonus as any)?.set_bonus || 0}
                        onChange={(e) =>
                          onChange('magic', {
                            ...magic,
                            [skill]: {
                              ...(bonus as any),
                              set_bonus: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        style={bonusInputStyle}
                      />
                    </div>
                    <div>
                      <label style={smallLabelStyle}>Set Talent</label>
                      <input
                        type="number"
                        value={(bonus as any)?.set_talent || 0}
                        onChange={(e) =>
                          onChange('magic', {
                            ...magic,
                            [skill]: {
                              ...(bonus as any),
                              set_talent: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        style={bonusInputStyle}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemBonusFields;
