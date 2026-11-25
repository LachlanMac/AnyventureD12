// Starting module point presets, shared by character creation and campaign settings
// so the two always offer the same choices.
export const MODULE_POINT_PRESETS: { value: number; label: string }[] = [
  { value: 5, label: 'Commoner' },
  { value: 15, label: 'New Adventurer' },
  { value: 25, label: 'Seasoned Adventurer' },
  { value: 35, label: 'Local Hero' },
  { value: 45, label: 'Champion' },
];

export const DEFAULT_MODULE_POINTS = 15;
export const DEFAULT_STARTING_TALENTS = 8;
export const MIN_STARTING_TALENTS = 4;
export const MAX_STARTING_TALENTS = 20;
