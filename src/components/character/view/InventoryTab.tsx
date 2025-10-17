import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character, Item, CharacterItem } from '../../../types/character';
import ItemEditModal from './ItemEditModal';
import CurrencyModal from './CurrencyModal';
import { useToast } from '../../../context/ToastContext';

interface InventoryTabProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

interface InventoryItemProps {
  item: Item;
  inventoryItem: CharacterItem;
  inventoryIndex: number;
  character: Character;
  onRemove: (index: number) => void;
  onEquip: (itemId: string, slotName: string) => void;
  onUnequip: (slotName: string) => void;
  onEdit: (index: number) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  isCustomized: boolean;
  isEquipped: boolean;
  equippedSlot?: string;
  canEquip: boolean;
  showError: (message: string) => void;
}

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

const InventoryItem: React.FC<InventoryItemProps> = ({
  item,
  inventoryItem,
  inventoryIndex,
  character,
  onRemove,
  onEquip,
  onUnequip,
  onEdit,
  onQuantityChange,
  isCustomized,
  isEquipped,
  equippedSlot,
  canEquip,
  showError,
}) => {
  const getAvailableSlots = (): string[] => {
    // Equipment types that have dedicated slots
    const equipmentTypeToSlotMap: Record<string, string[]> = {
      weapon: ['mainhand', 'offhand', 'extra1', 'extra2', 'extra3'],
      headwear: ['head'],
      body: ['body'],
      cloak: ['back'],
      boots: ['boots'],
      gloves: ['hand'],
      shield: ['offhand'],
      accessory: ['accessory1', 'accessory2'],
      ammunition: ['mainhand', 'offhand', 'extra1', 'extra2', 'extra3'], // Can be held
    };

    // Determine potential slots based on item type
    let potentialSlots: string[] = [];

    if (equipmentTypeToSlotMap[item.type]) {
      potentialSlots = equipmentTypeToSlotMap[item.type];
    } else {
      // For non-equipment items, check if they're holdable
      const isNonEquipment = ['trade_good', 'consumable', 'tool', 'instrument', 'adventure'].includes(item.type);
      if (isNonEquipment && item.holdable) {
        potentialSlots = ['mainhand', 'offhand', 'extra1', 'extra2', 'extra3'];
      } else {
        return []; // Not equippable
      }
    }

    if (!potentialSlots.length) return [];

    // Check if there's a two-handed weapon equipped in mainhand
    const mainhandSlot = character.equipment?.mainhand;
    let mainhandItem: Item | null = null;
    if (mainhandSlot?.itemId) {
      // Find the equipped item in inventory to check its hands requirement
      const equippedInvItem = character.inventory?.find(invItem => {
        const invItemData = getItemFromInventory(invItem);
        return invItemData?._id === mainhandSlot.itemId;
      });
      mainhandItem = getItemFromInventory(equippedInvItem);
    }

    const isTwoHandedEquipped = mainhandItem?.hands === 2;

    // Filter to only show truly available slots
    return potentialSlots.filter(slotName => {
      const slot = character.equipment?.[slotName as keyof typeof character.equipment];

      // Slot must be empty
      if (slot?.itemId) return false;

      // Two-handed weapons can ONLY go in mainhand
      if (item.hands === 2 && slotName !== 'mainhand') {
        return false;
      }

      // If we're trying to equip a two-handed weapon in mainhand, offhand must be empty
      if (item.hands === 2 && slotName === 'mainhand') {
        const offhandSlot = character.equipment?.offhand;
        if (offhandSlot?.itemId) return false;
      }

      // If a two-handed weapon is equipped, offhand is not available (but extra slots still are)
      if (isTwoHandedEquipped && slotName === 'offhand') {
        return false;
      }

      // Complex weapons in extra slots require WEAPON_COLLECTOR trait
      if (item.type === 'weapon' && ['extra1', 'extra2', 'extra3'].includes(slotName)) {
        const isComplexWeapon = item.weapon_category === 'complexMelee' ||
                               item.weapon_category === 'complexRanged';

        if (isComplexWeapon && !character.conditionals?.flags?.WEAPON_COLLECTOR) {
          return false;
        }
      }

      // Shields can only go in offhand and not with two-handed weapons
      if (item.type === 'shield') {
        if (slotName !== 'offhand') return false;
        if (isTwoHandedEquipped && !character.conditionals?.flags?.PASSIVE_SHELL) return false;
      }

      // Holdable items cannot be equipped in offhand when a two-handed weapon is equipped
      const isNonEquipment = ['trade_good', 'consumable', 'tool', 'instrument', 'adventure'].includes(item.type);
      if (isNonEquipment && item.holdable && slotName === 'offhand' && isTwoHandedEquipped) {
        return false;
      }

      return true;
    });
  };

  // const getFirstAvailableSlot = (): string | null => {
  //   const availableSlots = getAvailableSlots();
  //   return availableSlots.length > 0 ? availableSlots[0] : null;
  // };

  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [showSlotSelector, setShowSlotSelector] = useState(false);

  const getSlotDisplayName = (slotName: string): string => {
    const slotDisplayMap: Record<string, string> = {
      mainhand: 'Main Hand',
      offhand: 'Off Hand',
      extra1: 'Extra 1',
      extra2: 'Extra 2',
      extra3: 'Extra 3',
      accessory1: 'Accessory 1',
      accessory2: 'Accessory 2'
    };
    return slotDisplayMap[slotName] || slotName;
  };

  // const getAllPotentialSlots = (): string[] => {
  //   // Equipment types that have dedicated slots
  //   const equipmentTypeToSlotMap: Record<string, string[]> = {
  //     weapon: ['mainhand', 'offhand', 'extra1', 'extra2', 'extra3'],
  //     headwear: ['head'],
  //     body: ['body'],
  //     cloak: ['back'],
  //     boots: ['boots'],
  //     gloves: ['hand'],
  //     shield: ['offhand'],
  //     accessory: ['accessory1', 'accessory2'],
  //     ammunition: ['mainhand', 'offhand', 'extra1', 'extra2', 'extra3'],
  //   };

  //   if (equipmentTypeToSlotMap[item.type]) {
  //     return equipmentTypeToSlotMap[item.type];
  //   } else {
  //     // For non-equipment items, check if they're holdable
  //     const isNonEquipment = ['trade_good', 'consumable', 'tool', 'instrument', 'adventure'].includes(item.type);
  //     if (isNonEquipment && item.holdable) {
  //       return ['mainhand', 'offhand', 'extra1', 'extra2', 'extra3'];
  //     }
  //   }

  //   return [];
  // };

  const handleEquip = () => {
    const availableSlots = getAvailableSlots();

    // If only one slot available, equip directly
    if (availableSlots.length === 1) {
      onEquip(inventoryIndex.toString(), availableSlots[0]);
      return;
    }

    // If multiple slots available, show selector
    if (availableSlots.length > 1) {
      setSelectedSlot(availableSlots[0]);
      setShowSlotSelector(true);
      return;
    }

    // No valid slots available - show toast message
    if (availableSlots.length === 0) {
      showError('There are no valid slots to equip that item');
      return;
    }
  };

  const handleSlotConfirm = () => {
    if (selectedSlot) {
      onEquip(inventoryIndex.toString(), selectedSlot);
      setShowSlotSelector(false);
    }
  };

  const handleUnequip = () => {
    if (equippedSlot) {
      onUnequip(equippedSlot);
    }
  };

  // Check if item type allows quantity changes
  const allowsQuantityChange = ['adventure', 'goods', 'consumable'].includes(item.type);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      onQuantityChange(inventoryIndex, newQuantity);
    }
  };

  return (
    <div
      style={{
        padding: '0.5rem',
        backgroundColor: isEquipped ? 'var(--color-sat-purple-faded)' : 'var(--color-dark-bg)',
        border: isEquipped
          ? '2px solid var(--color-metal-gold)'
          : '1px solid var(--color-dark-border)',
        borderRadius: '6px',
        margin: '0.25rem 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        {/* Left: Name and Quantity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ color: 'var(--color-cloud)', fontWeight: 'bold' }}>
            {item.name}
            {isEquipped && equippedSlot && ['weapon', 'shield', 'accessory'].includes(item.type) && (
              <span style={{ color: 'var(--color-metal-gold)', fontSize: '0.8em' }}>
                {' '}[{getSlotDisplayName(equippedSlot)}]
              </span>
            )}
          </span>
          {inventoryItem.quantity > 1 && (
            <span style={{ color: 'var(--color-metal-gold)', fontWeight: 'bold' }}>
              x{inventoryItem.quantity}
            </span>
          )}
        </div>

        {/* Right: Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {/* Weight Display */}
          <span
            style={{
              color: 'var(--color-cloud)',
              fontSize: '0.75rem',
              backgroundColor: 'var(--color-dark-bg)',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--color-dark-border)',
            }}
          >
            {((item.weight || 0) * inventoryItem.quantity).toFixed(1)} bu
          </span>
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
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {/* Quantity Controls or Equip/Unequip - Same space allocation */}
        <div style={{ width: '120px', display: 'flex', justifyContent: 'flex-end' }}>
          {allowsQuantityChange ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                onClick={() => handleQuantityChange(inventoryItem.quantity - 1)}
                disabled={inventoryItem.quantity <= 1}
                style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: '4px',
                  color: 'var(--color-cloud)',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inventoryItem.quantity > 1 ? 'pointer' : 'not-allowed',
                  fontSize: '0.75rem',
                  opacity: inventoryItem.quantity <= 1 ? 0.5 : 1,
                }}
              >
                -
              </button>
              <input
                type="number"
                value={inventoryItem.quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 1;
                  handleQuantityChange(newQuantity);
                }}
                min="1"
                style={{
                  width: '50px',
                  padding: '0.25rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-dark-bg)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: '4px',
                  color: 'var(--color-cloud)',
                  fontSize: '0.75rem',
                }}
              />
              <button
                onClick={() => handleQuantityChange(inventoryItem.quantity + 1)}
                style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: '4px',
                  color: 'var(--color-cloud)',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                +
              </button>
            </div>
          ) : canEquip ? (
            <button
              onClick={isEquipped ? handleUnequip : handleEquip}
              style={{
                backgroundColor: isEquipped
                  ? 'var(--color-destructive)'
                  : 'var(--color-metal-gold)',
                color: 'white',
                border: isEquipped
                  ? '2px solid var(--color-destructive)'
                  : '2px solid var(--color-metal-gold)',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                minWidth: '70px',
              }}
            >
              {isEquipped ? 'Unequip' : 'Equip'}
            </button>
          ) : null}
        </div>

        {/* Standard Action Buttons */}
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

      {/* Slot Selection Modal */}
      {showSlotSelector && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowSlotSelector(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-dark-elevated)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '6px',
              padding: '1rem',
              minWidth: '300px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: 'var(--color-cloud)', marginBottom: '1rem' }}>
              Choose Equipment Slot
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Select where to equip "{item.name}":
            </p>

            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'var(--color-dark-bg)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '4px',
                color: 'var(--color-cloud)',
                marginBottom: '1rem',
              }}
            >
              {getAvailableSlots().map((slot) => (
                <option key={slot} value={slot}>
                  {getSlotDisplayName(slot)}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSlotSelector(false)}
                style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  color: 'var(--color-cloud)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSlotConfirm}
                style={{
                  backgroundColor: 'var(--color-metal-gold)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Equip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryTab: React.FC<InventoryTabProps> = ({ character, onCharacterUpdate }) => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [equippedFilter, setEquippedFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<{ index: number; item: CharacterItem } | null>(
    null
  );
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);


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
        onCharacterUpdate(JSON.parse(JSON.stringify(updatedCharacter)));
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
        console.log('[EQUIP] Skills with dice tier modifiers:', {
          fitness: updatedCharacter.skills.fitness,
          deflection: updatedCharacter.skills.deflection,
          might: updatedCharacter.skills.might
        });
        // Force React to detect the state change by creating a new reference
        onCharacterUpdate(JSON.parse(JSON.stringify(updatedCharacter)));
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
        console.log('[UNEQUIP] Skills with dice tier modifiers:', {
          fitness: updatedCharacter.skills.fitness,
          deflection: updatedCharacter.skills.deflection,
          might: updatedCharacter.skills.might
        });
        // Force React to detect the state change by creating a new reference
        onCharacterUpdate(JSON.parse(JSON.stringify(updatedCharacter)));
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

  const handleSaveItem = async (index: number, modifications: Partial<Item>, _quantity: number) => {
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
        onCharacterUpdate(JSON.parse(JSON.stringify(updatedCharacter)));
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
        onCharacterUpdate(JSON.parse(JSON.stringify(updatedCharacter)));
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    handleUpdateQuantity(index, quantity);
  };

  const handleCurrencyUpdate = async (newGold: number, newSilver: number) => {
    try {
      const response = await fetch(`/api/characters/${character._id}/wealth`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gold: newGold, silver: newSilver }),
      });

      if (response.ok) {
        const updatedCharacter = await response.json();
        onCharacterUpdate(JSON.parse(JSON.stringify(updatedCharacter)));
      } else {
        showError('Failed to update currency');
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      showError('Failed to update currency');
    }
  };

  // Helper function to get maximum carry weight based on character size
  const getMaxCarryWeight = (): number => {
    const size = character.physicalTraits?.size || 'Medium';
    switch (size.toLowerCase()) {
      case 'small':
        return 25;
      case 'medium':
        return 50;
      case 'large':
        return 75;
      default:
        return 50; // Default to medium
    }
  };

  // Helper function to calculate current inventory weight (excluding equipped items)
  const getCurrentInventoryWeight = (): number => {
    if (!character.inventory) return 0;

    let totalWeight = 0;
    character.inventory.forEach((invItem) => {
      const item = getItemFromInventory(invItem);
      if (!item) return;

      // Only count unequipped items
      const { equipped } = isItemEquipped(item);
      if (!equipped) {
        const quantity = invItem.quantity || 1;
        totalWeight += (item.weight || 0) * quantity;
      }
    });

    return totalWeight;
  };

  // Helper function to check if an item is equipped
  const isItemEquipped = (item: Item): { equipped: boolean; slot?: string } => {
    if (!character.equipment) return { equipped: false };

    // Check all equipment slots including new structure
    const allSlots = [
      'hand', 'boots', 'body', 'head', 'back', 'accessory1', 'accessory2',
      'mainhand', 'offhand', 'extra1', 'extra2', 'extra3'
    ];

    for (const slotName of allSlots) {
      const slot = character.equipment[slotName as keyof typeof character.equipment];
      if (slot?.itemId === item._id) {
        return { equipped: true, slot: slotName };
      }
    }
    return { equipped: false };
  };

  // Helper function to check if an item can be equipped
  const canItemBeEquipped = (item: Item): boolean => {
    const equipableTypes = [
      'weapon',
      'headwear',
      'body',
      'cloak',
      'boots',
      'gloves',
      'shield',
      'accessory',
      'ammunition'
    ];

    // Check standard equipment types
    if (equipableTypes.includes(item.type)) {
      return true;
    }

    // Check if it's a holdable non-equipment item
    const isNonEquipment = ['trade_good', 'consumable', 'tool', 'instrument', 'adventure'].includes(item.type);
    if (isNonEquipment && item.holdable) {
      return true;
    }

    return false;
  };

  // Filter and sort inventory items
  const filteredInventory =
    character.inventory?.filter((invItem, _index) => {
      const item = getItemFromInventory(invItem);
      if (!item) return false;

      const matchesName = item.name.toLowerCase().includes(filter.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

      const isEquipped = isItemEquipped(item).equipped;
      const matchesEquipped =
        equippedFilter === 'all' ||
        (equippedFilter === 'equipped' && isEquipped) ||
        (equippedFilter === 'unequipped' && !isEquipped);

      return matchesName && matchesType && matchesEquipped;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h3 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Inventory</h3>
              <div
                style={{
                  color:
                    getCurrentInventoryWeight() > getMaxCarryWeight()
                      ? 'var(--color-white)'
                      : 'var(--color-cloud)',
                  fontSize: '0.9rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor:
                    getCurrentInventoryWeight() > getMaxCarryWeight()
                      ? 'rgba(152, 94, 109, 0.3)'
                      : 'var(--color-dark-elevated)',
                  borderRadius: '6px',
                  border:
                    getCurrentInventoryWeight() > getMaxCarryWeight()
                      ? '1px solid var(--color-sunset)'
                      : '1px solid var(--color-dark-border)',
                  fontWeight: getCurrentInventoryWeight() > getMaxCarryWeight() ? 'bold' : 'normal',
                }}
                title="Carry weight excludes equipped items"
              >
                {getCurrentInventoryWeight().toFixed(1)} / {getMaxCarryWeight()} Bulk Units
                {getCurrentInventoryWeight() > getMaxCarryWeight() && (
                  <span style={{ color: 'var(--color-sunset)', marginLeft: '0.5rem' }}>
                    (Overloaded!)
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-cloud)',
                  opacity: 0.7,
                }}
              >
                *Equipped items excluded
              </div>
            </div>
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

          {/* Wealth Display */}
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: 'var(--color-dark-elevated)',
            borderRadius: '6px',
            border: '1px solid var(--color-dark-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <h4 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Wealth</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      color: '#FFD700',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      ⚜
                    </span>
                    <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                      {character.wealth?.gold || 0} Gold
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      color: '#C0C0C0',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      ◉
                    </span>
                    <span style={{ color: 'var(--color-cloud)' }}>
                      {character.wealth?.silver || 0} Silver
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCurrencyModal(true)}
                style={{
                  padding: '0.4rem 0.8rem',
                  backgroundColor: 'var(--color-old-gold)',
                  color: 'var(--color-dark-bg)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                }}
              >
                Manage Currency
              </button>
            </div>
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
              <option value="boots">Boots</option>
              <option value="body">Body</option>
              <option value="gloves">Gloves</option>
              <option value="headwear">Headwear</option>
              <option value="cloak">Cloaks</option>
              <option value="accessory">Accessories</option>
              <option value="shield">Shields</option>
              <option value="goods">Goods</option>
              <option value="adventure">Adventure</option>
              <option value="consumable">Consumables</option>
              <option value="tool">Tools</option>
              <option value="instrument">Instruments</option>
              <option value="ammunition">Ammunition</option>
            </select>
            <select
              value={equippedFilter}
              onChange={(e) => setEquippedFilter(e.target.value)}
              style={{
                padding: '0.5rem',
                backgroundColor: 'var(--color-dark-bg)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '6px',
                color: 'var(--color-cloud)',
              }}
            >
              <option value="all">All Items</option>
              <option value="equipped">Equipped</option>
              <option value="unequipped">Unequipped</option>
            </select>
          </div>

          {/* Inventory Items */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {sortedInventory.length === 0 ? (
              <div style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem' }}>
                No items in inventory. Click "Add Item" to browse items.
              </div>
            ) : (
              sortedInventory.map((invItem, _sortedIndex) => {
                const item = getItemFromInventory(invItem);
                if (!item) return null;

                // Find the original index in the character's inventory
                const originalIndex =
                  character.inventory?.findIndex(
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
                    character={character}
                    onRemove={handleRemoveItem}
                    onEquip={handleEquipItem}
                    onUnequip={handleUnequipItem}
                    onEdit={handleEditItem}
                    onQuantityChange={handleQuantityChange}
                    isCustomized={invItem.isCustomized}
                    isEquipped={equipmentStatus.equipped}
                    equippedSlot={equipmentStatus.slot}
                    canEquip={canEquip}
                    showError={showError}
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

      {/* Currency Modal */}
      <CurrencyModal
        isOpen={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        currentGold={character.wealth?.gold || 0}
        currentSilver={character.wealth?.silver || 0}
        onConfirm={handleCurrencyUpdate}
      />
    </div>
  );
};

export default InventoryTab;
