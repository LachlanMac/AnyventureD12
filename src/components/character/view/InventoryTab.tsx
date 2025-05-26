import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character, Item, CharacterItem, Equipment } from '../../../types/character';
import ItemEditModal from './ItemEditModal';

interface InventoryTabProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

interface EquipmentSlotProps {
  slotName: string;
  slotLabel: string;
  equippedItem: Item | null;
  onEquip: (itemId: string, slotName: string) => void;
  onUnequip: (slotName: string) => void;
  allowedTypes?: string[];
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({
  slotName,
  slotLabel,
  equippedItem,
  onEquip,
  onUnequip,
  allowedTypes = [],
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      onEquip(itemId, slotName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="equipment-slot"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        width: '80px',
        height: '80px',
        border: '2px dashed var(--color-dark-border)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: equippedItem ? 'var(--color-dark-bg)' : 'transparent',
        cursor: 'pointer',
        position: 'relative',
        margin: '4px',
      }}
    >
      <div style={{ fontSize: '0.75rem', color: 'var(--color-cloud)', textAlign: 'center' }}>
        {slotLabel}
      </div>
      {equippedItem ? (
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-dark-bg)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onClick={() => onUnequip(slotName)}
          title={`${equippedItem.name} (Click to unequip)`}
        >
          <span
            style={{ fontSize: '0.75rem', color: 'var(--color-metal-gold)', textAlign: 'center' }}
          >
            {equippedItem.name.substring(0, 8)}
          </span>
        </div>
      ) : null}
    </div>
  );
};

interface InventoryItemProps {
  item: Item;
  inventoryItem: CharacterItem;
  inventoryIndex: number;
  onRemove: (index: number) => void;
  onEquip: (itemId: string, slotName: string) => void;
  onEdit: (index: number) => void;
  isCustomized: boolean;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  item,
  inventoryItem,
  inventoryIndex,
  onRemove,
  onEquip,
  onEdit,
  isCustomized,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', item._id || inventoryIndex.toString());
  };

  const handleDoubleClick = () => {
    // Auto-equip to appropriate slot
    let targetSlot = '';
    if (item.type === 'weapon') {
      targetSlot = 'weapon1'; // Try first weapon slot
    } else if (item.slot) {
      targetSlot = item.slot === 'accessory' ? 'accessory1' : item.slot;
    }

    if (targetSlot) {
      onEquip(item._id || inventoryIndex.toString(), targetSlot);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      style={{
        padding: '0.75rem',
        backgroundColor: 'var(--color-dark-bg)',
        border: '1px solid var(--color-dark-border)',
        borderRadius: '8px',
        margin: '0.5rem 0',
        cursor: 'grab',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      title="Drag to equipment slot or double-click to auto-equip"
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
        </div>
        <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
          {item.type} - {item.rarity}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
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
  const [equippedItems, setEquippedItems] = useState<Record<string, Item>>({});
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<{ index: number; item: CharacterItem } | null>(
    null
  );

  // Helper function to get item data from hybrid inventory item
  const getItemFromInventory = (invItem: CharacterItem): Item | null => {
    if (invItem.isCustomized && invItem.itemData) {
      return invItem.itemData;
    } else if (invItem.itemId && typeof invItem.itemId === 'object') {
      return invItem.itemId as Item;
    }
    return null;
  };

  // Fetch equipped items
  useEffect(() => {
    const fetchEquippedItems = async () => {
      try {
        const equipped: Record<string, Item> = {};

        for (const [slotName, slot] of Object.entries(character.equipment || {})) {
          if (slot.itemId) {
            // Find the item in inventory
            const invItem = character.inventory?.find((inv) => {
              const item = getItemFromInventory(inv);
              return item && item._id === slot.itemId;
            });

            if (invItem) {
              const item = getItemFromInventory(invItem);
              if (item) {
                equipped[slotName] = item;
              }
            }
          }
        }

        setEquippedItems(equipped);
      } catch (error) {
        console.error('Error processing equipped items:', error);
      }
    };

    fetchEquippedItems();
  }, [character.inventory, character.equipment]);

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

  const handleEquipItem = async (itemIdentifier: string, slotName: string) => {
    try {
      // itemIdentifier could be an item ID or an inventory index
      const inventoryIndex = parseInt(itemIdentifier);
      let itemId: string;

      if (!isNaN(inventoryIndex)) {
        // It's an inventory index
        const invItem = character.inventory[inventoryIndex];
        const item = getItemFromInventory(invItem);
        itemId = item?._id || '';
      } else {
        // It's an item ID
        itemId = itemIdentifier;
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

  // Filter inventory items
  const filteredInventory =
    character.inventory?.filter((invItem, index) => {
      const item = getItemFromInventory(invItem);
      if (!item) return false;

      const matchesName = item.name.toLowerCase().includes(filter.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

      return matchesName && matchesType;
    }) || [];

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
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
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filteredInventory.length === 0 ? (
              <div style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem' }}>
                No items in inventory. Click "Add Item" to browse items.
              </div>
            ) : (
              character.inventory?.map((invItem, index) => {
                const item = getItemFromInventory(invItem);
                if (!item) return null;

                // Check if item matches filters
                const matchesName = item.name.toLowerCase().includes(filter.toLowerCase());
                const matchesType = typeFilter === 'all' || item.type === typeFilter;
                if (!matchesName || !matchesType) return null;

                return (
                  <InventoryItem
                    key={index}
                    item={item}
                    inventoryItem={invItem}
                    inventoryIndex={index}
                    onRemove={handleRemoveItem}
                    onEquip={handleEquipItem}
                    onEdit={handleEditItem}
                    isCustomized={invItem.isCustomized}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Equipment Section (Paperdoll) */}
        <div>
          <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '1rem' }}>Equipment</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              justifyItems: 'center',
            }}
          >
            {/* Row 1 */}
            <div></div>
            <EquipmentSlot
              slotName="head"
              slotLabel="Head"
              equippedItem={equippedItems.head || null}
              onEquip={handleEquipItem}
              onUnequip={handleUnequipItem}
            />
            <div></div>

            {/* Row 2 */}
            <EquipmentSlot
              slotName="hands"
              slotLabel="Hands"
              equippedItem={equippedItems.hands || null}
              onEquip={handleEquipItem}
              onUnequip={handleUnequipItem}
            />
            <EquipmentSlot
              slotName="body"
              slotLabel="Body"
              equippedItem={equippedItems.body || null}
              onEquip={handleEquipItem}
              onUnequip={handleUnequipItem}
            />
            <EquipmentSlot
              slotName="cloak"
              slotLabel="Cloak"
              equippedItem={equippedItems.cloak || null}
              onEquip={handleEquipItem}
              onUnequip={handleUnequipItem}
            />

            {/* Row 3 */}
            <EquipmentSlot
              slotName="accessory1"
              slotLabel="Ring 1"
              equippedItem={equippedItems.accessory1 || null}
              onEquip={handleEquipItem}
              onUnequip={handleUnequipItem}
            />
            <EquipmentSlot
              slotName="feet"
              slotLabel="Feet"
              equippedItem={equippedItems.feet || null}
              onEquip={handleEquipItem}
              onUnequip={handleUnequipItem}
            />
            <EquipmentSlot
              slotName="accessory2"
              slotLabel="Ring 2"
              equippedItem={equippedItems.accessory2 || null}
              onEquip={handleEquipItem}
              onUnequip={handleUnequipItem}
            />
          </div>

          {/* Weapon Slots */}
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ color: 'var(--color-metal-gold)', marginBottom: '1rem' }}>Weapon Slots</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <EquipmentSlot
                slotName="weapon1"
                slotLabel="Weapon 1"
                equippedItem={equippedItems.weapon1 || null}
                onEquip={handleEquipItem}
                onUnequip={handleUnequipItem}
              />
              <EquipmentSlot
                slotName="weapon2"
                slotLabel="Weapon 2"
                equippedItem={equippedItems.weapon2 || null}
                onEquip={handleEquipItem}
                onUnequip={handleUnequipItem}
              />
              <EquipmentSlot
                slotName="weapon3"
                slotLabel="Weapon 3"
                equippedItem={equippedItems.weapon3 || null}
                onEquip={handleEquipItem}
                onUnequip={handleUnequipItem}
              />
              <EquipmentSlot
                slotName="weapon4"
                slotLabel="Weapon 4"
                equippedItem={equippedItems.weapon4 || null}
                onEquip={handleEquipItem}
                onUnequip={handleUnequipItem}
              />
            </div>
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
