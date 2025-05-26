import React, { useState, useEffect } from 'react';
import { Item, CharacterItem } from '../../../types/character';
import Button from '../../ui/Button';
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

  const handleNestedFieldChange = (parent: string, field: string, value: any) => {
    setEditedItem((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof Item] as any),
        [field]: value,
      },
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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SectionHeader: React.FC<{ title: string; section: string }> = ({ title, section }) => (
    <div
      onClick={() => toggleSection(section)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        color: 'var(--color-metal-gold)',
        marginBottom: expandedSections[section] ? '1rem' : '0',
        padding: '0.5rem 0',
        borderBottom: '1px solid var(--color-dark-border)',
        userSelect: 'none',
      }}
    >
      {expandedSections[section] ? (
        <ChevronDown size={16} />
      ) : (
        <ChevronRight size={16} />
      )}
      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>
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
          border: '1px solid var(--color-dark-border)',
          borderRadius: '0.5rem',
          padding: '2rem',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            borderBottom: '2px solid var(--color-metal-gold)',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>
              {editedItem.name || 'Edit Item'}
            </h2>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              {inventoryItem.isCustomized && (
                <span style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                  ✨ Customized
                </span>
              )}
              {editedItem.rarity && (
                <span
                  style={{
                    color:
                      editedItem.rarity === 'legendary'
                        ? '#ff6b1a'
                        : editedItem.rarity === 'epic'
                        ? '#9b59b6'
                        : editedItem.rarity === 'rare'
                        ? '#3498db'
                        : editedItem.rarity === 'uncommon'
                        ? '#2ecc71'
                        : 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {editedItem.rarity}
                </span>
              )}
              {editedItem.type && (
                <span style={{ color: 'var(--color-cloud)', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                  {editedItem.type}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-cloud)',
              cursor: 'pointer',
              fontSize: '1.5rem',
              padding: '0.25rem',
              borderRadius: '0.25rem',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label
                  style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={editedItem.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
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
                  style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
                >
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  min="1"
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
            {expandedSections.basic && (
            <div style={{ marginTop: '1rem' }}>
              <label
                style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
              >
                Description
              </label>
              <textarea
                value={editedItem.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
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
            )}
            {expandedSections.basic && (
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
                  style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
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
                  style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
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
                  style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
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
                  <option value="gear">Gear</option>
                  <option value="shield">Shield</option>
                  <option value="consumable">Consumable</option>
                  <option value="container">Container</option>
                  <option value="currency">Currency</option>
                </select>
              </div>

              <div>
                <label
                  style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
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
            )}
          </div>

          {/* Resource Bonuses */}
          <div>
            <SectionHeader title="Resource Bonuses" section="resources" />
            {expandedSections.resources && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div>
                <label
                  style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
                >
                  Health
                </label>
                <input
                  type="number"
                  value={editedItem.health?.max || 0}
                  onChange={(e) => handleFieldChange('health', { 
                    ...editedItem.health, 
                    max: parseInt(e.target.value) || 0 
                  })}
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
                  style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
                >
                  Energy
                </label>
                <input
                  type="number"
                  value={editedItem.energy?.max || 0}
                  onChange={(e) => handleFieldChange('energy', { 
                    ...editedItem.energy, 
                    max: parseInt(e.target.value) || 0 
                  })}
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
                  style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
                >
                  Resolve
                </label>
                <input
                  type="number"
                  value={editedItem.resolve?.max || 0}
                  onChange={(e) => handleFieldChange('resolve', { 
                    ...editedItem.resolve, 
                    max: parseInt(e.target.value) || 0 
                  })}
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
                  style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem' }}
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

                {/* Primary Attack */}
                {editedItem.primary && (
                  <div>
                    <h4 style={{ color: 'var(--color-cloud)', marginTop: '1rem', marginBottom: '0.5rem' }}>
                      Primary Attack
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      <div>
                        <label style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
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
                        <label style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
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
                        <label style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
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
                          <option value="lightning">Lightning</option>
                          <option value="dark">Dark</option>
                          <option value="divine">Divine</option>
                          <option value="arcane">Arcane</option>
                          <option value="psychic">Psychic</option>
                          <option value="toxic">Toxic</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
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
                        <label style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                          Min Range
                        </label>
                        <input
                          type="number"
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
                        />
                      </div>
                      <div>
                        <label style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                          Max Range
                        </label>
                        <input
                          type="number"
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
                        />
                      </div>
                    </div>
                    
                    {/* Secondary damage if exists */}
                    {(editedItem.primary?.secondary_damage || editedItem.primary?.secondary_damage_type) && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <label style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                          Secondary Damage
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
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
                            <option value="lightning">Lightning</option>
                            <option value="dark">Dark</option>
                            <option value="divine">Divine</option>
                            <option value="arcane">Arcane</option>
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
                  <div>
                    <h4 style={{ color: 'var(--color-cloud)', marginTop: '1rem', marginBottom: '0.5rem' }}>
                      Secondary Attack
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      <div>
                        <label style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
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
                        <label style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
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
                        <label style={{ color: 'var(--color-cloud)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
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
                          <option value="lightning">Lightning</option>
                          <option value="dark">Dark</option>
                          <option value="divine">Divine</option>
                          <option value="arcane">Arcane</option>
                          <option value="psychic">Psychic</option>
                          <option value="toxic">Toxic</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          )}

          {/* Skill/Talent Bonuses */}
          {(editedItem.basic || editedItem.weapon || editedItem.magic || editedItem.craft || editedItem.attributes) && (
            <div>
              <SectionHeader title="Bonuses & Modifiers" section="bonuses" />
              {expandedSections.bonuses && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {/* Attribute Bonuses */}
                  {editedItem.attributes && Object.keys(editedItem.attributes).length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>Attribute Bonuses</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {Object.entries(editedItem.attributes).map(([attr, bonus]) => (
                          <div key={attr} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--color-cloud)', flex: 1, textTransform: 'capitalize' }}>
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
                    </div>
                  )}

                  {/* Basic Skill Bonuses */}
                  {editedItem.basic && Object.keys(editedItem.basic).length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>Basic Skill Bonuses</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {Object.entries(editedItem.basic).map(([skill, bonus]) => (
                          <div key={skill} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--color-cloud)', flex: 1, textTransform: 'capitalize' }}>
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
                    </div>
                  )}

                  {/* Weapon Skill Bonuses */}
                  {editedItem.weapon && Object.keys(editedItem.weapon).length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>Weapon Skill Bonuses</h4>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {Object.entries(editedItem.weapon).map(([skill, bonus]) => (
                          <div key={skill}>
                            <span style={{ color: 'var(--color-cloud)', textTransform: 'capitalize', display: 'block', marginBottom: '0.25rem' }}>
                              {skill.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
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
                                placeholder="+Bonus"
                                style={{
                                  width: '100%',
                                  padding: '0.25rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                }}
                              />
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
                                placeholder="+Talent"
                                style={{
                                  width: '100%',
                                  padding: '0.25rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Magic Skill Bonuses */}
                  {editedItem.magic && Object.keys(editedItem.magic).length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>Magic Skill Bonuses</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {Object.entries(editedItem.magic).map(([skill, bonus]) => (
                          <div key={skill} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--color-cloud)', flex: 1, textTransform: 'capitalize' }}>
                              {skill}:
                            </span>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {Object.entries(editedItem.mitigation).map(([type, value]) => (
                    <div key={type} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-cloud)', flex: 1, textTransform: 'capitalize' }}>
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
                    <div>
                      <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>Detection Abilities</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {Object.entries(editedItem.detections).map(([type, value]) => (
                          <div key={type} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--color-cloud)', flex: 1, textTransform: 'capitalize' }}>
                              {type}:
                            </span>
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Immunities */}
                  {editedItem.immunities && Object.keys(editedItem.immunities).length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>Condition Immunities</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {Object.entries(editedItem.immunities).map(([condition, immune]) => (
                          <div key={condition} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={immune as boolean}
                                onChange={(e) =>
                                  handleFieldChange('immunities', {
                                    ...editedItem.immunities,
                                    [condition]: e.target.checked,
                                  })
                                }
                                style={{ cursor: 'pointer' }}
                              />
                              <span style={{ color: 'var(--color-cloud)', textTransform: 'capitalize' }}>
                                {condition}
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
              onChange={(e) => {
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
          style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}
        >
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges && quantity === inventoryItem.quantity}
          >
            {hasChanges ? 'Save Changes' : 'Close'}
          </Button>
        </div>

        {!inventoryItem.isCustomized && hasChanges && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: 'var(--color-dark-bg)',
              borderRadius: '0.25rem',
              border: '1px solid var(--color-metal-gold)',
            }}
          >
            <p style={{ color: 'var(--color-cloud)', margin: 0, fontSize: '0.875rem' }}>
              <strong style={{ color: 'var(--color-metal-gold)' }}>Note:</strong> Saving changes
              will create a customized copy of this item. The original item template will remain
              unchanged.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemEditModal;