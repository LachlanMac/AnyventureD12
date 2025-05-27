import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character, Item, CharacterItem } from '../../../types/character';
import ItemEditModal from './ItemEditModal';

interface InventoryTabProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}


interface InventoryItemProps {
  item: Item;
  inventoryItem: CharacterItem;
  inventoryIndex: number;
  onRemove: (index: number) => void;
  onEquip: (itemId: string, slotName: string) => void;
  onUnequip: (slotName: string) => void;
  onEdit: (index: number) => void;
  isCustomized: boolean;
  isEquipped: boolean;
  equippedSlot?: string;
  canEquip: boolean;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  item,
  inventoryItem,
  inventoryIndex,
  onRemove,
  onEquip,
  onUnequip,
  onEdit,
  isCustomized,
  isEquipped,
  equippedSlot,
  canEquip,
}) => {
  const getAvailableSlot = (): string | null => {
    // Map item types to equipment slots
    const typeToSlotMap: Record<string, string[]> = {
      weapon: ['weapon1', 'weapon2', 'weapon3', 'weapon4'],
      headwear: ['head'],
      body: ['body'],
      cloak: ['cloak'],
      boots: ['feet'],
      gloves: ['hands'],
      shield: ['shield'],
      accessory: ['accessory1', 'accessory2', 'accessory3', 'accessory4'],
    };

    const availableSlots = typeToSlotMap[item.type];
    if (!availableSlots) return null;

    // For weapons and accessories, unlimited equipping is allowed
    if (item.type === 'weapon') {
      return 'weapon1'; // Backend will handle finding next available slot
    }
    if (item.type === 'accessory') {
      return 'accessory1'; // Backend will handle finding next available slot
    }

    // For other gear, only one can be equipped
    return availableSlots[0];
  };

  const handleEquip = () => {
    const slot = getAvailableSlot();
    if (slot && item._id) {
      onEquip(item._id, slot);
    }
  };

  const handleUnequip = () => {
    if (equippedSlot) {
      onUnequip(equippedSlot);
    }
  };

  return (
    <div
      style={{
        padding: '0.75rem',
        backgroundColor: isEquipped ? 'var(--color-sat-purple-faded)' : 'var(--color-dark-bg)',
        border: isEquipped 
          ? '2px solid var(--color-metal-gold)' 
          : '1px solid var(--color-dark-border)',
        borderRadius: '8px',
        margin: '0.5rem 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--color-cloud)', fontWeight: 'bold' }}>{item.name}</span>
          {inventoryItem.quantity > 1 && (
            <span style={{ color: 'var(--color-metal-gold)', fontWeight: 'bold' }}>
              x{inventoryItem.quantity}
            </span>
          )}
          {isCustomized && (
            <span
              style={{
                color: 'var(--color-sat-purple)',
                fontSize: '0.75rem',
                backgroundColor: 'var(--color-sat-purple-faded)',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              Customized
            </span>
          )}
          {isEquipped && (
            <span
              style={{
                color: 'var(--color-metal-gold)',
                fontSize: '0.75rem',
                backgroundColor: 'var(--color-dark-bg)',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}
            >
              Equipped
            </span>
          )}
        </div>
        <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
          {item.type} - {item.rarity}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {canEquip && (
          <button
            onClick={isEquipped ? handleUnequip : handleEquip}
            style={{
              backgroundColor: isEquipped ? 'var(--color-destructive)' : 'var(--color-metal-gold)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}
          >
            {isEquipped ? 'Unequip' : 'Equip'}
          </button>
        )}
        <button
          onClick={() => onEdit(inventoryIndex)}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onRemove(inventoryIndex)}
          style={{
            backgroundColor: 'var(--color-destructive)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

const InventoryTab: React.FC<InventoryTabProps> = ({ character, onCharacterUpdate }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<{ index: number; item: CharacterItem } | null>(
    null
  );

  // Helper function to get item data from hybrid inventory item
  const getItemFromInventory = (invItem: CharacterItem | undefined): Item | null => {
    if (!invItem) return null;
    if (invItem.isCustomized && invItem.itemData) {
      return invItem.itemData;
    } else if (invItem.itemId && typeof invItem.itemId === 'object') {
      return invItem.itemId as Item;
    }
    return null;
  };

  const handleAddItem = () => {
    navigate(`/character/${character._id}/items`);
  };

  const handleRemoveItem = async (inventoryIndex: number) => {
    try {
      const invItem = character.inventory[inventoryIndex];
      if (!invItem) return;

      // For now, remove the entire quantity
      // You could add a modal to ask how many to remove
      const response = await fetch(
        `/api/characters/${character._id}/inventory/${inventoryIndex}/quantity`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: 0 }),
          credentials: 'include',
        }
      );

      if (response.ok) {
        const updatedCharacter = await response.json();
        onCharacterUpdate(updatedCharacter);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleEquipItem = async (itemId: string, slotName: string) => {
    try {
      if (!itemId) {
        console.error('No item ID provided for equipping');
        return;
      }

      const response = await fetch(`/api/characters/${character._id}/equipment/${slotName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
        credentials: 'include',
      });

      if (response.ok) {
        const updatedCharacter = await response.json();
        onCharacterUpdate(updatedCharacter);
      } else {
        console.error('Failed to equip item:', response.statusText);
      }
    } catch (error) {
      console.error('Error equipping item:', error);
    }
  };

  const handleUnequipItem = async (slotName: string) => {
    try {
      const response = await fetch(`/api/characters/${character._id}/equipment/${slotName}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const updatedCharacter = await response.json();
        onCharacterUpdate(updatedCharacter);
      }
    } catch (error) {
      console.error('Error unequipping item:', error);
    }
  };

  const handleEditItem = (index: number) => {
    const invItem = character.inventory[index];
    if (invItem) {
      setEditingItem({ index, item: invItem });
    }
  };

  const handleSaveItem = async (index: number, modifications: Partial<Item>, quantity: number) => {
    try {
      const response = await fetch(
        `/api/characters/${character._id}/inventory/${index}/customize`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modifications }),
          credentials: 'include',
        }
      );

      if (response.ok) {
        const updatedCharacter = await response.json();
        onCharacterUpdate(updatedCharacter);
      }
    } catch (error) {
      console.error('Error customizing item:', error);
    }
  };

  const handleUpdateQuantity = async (index: number, quantity: number) => {
    try {
      const response = await fetch(`/api/characters/${character._id}/inventory/${index}/quantity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
        credentials: 'include',
      });

      if (response.ok) {
        const updatedCharacter = await response.json();
        onCharacterUpdate(updatedCharacter);
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
    }
  };

  // Helper function to check if an item is equipped
  const isItemEquipped = (item: Item): { equipped: boolean; slot?: string } => {
    if (!character.equipment) return { equipped: false };
    
    for (const [slotName, slot] of Object.entries(character.equipment)) {
      if (slot.itemId === item._id) {
        return { equipped: true, slot: slotName };
      }
    }
    return { equipped: false };
  };

  // Helper function to check if an item can be equipped
  const canItemBeEquipped = (item: Item): boolean => {
    const equipableTypes = [
      'weapon', 'headwear', 'body', 'cloak', 'boots', 'gloves', 'shield', 'accessory'
    ];
    return equipableTypes.includes(item.type);
  };

  // Filter and sort inventory items
  const filteredInventory =
    character.inventory?.filter((invItem, index) => {
      const item = getItemFromInventory(invItem);
      if (!item) return false;

      const matchesName = item.name.toLowerCase().includes(filter.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

      return matchesName && matchesType;
    }) || [];

  // Sort inventory: equipped items first, then by name
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    const itemA = getItemFromInventory(a);
    const itemB = getItemFromInventory(b);
    if (!itemA || !itemB) return 0;

    const equippedA = isItemEquipped(itemA);
    const equippedB = isItemEquipped(itemB);

    // Equipped items first
    if (equippedA.equipped && !equippedB.equipped) return -1;
    if (!equippedA.equipped && equippedB.equipped) return 1;

    // Then sort by name
    return itemA.name.localeCompare(itemB.name);
  });

  return (
    <div style={{ padding: '1rem' }}>
      {/* Single column layout - just inventory */}
      <div>
        {/* Inventory Section */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Inventory</h3>
            <button
              onClick={handleAddItem}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Add Item
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search items..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: 'var(--color-dark-bg)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '6px',
                color: 'var(--color-cloud)',
              }}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '0.5rem',
                backgroundColor: 'var(--color-dark-bg)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '6px',
                color: 'var(--color-cloud)',
              }}
            >
              <option value="all">All Types</option>
              <option value="weapon">Weapons</option>
              <option value="gear">Gear</option>
              <option value="shield">Shields</option>
              <option value="consumable">Consumables</option>
            </select>
          </div>

          {/* Inventory Items */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {sortedInventory.length === 0 ? (
              <div style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem' }}>
                No items in inventory. Click "Add Item" to browse items.
              </div>
            ) : (
              sortedInventory.map((invItem, sortedIndex) => {
                const item = getItemFromInventory(invItem);
                if (!item) return null;

                // Find the original index in the character's inventory
                const originalIndex = character.inventory?.findIndex(
                  (originalInvItem) => originalInvItem === invItem
                ) ?? -1;

                if (originalIndex === -1) {
                  console.warn('Could not find original index for inventory item');
                  return null;
                }

                const equipmentStatus = isItemEquipped(item);
                const canEquip = canItemBeEquipped(item);

                return (
                  <InventoryItem
                    key={`${originalIndex}-${item._id}`}
                    item={item}
                    inventoryItem={invItem}
                    inventoryIndex={originalIndex}
                    onRemove={handleRemoveItem}
                    onEquip={handleEquipItem}
                    onUnequip={handleUnequipItem}
                    onEdit={handleEditItem}
                    isCustomized={invItem.isCustomized}
                    isEquipped={equipmentStatus.equipped}
                    equippedSlot={equipmentStatus.slot}
                    canEquip={canEquip}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <ItemEditModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          inventoryItem={editingItem.item}
          inventoryIndex={editingItem.index}
          onSave={handleSaveItem}
          onUpdateQuantity={handleUpdateQuantity}
        />
      )}
    </div>
  );
};

export default InventoryTab;
