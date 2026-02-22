import React, { useState, useEffect } from 'react';
import { Item, CharacterItem } from '../../../types/character';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ItemHeaderFields from '../../item/ItemHeaderFields';
import ItemBasicFields from '../../item/ItemBasicFields';
import ItemWeaponFields from '../../item/ItemWeaponFields';
import ItemResourceFields from '../../item/ItemResourceFields';
import ItemMitigationFields from '../../item/ItemMitigationFields';
import ItemBonusFields from '../../item/ItemBonusFields';
import ItemDetectionFields from '../../item/ItemDetectionFields';
import ItemRecipeFields from '../../item/ItemRecipeFields';
import ItemImplantFields from '../../item/ItemImplantFields';
import { fieldInputStyle, fieldLabelStyle } from '../../item/itemFormConstants';

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
    recipe: false,
    bonuses: false,
    mitigation: false,
    detectionsImmunities: false,
    implant: false,
  });

  useEffect(() => {
    const item = getItemData();

    // Initialize primary and secondary attack objects for weapons if they don't exist
    if (item.type === 'weapon') {
      if (!item.primary) {
        item.primary = {
          damage: '0',
          damage_extra: '0',
          damage_type: 'physical',
          category: 'slash',
          bonus_attack: 0,
          energy: 0,
          secondary_damage: 0,
          secondary_damage_extra: 0,
          secondary_damage_type: 'none',
          min_range: 1,
          max_range: 1,
        };
      }
      if (!item.secondary) {
        item.secondary = {
          damage: '0',
          damage_extra: '0',
          damage_type: 'physical',
          category: 'slash',
          bonus_attack: 0,
          energy: 0,
          secondary_damage: 0,
          secondary_damage_extra: 0,
          secondary_damage_type: 'none',
          min_range: 1,
          max_range: 1,
        };
      }
    }

    setEditedItem(item);
    setQuantity(inventoryItem.quantity);
    setHasChanges(false);
    // Auto-expand relevant sections based on item type
    setExpandedSections({
      basic: true,
      resources: true,
      weapon: item.type === 'weapon',
      recipe: !!item.recipe?.type,
      bonuses: !!item.basic || !!item.weapon || !!item.magic || !!item.craft || !!item.attributes,
      mitigation: !!item.mitigation && Object.keys(item.mitigation).length > 0,
      detectionsImmunities:
        (!!item.detections && Object.keys(item.detections).length > 0) ||
        (!!item.immunities && Object.keys(item.immunities).length > 0),
      implant: item.type === 'implant',
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

  const sectionContentStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-dark-elevated)',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--color-dark-border)',
  };

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

        {/* Always-visible header: Name, Type, Category */}
        <div style={{ ...sectionContentStyle, marginBottom: '1rem' }}>
          <ItemHeaderFields item={editedItem} onChange={handleFieldChange} />
        </div>

        {/* Form Content */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Basic Information */}
          <div>
            <SectionHeader title="Basic Information" section="basic" />
            {expandedSections.basic && (
              <div style={sectionContentStyle}>
                {/* Quantity (inventory-specific, not in shared component) */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={fieldLabelStyle}>Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    min="1"
                    style={{ ...fieldInputStyle, maxWidth: '120px' }}
                  />
                </div>
                <ItemBasicFields item={editedItem} onChange={handleFieldChange} />
              </div>
            )}
          </div>

          {/* Resource Bonuses */}
          <div>
            <SectionHeader title="Resource Bonuses" section="resources" />
            {expandedSections.resources && (
              <div style={sectionContentStyle}>
                <ItemResourceFields item={editedItem} onChange={handleFieldChange} />
              </div>
            )}
          </div>

          {/* Weapon Properties */}
          {editedItem.type === 'weapon' && (
            <div>
              <SectionHeader title="Weapon Properties" section="weapon" />
              {expandedSections.weapon && (
                <div style={sectionContentStyle}>
                  <ItemWeaponFields item={editedItem} onChange={handleFieldChange} />
                </div>
              )}
            </div>
          )}

          {/* Recipe */}
          <div>
            <SectionHeader title="Recipe" section="recipe" />
            {expandedSections.recipe && (
              <div style={sectionContentStyle}>
                <ItemRecipeFields item={editedItem} onChange={handleFieldChange} />
              </div>
            )}
          </div>

          {/* Bonuses & Modifiers */}
          {(editedItem.basic ||
            editedItem.weapon ||
            editedItem.magic ||
            editedItem.craft ||
            editedItem.attributes) && (
            <div>
              <SectionHeader title="Bonuses & Modifiers" section="bonuses" />
              {expandedSections.bonuses && (
                <div style={sectionContentStyle}>
                  <ItemBonusFields item={editedItem} onChange={handleFieldChange} />
                </div>
              )}
            </div>
          )}

          {/* Damage Mitigation */}
          {editedItem.mitigation && Object.keys(editedItem.mitigation).length > 0 && (
            <div>
              <SectionHeader title="Damage Mitigation" section="mitigation" />
              {expandedSections.mitigation && (
                <div style={sectionContentStyle}>
                  <ItemMitigationFields item={editedItem} onChange={handleFieldChange} />
                </div>
              )}
            </div>
          )}

          {/* Detections & Immunities */}
          {((editedItem.detections && Object.keys(editedItem.detections).length > 0) ||
            (editedItem.immunities && Object.keys(editedItem.immunities).length > 0)) && (
            <div>
              <SectionHeader title="Detections & Immunities" section="detectionsImmunities" />
              {expandedSections.detectionsImmunities && (
                <div style={sectionContentStyle}>
                  <ItemDetectionFields item={editedItem} onChange={handleFieldChange} />
                </div>
              )}
            </div>
          )}

          {/* Implant Data */}
          {editedItem.type === 'implant' && (
            <div>
              <SectionHeader title="Implant Data" section="implant" />
              {expandedSections.implant && (
                <div style={sectionContentStyle}>
                  <ItemImplantFields item={editedItem} onChange={handleFieldChange} />
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={fieldLabelStyle}>Personal Notes</label>
            <textarea
              value={inventoryItem.notes || ''}
              onChange={(_e) => {
                // Notes are stored on the inventory item, not the item itself
                // This would need a separate update method
              }}
              placeholder="Add any personal notes about this item..."
              rows={3}
              style={{
                ...fieldInputStyle,
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
