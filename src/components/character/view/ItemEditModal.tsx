import React, { useState, useEffect } from 'react';
import { Item, CharacterItem } from '../../../types/character';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: CharacterItem;
  inventoryIndex: number;
  onSave: (index: number, modifications: Partial<Item>, quantity: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
}

const ItemEditModal: React.FC<ItemEditModalProps> = ({
  isOpen,
  onClose,
  inventoryItem,
  inventoryIndex,
  onSave,
  onUpdateQuantity,
}) => {
  // Get the actual item data (either from itemData or itemId)
  const getItemData = (): Item => {
    if (inventoryItem.isCustomized && inventoryItem.itemData) {
      return inventoryItem.itemData;
    }
    return inventoryItem.itemId as Item;
  };

  const originalItem = getItemData();

  const [editedItem, setEditedItem] = useState<Partial<Item>>(originalItem);
  const [quantity, setQuantity] = useState(inventoryItem.quantity);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    resources: false,
    weapon: false,
    bonuses: false,
    mitigation: false,
    special: false,
  });
  const [expandedBonusTypes, setExpandedBonusTypes] = useState<Record<string, boolean>>({
    attributes: true,
    basic: true,
    weapon: true,
    craft: true,
    magic: true,
  });

  useEffect(() => {
    const item = getItemData();
    setEditedItem(item);
    setQuantity(inventoryItem.quantity);
    setHasChanges(false);
    // Auto-expand relevant sections based on item type
    setExpandedSections({
      basic: true,
      resources: true,
      weapon: item.type === 'weapon',
      bonuses: !!item.basic || !!item.weapon || !!item.magic || !!item.craft || !!item.attributes,
      mitigation: !!item.mitigation && Object.keys(item.mitigation).length > 0,
      special: !!item.detections || !!item.immunities,
    });
  }, [inventoryItem, isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (field: string, value: any) => {
    setEditedItem((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    setQuantity(Math.max(1, newQuantity));
    if (newQuantity !== inventoryItem.quantity) {
      onUpdateQuantity(inventoryIndex, newQuantity);
    }
  };

  const handleSave = () => {
    if (hasChanges) {
      onSave(inventoryIndex, editedItem, quantity);
    }
    onClose();
  };

  // Shared input styles
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'var(--color-dark-bg)',
    border: '2px solid var(--color-dark-border)',
    borderRadius: '0.5rem',
    color: 'var(--color-white)',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    outline: 'none',
  };

  const labelStyle = {
    color: 'var(--color-white)',
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    letterSpacing: '0.025em',
    textTransform: 'uppercase' as const,
  };

  const subHeaderStyle = {
    color: 'var(--color-white)',
    marginBottom: '1rem',
    fontSize: '1rem',
    fontWeight: '600',
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleBonusType = (type: string) => {
    setExpandedBonusTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const rangeOptions = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Adjacent' },
    { value: 2, label: 'Nearby' },
    { value: 3, label: 'Very Short' },
    { value: 4, label: 'Short' },
    { value: 5, label: 'Moderate' },
    { value: 6, label: 'Distant' },
    { value: 7, label: 'Remote' },
    { value: 8, label: 'Unlimited' },
  ];

  const SectionHeader: React.FC<{ title: string; section: string }> = ({ title, section }) => (
    <div
      onClick={() => toggleSection(section)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        backgroundColor: 'var(--color-dark-elevated)',
        marginBottom: expandedSections[section] ? '1rem' : '0.5rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--color-dark-border)',
        userSelect: 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        e.currentTarget.style.borderColor = 'var(--color-metal-gold)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-dark-elevated)';
        e.currentTarget.style.borderColor = 'var(--color-dark-border)';
      }}
    >
      <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-white)', fontWeight: '600' }}>
        {title}
      </h3>
      {expandedSections[section] ? (
        <ChevronDown size={18} style={{ color: 'var(--color-metal-gold)' }} />
      ) : (
        <ChevronRight size={18} style={{ color: 'var(--color-metal-gold)' }} />
      )}
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-dark-surface)',
          border: '2px solid var(--color-dark-border)',
          borderRadius: '0.75rem',
          padding: '2.5rem',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(138, 116, 192, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '2px solid var(--color-dark-border)',
            position: 'relative',
          }}
        >
          <div>
            <h2
              style={{
                color: 'var(--color-white)',
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: '700',
                letterSpacing: '-0.02em',
              }}
            >
              {editedItem.name || 'Edit Item'}
            </h2>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '0.75rem',
                alignItems: 'center',
              }}
            >
              {inventoryItem.isCustomized && (
                <span
                  style={{
                    color: 'var(--color-sat-purple)',
                    fontSize: '0.875rem',
                    backgroundColor: 'rgba(138, 116, 192, 0.15)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid rgba(138, 116, 192, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  ✨ Customized
                </span>
              )}
              {editedItem.rarity && (
                <span
                  style={{
                    color:
                      editedItem.rarity === 'legendary'
                        ? '#ff8c42'
                        : editedItem.rarity === 'epic'
                          ? '#b794f6'
                          : editedItem.rarity === 'rare'
                            ? '#63b3ed'
                            : editedItem.rarity === 'uncommon'
                              ? '#68d391'
                              : '#a0aec0',
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                    fontWeight: '600',
                    backgroundColor:
                      editedItem.rarity === 'legendary'
                        ? 'rgba(255, 140, 66, 0.15)'
                        : editedItem.rarity === 'epic'
                          ? 'rgba(183, 148, 246, 0.15)'
                          : editedItem.rarity === 'rare'
                            ? 'rgba(99, 179, 237, 0.15)'
                            : editedItem.rarity === 'uncommon'
                              ? 'rgba(104, 211, 145, 0.15)'
                              : 'rgba(160, 174, 192, 0.15)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: `1px solid ${
                      editedItem.rarity === 'legendary'
                        ? 'rgba(255, 140, 66, 0.3)'
                        : editedItem.rarity === 'epic'
                          ? 'rgba(183, 148, 246, 0.3)'
                          : editedItem.rarity === 'rare'
                            ? 'rgba(99, 179, 237, 0.3)'
                            : editedItem.rarity === 'uncommon'
                              ? 'rgba(104, 211, 145, 0.3)'
                              : 'rgba(160, 174, 192, 0.3)'
                    }`,
                  }}
                >
                  {editedItem.rarity}
                </span>
              )}
              {editedItem.type && (
                <span
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--color-dark-border)',
                  }}
                >
                  {editedItem.type}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-dark-elevated)',
              border: '1px solid var(--color-dark-border)',
              color: 'var(--color-cloud)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-sunset)';
              e.currentTarget.style.borderColor = 'var(--color-sunset)';
              e.currentTarget.style.color = 'var(--color-white)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-dark-elevated)';
              e.currentTarget.style.borderColor = 'var(--color-dark-border)';
              e.currentTarget.style.color = 'var(--color-cloud)';
            }}
          >
            ×
          </button>
        </div>

        {/* Form Content */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Basic Information */}
          <div>
            <SectionHeader title="Basic Information" section="basic" />
            {expandedSections.basic && (
              <div
                style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--color-dark-border)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '1.5rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div>
                    <label style={labelStyle}>Item Name</label>
                    <input
                      type="text"
                      value={editedItem.name || ''}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      style={inputStyle}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-sat-purple)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(138, 116, 192, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-dark-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      min="1"
                      style={inputStyle}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-sat-purple)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(138, 116, 192, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-dark-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={editedItem.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={3}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '80px',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-sat-purple)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(138, 116, 192, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-dark-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Weight
                    </label>
                    <input
                      type="number"
                      value={editedItem.weight || 0}
                      onChange={(e) => handleFieldChange('weight', parseFloat(e.target.value) || 0)}
                      step="0.1"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-bg)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.25rem',
                        color: 'var(--color-cloud)',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Value
                    </label>
                    <input
                      type="number"
                      value={editedItem.value || 0}
                      onChange={(e) => handleFieldChange('value', parseInt(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-bg)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.25rem',
                        color: 'var(--color-cloud)',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Type
                    </label>
                    <select
                      value={editedItem.type || 'weapon'}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-bg)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.25rem',
                        color: 'var(--color-cloud)',
                      }}
                    >
                      <option value="weapon">Weapon</option>
                      <option value="boots">Boots</option>
                      <option value="body">Body</option>
                      <option value="gloves">Gloves</option>
                      <option value="headwear">Headwear</option>
                      <option value="cloak">Cloak</option>
                      <option value="accessory">Accessory</option>
                      <option value="shield">Shield</option>
                      <option value="goods">Goods</option>
                      <option value="adventure">Adventure</option>
                      <option value="consumable">Consumable</option>
                      <option value="tool">Tool</option>
                      <option value="instrument">Instrument</option>
                      <option value="ammunition">Ammunition</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Rarity
                    </label>
                    <select
                      value={editedItem.rarity || 'common'}
                      onChange={(e) => handleFieldChange('rarity', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-bg)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.25rem',
                        color: 'var(--color-cloud)',
                      }}
                    >
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                      <option value="artifact">Artifact</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resource Bonuses */}
          <div>
            <SectionHeader title="Resource Bonuses" section="resources" />
            {expandedSections.resources && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Health
                  </label>
                  <input
                    type="number"
                    value={editedItem.health?.max || 0}
                    onChange={(e) =>
                      handleFieldChange('health', {
                        ...editedItem.health,
                        max: parseInt(e.target.value) || 0,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-bg)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.25rem',
                      color: 'var(--color-cloud)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Energy
                  </label>
                  <input
                    type="number"
                    value={editedItem.energy?.max || 0}
                    onChange={(e) =>
                      handleFieldChange('energy', {
                        ...editedItem.energy,
                        max: parseInt(e.target.value) || 0,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-bg)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.25rem',
                      color: 'var(--color-cloud)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Resolve
                  </label>
                  <input
                    type="number"
                    value={editedItem.resolve?.max || 0}
                    onChange={(e) =>
                      handleFieldChange('resolve', {
                        ...editedItem.resolve,
                        max: parseInt(e.target.value) || 0,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-bg)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.25rem',
                      color: 'var(--color-cloud)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Movement
                  </label>
                  <input
                    type="number"
                    value={editedItem.movement || 0}
                    onChange={(e) => handleFieldChange('movement', parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-bg)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.25rem',
                      color: 'var(--color-cloud)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Weapon Data (if weapon type) */}
          {editedItem.type === 'weapon' && (
            <div>
              <SectionHeader title="Weapon Properties" section="weapon" />
              {expandedSections.weapon && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {/* Weapon Category */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Weapon Category
                      </label>
                      <select
                        value={editedItem.weapon_category || 'simpleMelee'}
                        onChange={(e) => handleFieldChange('weapon_category', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-bg)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                          color: 'var(--color-cloud)',
                        }}
                      >
                        <option value="simpleMelee">Simple Melee</option>
                        <option value="simpleRanged">Simple Ranged</option>
                        <option value="complexMelee">Complex Melee</option>
                        <option value="complexRanged">Complex Ranged</option>
                        <option value="unarmed">Unarmed</option>
                        <option value="throwing">Throwing</option>
                      </select>
                    </div>

                    {/* Bonus Attack */}
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Attack Bonus (+)
                      </label>
                      <input
                        type="number"
                        value={editedItem.bonus_attack || 0}
                        onChange={(e) =>
                          handleFieldChange('bonus_attack', parseInt(e.target.value) || 0)
                        }
                        min="0"
                        max="5"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-bg)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                          color: 'var(--color-cloud)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Primary Attack */}
                  {editedItem.primary && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '1.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--color-dark-border)',
                        marginTop: '0.5rem',
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          marginBottom: '1rem',
                          fontSize: '1rem',
                          color: 'var(--color-white)',
                          fontWeight: '600',
                        }}
                      >
                        Primary Attack
                      </h4>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '0.75rem',
                        }}
                      >
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Damage
                          </label>
                          <input
                            type="text"
                            value={editedItem.primary?.damage || ''}
                            onChange={(e) =>
                              handleFieldChange('primary', {
                                ...editedItem.primary,
                                damage: e.target.value,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Extra Damage
                          </label>
                          <input
                            type="text"
                            value={editedItem.primary?.damage_extra || ''}
                            onChange={(e) =>
                              handleFieldChange('primary', {
                                ...editedItem.primary,
                                damage_extra: e.target.value,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Damage Type
                          </label>
                          <select
                            value={editedItem.primary?.damage_type || 'physical'}
                            onChange={(e) =>
                              handleFieldChange('primary', {
                                ...editedItem.primary,
                                damage_type: e.target.value,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          >
                            <option value="physical">Physical</option>
                            <option value="heat">Heat</option>
                            <option value="cold">Cold</option>
                            <option value="electric">Electric</option>
                            <option value="dark">Dark</option>
                            <option value="divine">Divine</option>
                            <option value="aether">Aether</option>
                            <option value="psychic">Psychic</option>
                            <option value="toxic">Toxic</option>
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Attack Type
                          </label>
                          <select
                            value={editedItem.primary?.category || 'slash'}
                            onChange={(e) =>
                              handleFieldChange('primary', {
                                ...editedItem.primary,
                                category: e.target.value,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          >
                            <option value="pierce">Pierce</option>
                            <option value="slash">Slash</option>
                            <option value="blunt">Blunt</option>
                            <option value="ranged">Ranged</option>
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Min Range
                          </label>
                          <select
                            value={editedItem.primary?.min_range || 0}
                            onChange={(e) =>
                              handleFieldChange('primary', {
                                ...editedItem.primary,
                                min_range: parseInt(e.target.value) || 0,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          >
                            {rangeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Max Range
                          </label>
                          <select
                            value={editedItem.primary?.max_range || 1}
                            onChange={(e) =>
                              handleFieldChange('primary', {
                                ...editedItem.primary,
                                max_range: parseInt(e.target.value) || 1,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          >
                            {rangeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Secondary damage if exists */}
                      {(editedItem.primary?.secondary_damage ||
                        editedItem.primary?.secondary_damage_type) && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Secondary Damage
                          </label>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: '0.75rem',
                            }}
                          >
                            <input
                              type="number"
                              value={editedItem.primary?.secondary_damage || 0}
                              onChange={(e) =>
                                handleFieldChange('primary', {
                                  ...editedItem.primary,
                                  secondary_damage: parseInt(e.target.value) || 0,
                                })
                              }
                              placeholder="Damage"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            />
                            <input
                              type="number"
                              value={editedItem.primary?.secondary_damage_extra || 0}
                              onChange={(e) =>
                                handleFieldChange('primary', {
                                  ...editedItem.primary,
                                  secondary_damage_extra: parseInt(e.target.value) || 0,
                                })
                              }
                              placeholder="Extra"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            />
                            <select
                              value={editedItem.primary?.secondary_damage_type || 'physical'}
                              onChange={(e) =>
                                handleFieldChange('primary', {
                                  ...editedItem.primary,
                                  secondary_damage_type: e.target.value,
                                })
                              }
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            >
                              <option value="physical">Physical</option>
                              <option value="heat">Heat</option>
                              <option value="cold">Cold</option>
                              <option value="electric">Electric</option>
                              <option value="dark">Dark</option>
                              <option value="divine">Divine</option>
                              <option value="aether">Aether</option>
                              <option value="psychic">Psychic</option>
                              <option value="toxic">Toxic</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Secondary Attack */}
                  {editedItem.secondary && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '1.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--color-dark-border)',
                        marginTop: '0.5rem',
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          marginBottom: '1rem',
                          fontSize: '1rem',
                          color: 'var(--color-white)',
                          fontWeight: '600',
                        }}
                      >
                        Secondary Attack
                      </h4>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '0.75rem',
                        }}
                      >
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Damage
                          </label>
                          <input
                            type="text"
                            value={editedItem.secondary?.damage || ''}
                            onChange={(e) =>
                              handleFieldChange('secondary', {
                                ...editedItem.secondary,
                                damage: e.target.value,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Extra Damage
                          </label>
                          <input
                            type="text"
                            value={editedItem.secondary?.damage_extra || ''}
                            onChange={(e) =>
                              handleFieldChange('secondary', {
                                ...editedItem.secondary,
                                damage_extra: e.target.value,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Damage Type
                          </label>
                          <select
                            value={editedItem.secondary?.damage_type || 'physical'}
                            onChange={(e) =>
                              handleFieldChange('secondary', {
                                ...editedItem.secondary,
                                damage_type: e.target.value,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          >
                            <option value="physical">Physical</option>
                            <option value="heat">Heat</option>
                            <option value="cold">Cold</option>
                            <option value="electric">Electric</option>
                            <option value="dark">Dark</option>
                            <option value="divine">Divine</option>
                            <option value="aether">Aether</option>
                            <option value="psychic">Psychic</option>
                            <option value="toxic">Toxic</option>
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Attack Type
                          </label>
                          <select
                            value={editedItem.secondary?.category || 'slash'}
                            onChange={(e) =>
                              handleFieldChange('secondary', {
                                ...editedItem.secondary,
                                category: e.target.value,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          >
                            <option value="pierce">Pierce</option>
                            <option value="slash">Slash</option>
                            <option value="blunt">Blunt</option>
                            <option value="ranged">Ranged</option>
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Min Range
                          </label>
                          <select
                            value={editedItem.secondary?.min_range || 0}
                            onChange={(e) =>
                              handleFieldChange('secondary', {
                                ...editedItem.secondary,
                                min_range: parseInt(e.target.value) || 0,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          >
                            {rangeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Max Range
                          </label>
                          <select
                            value={editedItem.secondary?.max_range || 1}
                            onChange={(e) =>
                              handleFieldChange('secondary', {
                                ...editedItem.secondary,
                                max_range: parseInt(e.target.value) || 1,
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          >
                            {rangeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Secondary damage if exists */}
                      {(editedItem.secondary?.secondary_damage ||
                        editedItem.secondary?.secondary_damage_type) && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            Secondary Damage
                          </label>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: '0.75rem',
                            }}
                          >
                            <input
                              type="number"
                              value={editedItem.secondary?.secondary_damage || 0}
                              onChange={(e) =>
                                handleFieldChange('secondary', {
                                  ...editedItem.secondary,
                                  secondary_damage: parseInt(e.target.value) || 0,
                                })
                              }
                              placeholder="Damage"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            />
                            <input
                              type="number"
                              value={editedItem.secondary?.secondary_damage_extra || 0}
                              onChange={(e) =>
                                handleFieldChange('secondary', {
                                  ...editedItem.secondary,
                                  secondary_damage_extra: parseInt(e.target.value) || 0,
                                })
                              }
                              placeholder="Extra"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            />
                            <select
                              value={editedItem.secondary?.secondary_damage_type || 'physical'}
                              onChange={(e) =>
                                handleFieldChange('secondary', {
                                  ...editedItem.secondary,
                                  secondary_damage_type: e.target.value,
                                })
                              }
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            >
                              <option value="physical">Physical</option>
                              <option value="heat">Heat</option>
                              <option value="cold">Cold</option>
                              <option value="electric">Electric</option>
                              <option value="dark">Dark</option>
                              <option value="divine">Divine</option>
                              <option value="aether">Aether</option>
                              <option value="psychic">Psychic</option>
                              <option value="toxic">Toxic</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Skill/Talent Bonuses */}
          {(editedItem.basic ||
            editedItem.weapon ||
            editedItem.magic ||
            editedItem.craft ||
            editedItem.attributes) && (
            <div>
              <SectionHeader title="Bonuses & Modifiers" section="bonuses" />
              {expandedSections.bonuses && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {/* Attribute Bonuses */}
                  {editedItem.attributes && Object.keys(editedItem.attributes).length > 0 && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '1.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--color-dark-border)',
                      }}
                    >
                      <div
                        onClick={() => toggleBonusType('attributes')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          marginBottom: expandedBonusTypes.attributes ? '1rem' : '0',
                        }}
                      >
                        <h4
                          style={{
                            ...subHeaderStyle,
                            marginBottom: 0,
                            paddingBottom: 0,
                            borderBottom: 'none',
                          }}
                        >
                          Attribute Bonuses
                        </h4>
                        {expandedBonusTypes.attributes ? (
                          <ChevronDown size={16} style={{ color: 'var(--color-metal-gold)' }} />
                        ) : (
                          <ChevronRight size={16} style={{ color: 'var(--color-metal-gold)' }} />
                        )}
                      </div>
                      {expandedBonusTypes.attributes && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '0.75rem',
                          }}
                        >
                          {Object.entries(editedItem.attributes).map(([attr, bonus]) => (
                            <div
                              key={attr}
                              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                            >
                              <span
                                style={{
                                  color: 'var(--color-cloud)',
                                  flex: 1,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {attr}:
                              </span>
                              <input
                                type="number"
                                value={bonus?.add_talent || 0}
                                onChange={(e) =>
                                  handleFieldChange('attributes', {
                                    ...editedItem.attributes,
                                    [attr]: {
                                      ...bonus,
                                      add_talent: parseInt(e.target.value) || 0,
                                    },
                                  })
                                }
                                placeholder="Add"
                                style={{
                                  width: '60px',
                                  padding: '0.25rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Basic Skill Bonuses */}
                  {editedItem.basic && Object.keys(editedItem.basic).length > 0 && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '1.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--color-dark-border)',
                      }}
                    >
                      <div
                        onClick={() => toggleBonusType('basic')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          marginBottom: expandedBonusTypes.basic ? '1rem' : '0',
                        }}
                      >
                        <h4
                          style={{
                            ...subHeaderStyle,
                            marginBottom: 0,
                            paddingBottom: 0,
                            borderBottom: 'none',
                          }}
                        >
                          Basic Skill Bonuses
                        </h4>
                        {expandedBonusTypes.basic ? (
                          <ChevronDown size={16} style={{ color: 'var(--color-metal-gold)' }} />
                        ) : (
                          <ChevronRight size={16} style={{ color: 'var(--color-metal-gold)' }} />
                        )}
                      </div>
                      {expandedBonusTypes.basic && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '0.75rem',
                          }}
                        >
                          {Object.entries(editedItem.basic).map(([skill, bonus]) => (
                            <div
                              key={skill}
                              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                            >
                              <span
                                style={{
                                  color: 'var(--color-cloud)',
                                  flex: 1,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {skill}:
                              </span>
                              <input
                                type="number"
                                value={bonus?.add_bonus || 0}
                                onChange={(e) =>
                                  handleFieldChange('basic', {
                                    ...editedItem.basic,
                                    [skill]: {
                                      ...bonus,
                                      add_bonus: parseInt(e.target.value) || 0,
                                    },
                                  })
                                }
                                placeholder="Bonus"
                                style={{
                                  width: '60px',
                                  padding: '0.25rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Weapon Skill Bonuses */}
                  {editedItem.weapon && Object.keys(editedItem.weapon).length > 0 && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '1.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--color-dark-border)',
                      }}
                    >
                      <div
                        onClick={() => toggleBonusType('weapon')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          marginBottom: expandedBonusTypes.weapon ? '1rem' : '0',
                        }}
                      >
                        <h4
                          style={{
                            ...subHeaderStyle,
                            marginBottom: 0,
                            paddingBottom: 0,
                            borderBottom: 'none',
                          }}
                        >
                          Weapon Skill Bonuses
                        </h4>
                        {expandedBonusTypes.weapon ? (
                          <ChevronDown size={16} style={{ color: 'var(--color-metal-gold)' }} />
                        ) : (
                          <ChevronRight size={16} style={{ color: 'var(--color-metal-gold)' }} />
                        )}
                      </div>
                      {expandedBonusTypes.weapon && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                          }}
                        >
                          {Object.entries(editedItem.weapon).map(([skill, bonus]) => (
                            <div
                              key={skill}
                              style={{
                                backgroundColor: 'var(--color-dark-bg)',
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid var(--color-dark-border)',
                              }}
                            >
                              <span
                                style={{
                                  color: 'var(--color-white)',
                                  fontWeight: '600',
                                  display: 'block',
                                  marginBottom: '0.5rem',
                                  fontSize: '0.9rem',
                                }}
                              >
                                {skill
                                  .replace(/([A-Z])/g, ' $1')
                                  .trim()
                                  .replace(/Weapons/, '')
                                  .split(' ')
                                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ')}
                              </span>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '0.5rem',
                                }}
                              >
                                <div>
                                  <label
                                    style={{
                                      color: 'var(--color-cloud)',
                                      fontSize: '0.75rem',
                                      display: 'block',
                                      marginBottom: '0.25rem',
                                      opacity: 0.8,
                                    }}
                                  >
                                    Bonus
                                  </label>
                                  <input
                                    type="number"
                                    value={bonus?.add_bonus || 0}
                                    onChange={(e) =>
                                      handleFieldChange('weapon', {
                                        ...editedItem.weapon,
                                        [skill]: {
                                          ...bonus,
                                          add_bonus: parseInt(e.target.value) || 0,
                                        },
                                      })
                                    }
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      backgroundColor: 'var(--color-dark-surface)',
                                      border: '1px solid var(--color-dark-border)',
                                      borderRadius: '0.25rem',
                                      color: 'var(--color-white)',
                                      fontSize: '0.9rem',
                                    }}
                                  />
                                </div>
                                <div>
                                  <label
                                    style={{
                                      color: 'var(--color-cloud)',
                                      fontSize: '0.75rem',
                                      display: 'block',
                                      marginBottom: '0.25rem',
                                      opacity: 0.8,
                                    }}
                                  >
                                    Talent
                                  </label>
                                  <input
                                    type="number"
                                    value={bonus?.add_talent || 0}
                                    onChange={(e) =>
                                      handleFieldChange('weapon', {
                                        ...editedItem.weapon,
                                        [skill]: {
                                          ...bonus,
                                          add_talent: parseInt(e.target.value) || 0,
                                        },
                                      })
                                    }
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      backgroundColor: 'var(--color-dark-surface)',
                                      border: '1px solid var(--color-dark-border)',
                                      borderRadius: '0.25rem',
                                      color: 'var(--color-white)',
                                      fontSize: '0.9rem',
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Crafting Skill Bonuses */}
                  {editedItem.craft && Object.keys(editedItem.craft).length > 0 && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '1.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--color-dark-border)',
                      }}
                    >
                      <div
                        onClick={() => toggleBonusType('craft')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          marginBottom: expandedBonusTypes.craft ? '1rem' : '0',
                        }}
                      >
                        <h4
                          style={{
                            ...subHeaderStyle,
                            marginBottom: 0,
                            paddingBottom: 0,
                            borderBottom: 'none',
                          }}
                        >
                          Crafting Skill Bonuses
                        </h4>
                        {expandedBonusTypes.craft ? (
                          <ChevronDown size={16} style={{ color: 'var(--color-metal-gold)' }} />
                        ) : (
                          <ChevronRight size={16} style={{ color: 'var(--color-metal-gold)' }} />
                        )}
                      </div>
                      {expandedBonusTypes.craft && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                          }}
                        >
                          {Object.entries(editedItem.craft).map(([skill, bonus]) => (
                            <div
                              key={skill}
                              style={{
                                backgroundColor: 'var(--color-dark-bg)',
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid var(--color-dark-border)',
                              }}
                            >
                              <span
                                style={{
                                  color: 'var(--color-white)',
                                  fontWeight: '600',
                                  display: 'block',
                                  marginBottom: '0.5rem',
                                  fontSize: '0.9rem',
                                }}
                              >
                                {skill
                                  .split(/(?=[A-Z])/)
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                  )
                                  .join(' ')}
                              </span>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '0.5rem',
                                }}
                              >
                                <div>
                                  <label
                                    style={{
                                      color: 'var(--color-cloud)',
                                      fontSize: '0.75rem',
                                      display: 'block',
                                      marginBottom: '0.25rem',
                                      opacity: 0.8,
                                    }}
                                  >
                                    Bonus
                                  </label>
                                  <input
                                    type="number"
                                    value={bonus?.add_bonus || 0}
                                    onChange={(e) =>
                                      handleFieldChange('craft', {
                                        ...editedItem.craft,
                                        [skill]: {
                                          ...bonus,
                                          add_bonus: parseInt(e.target.value) || 0,
                                        },
                                      })
                                    }
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      backgroundColor: 'var(--color-dark-surface)',
                                      border: '1px solid var(--color-dark-border)',
                                      borderRadius: '0.25rem',
                                      color: 'var(--color-white)',
                                      fontSize: '0.9rem',
                                    }}
                                  />
                                </div>
                                <div>
                                  <label
                                    style={{
                                      color: 'var(--color-cloud)',
                                      fontSize: '0.75rem',
                                      display: 'block',
                                      marginBottom: '0.25rem',
                                      opacity: 0.8,
                                    }}
                                  >
                                    Talent
                                  </label>
                                  <input
                                    type="number"
                                    value={bonus?.add_talent || 0}
                                    onChange={(e) =>
                                      handleFieldChange('craft', {
                                        ...editedItem.craft,
                                        [skill]: {
                                          ...bonus,
                                          add_talent: parseInt(e.target.value) || 0,
                                        },
                                      })
                                    }
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      backgroundColor: 'var(--color-dark-surface)',
                                      border: '1px solid var(--color-dark-border)',
                                      borderRadius: '0.25rem',
                                      color: 'var(--color-white)',
                                      fontSize: '0.9rem',
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Magic Skill Bonuses */}
                  {editedItem.magic && Object.keys(editedItem.magic).length > 0 && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '1.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--color-dark-border)',
                      }}
                    >
                      <div
                        onClick={() => toggleBonusType('magic')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          marginBottom: expandedBonusTypes.magic ? '1rem' : '0',
                        }}
                      >
                        <h4
                          style={{
                            ...subHeaderStyle,
                            marginBottom: 0,
                            paddingBottom: 0,
                            borderBottom: 'none',
                          }}
                        >
                          Magic Skill Bonuses
                        </h4>
                        {expandedBonusTypes.magic ? (
                          <ChevronDown size={16} style={{ color: 'var(--color-metal-gold)' }} />
                        ) : (
                          <ChevronRight size={16} style={{ color: 'var(--color-metal-gold)' }} />
                        )}
                      </div>
                      {expandedBonusTypes.magic && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                          }}
                        >
                          {Object.entries(editedItem.magic).map(([skill, bonus]) => (
                            <div
                              key={skill}
                              style={{
                                backgroundColor: 'var(--color-dark-bg)',
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid var(--color-dark-border)',
                              }}
                            >
                              <span
                                style={{
                                  color: 'var(--color-white)',
                                  fontWeight: '600',
                                  display: 'block',
                                  marginBottom: '0.5rem',
                                  fontSize: '0.9rem',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {skill}
                              </span>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '0.5rem',
                                }}
                              >
                                <div>
                                  <label
                                    style={{
                                      color: 'var(--color-cloud)',
                                      fontSize: '0.75rem',
                                      display: 'block',
                                      marginBottom: '0.25rem',
                                      opacity: 0.8,
                                    }}
                                  >
                                    Bonus
                                  </label>
                                  <input
                                    type="number"
                                    value={bonus?.add_bonus || 0}
                                    onChange={(e) =>
                                      handleFieldChange('magic', {
                                        ...editedItem.magic,
                                        [skill]: {
                                          ...bonus,
                                          add_bonus: parseInt(e.target.value) || 0,
                                        },
                                      })
                                    }
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      backgroundColor: 'var(--color-dark-surface)',
                                      border: '1px solid var(--color-dark-border)',
                                      borderRadius: '0.25rem',
                                      color: 'var(--color-white)',
                                      fontSize: '0.9rem',
                                    }}
                                  />
                                </div>
                                <div>
                                  <label
                                    style={{
                                      color: 'var(--color-cloud)',
                                      fontSize: '0.75rem',
                                      display: 'block',
                                      marginBottom: '0.25rem',
                                      opacity: 0.8,
                                    }}
                                  >
                                    Talent
                                  </label>
                                  <input
                                    type="number"
                                    value={bonus?.add_talent || 0}
                                    onChange={(e) =>
                                      handleFieldChange('magic', {
                                        ...editedItem.magic,
                                        [skill]: {
                                          ...bonus,
                                          add_talent: parseInt(e.target.value) || 0,
                                        },
                                      })
                                    }
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      backgroundColor: 'var(--color-dark-surface)',
                                      border: '1px solid var(--color-dark-border)',
                                      borderRadius: '0.25rem',
                                      color: 'var(--color-white)',
                                      fontSize: '0.9rem',
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mitigation */}
          {editedItem.mitigation && Object.keys(editedItem.mitigation).length > 0 && (
            <div>
              <SectionHeader title="Damage Mitigation" section="mitigation" />
              {expandedSections.mitigation && (
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}
                >
                  {Object.entries(editedItem.mitigation).map(([type, value]) => (
                    <div
                      key={type}
                      style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                    >
                      <span
                        style={{
                          color: 'var(--color-cloud)',
                          flex: 1,
                          textTransform: 'capitalize',
                        }}
                      >
                        {type}:
                      </span>
                      <input
                        type="number"
                        value={value || 0}
                        onChange={(e) =>
                          handleFieldChange('mitigation', {
                            ...editedItem.mitigation,
                            [type]: parseInt(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: '60px',
                          padding: '0.25rem',
                          backgroundColor: 'var(--color-dark-bg)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                          color: 'var(--color-cloud)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Special Properties */}
          {(editedItem.detections || editedItem.immunities) && (
            <div>
              <SectionHeader title="Special Properties" section="special" />
              {expandedSections.special && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {/* Detections */}
                  {editedItem.detections && Object.keys(editedItem.detections).length > 0 && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '1.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--color-dark-border)',
                      }}
                    >
                      <h4 style={subHeaderStyle}>Detection Abilities</h4>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '0.75rem',
                        }}
                      >
                        {Object.entries(editedItem.detections).map(([type, value]) => (
                          <div
                            key={type}
                            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                          >
                            <span
                              style={{
                                color: 'var(--color-cloud)',
                                flex: 1,
                                textTransform: 'capitalize',
                              }}
                            >
                              {type}:
                            </span>
                            {type.toLowerCase().includes('vision') ||
                            type.toLowerCase().includes('sight') ||
                            type.toLowerCase().includes('range') ? (
                              <select
                                value={value || 0}
                                onChange={(e) =>
                                  handleFieldChange('detections', {
                                    ...editedItem.detections,
                                    [type]: parseInt(e.target.value) || 0,
                                  })
                                }
                                style={{
                                  width: '120px',
                                  padding: '0.25rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                  fontSize: '0.85rem',
                                }}
                              >
                                {rangeOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="number"
                                value={value || 0}
                                onChange={(e) =>
                                  handleFieldChange('detections', {
                                    ...editedItem.detections,
                                    [type]: parseInt(e.target.value) || 0,
                                  })
                                }
                                style={{
                                  width: '60px',
                                  padding: '0.25rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Immunities */}
                  {editedItem.immunities && Object.keys(editedItem.immunities).length > 0 && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '1.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--color-dark-border)',
                      }}
                    >
                      <h4 style={subHeaderStyle}>Condition Immunities</h4>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '0.75rem',
                        }}
                      >
                        {Object.entries(editedItem.immunities).map(([condition, immune]) => (
                          <div
                            key={condition}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              borderRadius: '0.375rem',
                              border: '1px solid var(--color-dark-border)',
                            }}
                          >
                            <span
                              style={{
                                color: 'var(--color-cloud)',
                                textTransform: 'capitalize',
                                fontWeight: '500',
                              }}
                            >
                              {condition}
                            </span>
                            <label
                              style={{
                                position: 'relative',
                                display: 'inline-block',
                                width: '48px',
                                height: '24px',
                                cursor: 'pointer',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={immune as boolean}
                                onChange={(e) =>
                                  handleFieldChange('immunities', {
                                    ...editedItem.immunities,
                                    [condition]: e.target.checked,
                                  })
                                }
                                style={{ display: 'none' }}
                              />
                              <span
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: (immune as boolean)
                                    ? 'var(--color-sat-purple)'
                                    : 'var(--color-dark-border)',
                                  borderRadius: '24px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                                }}
                              >
                                <span
                                  style={{
                                    position: 'absolute',
                                    height: '18px',
                                    width: '18px',
                                    left: (immune as boolean) ? '26px' : '3px',
                                    bottom: '3px',
                                    backgroundColor: 'var(--color-white)',
                                    borderRadius: '50%',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                  }}
                                />
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label
              style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
            >
              Personal Notes
            </label>
            <textarea
              value={inventoryItem.notes || ''}
              onChange={(_e) => {
                // Notes are stored on the inventory item, not the item itself
                // This would need a separate update method
              }}
              placeholder="Add any personal notes about this item..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'var(--color-dark-bg)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.25rem',
                color: 'var(--color-cloud)',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '2px solid var(--color-dark-border)',
          }}
        >
          <div style={{ flex: 1 }}>
            {!inventoryItem.isCustomized && hasChanges && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <p style={{ color: 'var(--color-metal-gold)', margin: 0, fontSize: '0.875rem' }}>
                  <strong>Note:</strong> Saving will create a customized copy
                </p>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-dark-elevated)',
                border: '2px solid var(--color-dark-border)',
                borderRadius: '0.5rem',
                color: 'var(--color-cloud)',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-dark-border)';
                e.currentTarget.style.borderColor = 'var(--color-cloud)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-dark-elevated)';
                e.currentTarget.style.borderColor = 'var(--color-dark-border)';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges && quantity === inventoryItem.quantity}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: hasChanges
                  ? 'var(--color-sat-purple)'
                  : 'var(--color-dark-elevated)',
                border: '2px solid',
                borderColor: hasChanges ? 'var(--color-sat-purple)' : 'var(--color-dark-border)',
                borderRadius: '0.5rem',
                color: 'var(--color-white)',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: hasChanges ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                opacity: hasChanges ? 1 : 0.6,
              }}
              onMouseEnter={(e) => {
                if (hasChanges) {
                  e.currentTarget.style.backgroundColor = 'var(--color-sat-purple-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(138, 116, 192, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (hasChanges) {
                  e.currentTarget.style.backgroundColor = 'var(--color-sat-purple)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {hasChanges ? 'Save Changes' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemEditModal;
