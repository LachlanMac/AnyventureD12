// Utility to parse action/reaction encoding from module data field

export interface ActionProperties {
  type: 'Action' | 'Reaction' | 'Both' | 'Downtime Action';
  frequency: 'instant' | 'daily' | 'perCombat' | 'perTarget';
  magical: boolean;
  energy: number;
}

/**
 * Parse action/reaction encoding from data string
 * Format: [X/Y/Z/D][I/D/C/T][N/M]E=[number]
 * Example: XINE=1 (Action, Instant, Non-magical, 1 energy)
 */
export function parseActionData(dataString: string): ActionProperties | null {
  if (!dataString) return null;

  // Split by colon to handle multiple data entries
  const parts = dataString.split(':');

  for (const part of parts) {
    // Match action/reaction pattern: [XYZD][IDCT][NM]E=\d+
    const match = part.trim().match(/^([XYZD])([IDCT])([NM])E=(\d+)$/);
    if (match) {
      const [_, typeCode, frequencyCode, magicCode, energyStr] = match;

      // Parse type
      let type: ActionProperties['type'];
      switch (typeCode) {
        case 'X':
          type = 'Action';
          break;
        case 'Z':
          type = 'Reaction';
          break;
        case 'Y':
          type = 'Both';
          break; // Action & Reaction
        case 'D':
          type = 'Downtime Action';
          break;
        default:
          continue;
      }

      // Parse frequency
      let frequency: ActionProperties['frequency'];
      switch (frequencyCode) {
        case 'I':
          frequency = 'instant';
          break;
        case 'D':
          frequency = 'daily';
          break;
        case 'C':
          frequency = 'perCombat';
          break;
        case 'T':
          frequency = 'perTarget';
          break;
        default:
          continue;
      }

      // Parse magical
      const magical = magicCode === 'M';

      // Parse energy
      const energy = parseInt(energyStr, 10);

      return { type, frequency, magical, energy };
    }
  }

  return null;
}

/**
 * Check if an option name indicates it's an action or reaction
 */
export function isActionOrReaction(optionName: string): boolean {
  const lowerName = optionName.toLowerCase();
  return lowerName.includes('action') || lowerName.includes('reaction');
}

/**
 * Get a display string for the energy cost
 */
export function getEnergyDisplay(energy: number): string {
  if (energy === 0) return 'Free';
  if (energy === 1) return '1 Energy';
  return `${energy} Energy`;
}

/**
 * Get the energy cost for a module option
 * Returns the energy cost or null if not an action/reaction
 */
export function getOptionEnergyCost(option: { name: string; data?: string }): number | null {
  // First check if it's an action or reaction by name
  if (!isActionOrReaction(option.name)) {
    return null;
  }

  // Try to parse the data field
  const actionData = parseActionData(option.data || '');

  // If we have parsed data, return the energy cost
  if (actionData) {
    return actionData.energy;
  }

  // Default to 1 energy if it's an action/reaction but no data specified
  return 1;
}
