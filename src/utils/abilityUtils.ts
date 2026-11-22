/** Drop attack data from abilities that aren't attacks (left over from older editor versions). */
export const stripUnusedAbilityData = <T extends { type?: string; attack?: unknown }>(
  ability: T
): T => {
  if (ability.type === 'attack' || !ability.attack) return ability;
  const rest = { ...ability };
  delete rest.attack;
  return rest;
};
