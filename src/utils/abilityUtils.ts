/**
 * Clean a creature ability before saving:
 * - drop attack data from abilities that aren't attacks (left over from older editor versions)
 * - drop energy cost, since creatures don't use energy (they use frequencies)
 */
export const stripUnusedAbilityData = <T extends { type?: string; attack?: unknown; cost?: unknown }>(
  ability: T
): T => {
  const rest = { ...ability };
  delete rest.cost;
  if (rest.type !== 'attack') delete rest.attack;
  return rest;
};
