import React, { useMemo } from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import { Action, Character, Ancestry, Culture } from '../../../types/character';

interface ActionsTabProps {
  character: Character;
}

const ActionsTab: React.FC<ActionsTabProps> = ({ character }) => {
  // Parse weapon attacks from equipped items
  const weaponAttacks = useMemo(() => {
    const attacks: any[] = [];

    // Helper to get item data from inventory item
    const getItemData = (invItem: any) => {
      if (invItem.isCustomized && invItem.itemData) {
        return invItem.itemData;
      }
      return invItem.itemId;
    };

    // Check equipped weapons in equipment slots
    const equipmentSlots = ['mainhand', 'offhand', 'extra1', 'extra2', 'extra3'];
    equipmentSlots.forEach((slotName) => {
      const slot = character.equipment?.[slotName];
      if (slot?.itemId) {
        // Find the item in inventory
        const inventoryItem = character.inventory?.find((invItem) => {
          const itemData = getItemData(invItem);
          return itemData?._id === slot.itemId || itemData?._id?.toString() === slot.itemId?.toString();
        });

        if (inventoryItem) {
          const itemData = getItemData(inventoryItem);
          if (itemData?.type === 'weapon') {
            attacks.push({
              name: itemData.name,
              weapon_category: itemData.weapon_category,
              primary: itemData.primary,
              secondary: itemData.secondary,
              icon: itemData.foundry_icon,
            });
          }
        }
      }
    });

    return attacks;
  }, [character.equipment, character.inventory]);

  // Parse actions and reactions from all sources
  const { actions, reactions } = useMemo(() => {
    const allActions: Action[] = [];

    // Helper function to determine energy cost from data string
    const getEnergyCost = (data: string, actionType: string): number => {
      // Basic energy costs - can be refined based on data encoding
      if (actionType.includes('Daily')) return 0; // Daily abilities don't cost energy
      if (data === 'X') return 1; // Basic action
      if (data === 'Z') return 1; // Basic reaction
      if (data.startsWith('XD')) return 1; // Action with data
      if (data.startsWith('XX')) return 0; // Special/daily action
      return 1; // Default cost
    };

    // Helper function to extract action name (remove "Action : " or "Reaction : " prefix)
    const extractActionName = (fullName: string): string => {
      const prefixes = ['Daily Action : ', 'Daily Reaction : ', 'Action : ', 'Reaction : '];
      for (const prefix of prefixes) {
        if (fullName.startsWith(prefix)) {
          return fullName.substring(prefix.length);
        }
      }
      return fullName;
    };

    // Helper function to determine action type from data field
    const getActionType = (data: string, name: string): Action['type'] => {
      // Check name for daily modifiers first
      if (name.includes('Daily Action') || name.includes('Daily Reaction')) {
        if (data.startsWith('X')) return 'Daily Action';
        if (data.startsWith('Z')) return 'Daily Reaction';
      }

      // Standard action/reaction based on data
      if (data.startsWith('X')) return 'Action';
      if (data.startsWith('Z')) return 'Reaction';

      return 'Free Action';
    };

    // Helper function to check if an option is an action/reaction
    const isActionOrReaction = (data: string): boolean => {
      return data.startsWith('X') || data.startsWith('Z');
    };

    // Parse from ancestry
    const ancestryData = character.ancestry?.ancestryId as Ancestry | string | undefined;
    if (ancestryData && typeof ancestryData !== 'string' && ancestryData.options) {
      ancestryData.options.forEach((option: any) => {
        if (option.data && isActionOrReaction(option.data)) {
          const actionType = getActionType(option.data, option.name);
          allActions.push({
            name: extractActionName(option.name),
            description: option.description,
            type: actionType,
            energyCost: getEnergyCost(option.data, option.name),
            source: ancestryData.name || 'Unknown Ancestry',
            sourceType: 'ancestry',
            data: option.data,
          });
        }
      });
    }

    // Parse from culture
    const cultureData = character.characterCulture?.cultureId as Culture | string | undefined;
    if (cultureData && typeof cultureData !== 'string' && cultureData.options) {
      cultureData.options.forEach((option: any) => {
        if (option.data && isActionOrReaction(option.data)) {
          const actionType = getActionType(option.data, option.name);
          allActions.push({
            name: extractActionName(option.name),
            description: option.description,
            type: actionType,
            energyCost: getEnergyCost(option.data, option.name),
            source: cultureData.name || 'Unknown Culture',
            sourceType: 'culture',
            data: option.data,
          });
        }
      });
    }

    // Parse from modules
    character.modules?.forEach((module) => {
      if (module.moduleId && typeof module.moduleId !== 'string') {
        const moduleData = module.moduleId;

        // Check selected options for actions/reactions
        module.selectedOptions?.forEach((selectedOption) => {
          const optionLocation =
            typeof selectedOption === 'string' ? selectedOption : selectedOption.location;
          const option = moduleData.options?.find((opt) => opt.location === optionLocation);
          if (option) {
            if (option.data && isActionOrReaction(option.data)) {
              const actionType = getActionType(option.data, option.name);
              allActions.push({
                name: extractActionName(option.name),
                description: option.description,
                type: actionType,
                energyCost: getEnergyCost(option.data, option.name),
                source: moduleData.name,
                sourceType: 'module',
                data: option.data,
              });
            }
          } else {
          }
        });
      }
    });

    // Split into actions and reactions
    const actions = allActions.filter(
      (action) =>
        action.type === 'Action' || action.type === 'Daily Action' || action.type === 'Free Action'
    );
    const reactions = allActions.filter(
      (action) => action.type === 'Reaction' || action.type === 'Daily Reaction'
    );

    return { actions, reactions };
  }, [character]);

  // Render action/reaction card
  const renderActionCard = (action: Action) => (
    <Card key={`${action.source}-${action.name}`} variant="default">
      <CardHeader
        style={{
          backgroundColor:
            action.type === 'Action' || action.type === 'Daily Action'
              ? 'var(--color-sat-purple-faded)'
              : action.type === 'Reaction' || action.type === 'Daily Reaction'
                ? 'var(--color-sunset)'
                : 'var(--color-metal-gold)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              color: 'var(--color-white)',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            {action.name}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {action.energyCost !== undefined && action.energyCost > 0 && (
              <span
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  color: 'var(--color-white)',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  fontWeight: 'bold',
                }}
              >
                {action.energyCost} Energy
              </span>
            )}
            <span
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: 'var(--color-white)',
                fontSize: '0.75rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem',
                fontWeight: 'bold',
              }}
            >
              {action.type}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <p
          style={{
            color: 'var(--color-cloud)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            lineHeight: '1.4',
          }}
        >
          {action.description}
        </p>
        <div
          style={{
            color: 'var(--color-muted)',
            fontSize: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Source: {action.source}</span>
          <span style={{ textTransform: 'capitalize' }}>{action.sourceType}</span>
        </div>
      </CardBody>
    </Card>
  );

  // Render weapon attack card
  const renderWeaponAttackCard = (weapon: any, attackType: 'primary' | 'secondary', index: number) => {
    const attack = weapon[attackType];
    if (!attack || attack.damage === '0') return null;

    const categoryMap: Record<string, string> = {
      simpleMelee: 'Simple Melee',
      simpleRanged: 'Simple Ranged',
      complexMelee: 'Complex Melee',
      complexRanged: 'Complex Ranged',
      brawling: 'Brawling',
      throwing: 'Throwing',
    };

    const damageTypeColors: Record<string, string> = {
      physical: '#CD7F32',
      heat: '#FF4444',
      cold: '#4444FF',
      electric: '#FFFF44',
      dark: '#8B4789',
      divine: '#FFD700',
      aetheric: '#00CED1',
      psychic: '#FF1493',
      toxic: '#32CD32',
    };

    // Calculate dice roll
    const weaponSkillMap: Record<string, string> = {
      simpleMelee: 'simpleMeleeWeapons',
      simpleRanged: 'simpleRangedWeapons',
      complexMelee: 'complexMeleeWeapons',
      complexRanged: 'complexRangedWeapons',
      brawling: 'brawling',
      throwing: 'throwing',
    };

    const skillKey = weaponSkillMap[weapon.weapon_category];
    const weaponSkill = character.weaponSkills?.[skillKey];
    const talent = weaponSkill?.talent || 0;
    const skillValue = weaponSkill?.value || 0;
    const bonusAttack = attack.bonus_attack || 0;
    const totalDice = talent + bonusAttack;

    // Dice tier map
    const diceTierMap: Record<number, string> = {
      0: 'd4',
      1: 'd6',
      2: 'd8',
      3: 'd10',
      4: 'd12',
      5: 'd16',
      6: 'd20',
      7: 'd24',
    };

    const diceType = diceTierMap[skillValue] || 'd4';
    const diceFormula = totalDice > 0 ? `${totalDice}${diceType}` : '0';

    // Calculate range display
    const rangeMap: Record<number, string> = {
      1: 'Adjacent',
      2: 'Nearby',
      3: 'Very Short',
      4: 'Short',
      5: 'Moderate',
      6: 'Far',
      7: 'Very Far',
      8: 'Distant',
    };

    const getRangeText = (min: number, max: number): string => {
      // Both adjacent
      if (min === 1 && max === 1) return 'Adjacent';

      // Min and max are equal
      if (min === max) return rangeMap[min] || `${min}`;

      // Min is adjacent, show only max
      if (min === 1) return rangeMap[max] || `${max}`;

      // Show range
      const minText = rangeMap[min] || `${min}`;
      const maxText = rangeMap[max] || `${max}`;
      return `${minText} - ${maxText}`;
    };

    const rangeText = getRangeText(attack.min_range || 1, attack.max_range || 1);

    const handsText = weapon.hands === 2 ? '2-handed' : '1-handed';

    return (
      <div
        key={`${weapon.name}-${attackType}-${index}`}
        style={{
          backgroundColor: 'var(--color-dark-elevated)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 1fr 1fr',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        {/* Column 1: Weapon name, type, dice */}
        <div>
          <h4
            style={{
              color: '#FFD700',
              fontSize: '1rem',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '0.25rem',
            }}
          >
            {weapon.name}
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <p
              style={{
                color: 'var(--color-cloud)',
                fontSize: '0.75rem',
                margin: 0,
              }}
            >
              {handsText} {categoryMap[weapon.weapon_category] || weapon.weapon_category}
            </p>
            <span
              style={{
                color: 'var(--color-white)',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem',
              }}
            >
              {diceFormula}
            </span>
          </div>
        </div>

        {/* Column 2: Damage (primary and secondary) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {/* Primary damage */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span
              style={{
                color: '#FFD700',
                fontSize: '0.875rem',
                fontWeight: 'bold',
              }}
            >
              [{attack.damage}/{attack.damage_extra}]
            </span>
            <span
              style={{
                backgroundColor: damageTypeColors[attack.damage_type] || '#888888',
                color: 'var(--color-white)',
                fontSize: '0.75rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              {attack.damage_type}
            </span>
          </div>
          {/* Secondary damage if exists */}
          {attack.secondary_damage > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span
                style={{
                  color: '#FFD700',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                }}
              >
                [{attack.secondary_damage}/{attack.secondary_damage_extra}]
              </span>
              <span
                style={{
                  backgroundColor: damageTypeColors[attack.secondary_damage_type] || '#888888',
                  color: 'var(--color-white)',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              >
                {attack.secondary_damage_type}
              </span>
            </div>
          )}
        </div>

        {/* Column 3: Range */}
        <div>
          <span
            style={{
              color: 'var(--color-cloud)',
              fontSize: '0.875rem',
            }}
          >
            {rangeText}
          </span>
        </div>

        {/* Column 4: Energy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
          <span
            style={{
              color: 'var(--color-cloud)',
              fontSize: '0.75rem',
            }}
          >
            Energy:
          </span>
          {attack.energy > 0 ? (
            <span
              style={{
                color: '#FFD700',
                fontSize: '0.875rem',
                fontWeight: 'bold',
              }}
            >
              ★
            </span>
          ) : (
            <span
              style={{
                color: 'var(--color-muted)',
                fontSize: '0.75rem',
              }}
            >
              None
            </span>
          )}
        </div>
      </div>
    );
  };

  const hasAnyActions = actions.length > 0 || reactions.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {!hasAnyActions && weaponAttacks.length === 0 ? (
        <Card variant="default">
          <CardBody>
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  color: 'var(--color-cloud)',
                }}
              >
                No actions or weapon attacks available yet. Equip weapons or add modules to gain actions.
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Weapon Attacks Section */}
          {weaponAttacks.length > 0 && (
            <div>
              <h2
                style={{
                  color: 'var(--color-white)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  borderBottom: '2px solid #FFD700',
                  paddingBottom: '0.5rem',
                }}
              >
                Weapon Attacks
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {weaponAttacks.map((weapon, index) => (
                  <React.Fragment key={`weapon-${index}`}>
                    {renderWeaponAttackCard(weapon, 'primary', index)}
                    {renderWeaponAttackCard(weapon, 'secondary', index)}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Actions Section */}
          {actions.length > 0 && (
            <div>
              <h2
                style={{
                  color: 'var(--color-white)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  borderBottom: '2px solid var(--color-sat-purple)',
                  paddingBottom: '0.5rem',
                }}
              >
                Actions ({actions.length})
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '1rem',
                }}
              >
                {actions.map(renderActionCard)}
              </div>
            </div>
          )}

          {/* Reactions Section */}
          {reactions.length > 0 && (
            <div>
              <h2
                style={{
                  color: 'var(--color-white)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  borderBottom: '2px solid var(--color-sunset)',
                  paddingBottom: '0.5rem',
                }}
              >
                Reactions ({reactions.length})
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '1rem',
                }}
              >
                {reactions.map(renderActionCard)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActionsTab;
