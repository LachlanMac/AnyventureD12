# Damage & Mitigation

## Understanding Damage Types
<div class="triangle-line"></div>

Anyventure features multiple damage types, each representing different forms of harm:

- **Physical** - Slashing, piercing, and bludgeoning from weapons
- **Heat** - Fire, lava, and burning effects
- **Cold** - Ice, frost, and freezing attacks
- **Electric** - Electrical shocks and storms
- **Dark** - Necrotic and shadow damage
- **Divine** - Holy and radiant energy
- **Aetheric** - Magical and sometimes spiritual damage
- **Psychic** - Mental attacks and mind damage
- **Toxic** - Poisons, acids, and venoms

## How Mitigation Works
<div class="triangle-line"></div>

Mitigation represents your ability to resist or reduce incoming damage. Each creature can have different mitigation values for each damage type based on a variety of factors.

### Full Mitigation
If your mitigation equals or exceeds the incoming damage, you take **0 damage**.

<div class="example-box">
A bandit with 4 physical mitigation is struck by a dagger for 3 damage. Since 3 is less than 4, the bandit takes no damage - their armor completely absorbs the blow.
</div>

### Partial Mitigation
All characters have a partial mitigation score that is **double** their normal mitigation. When the damage taken is less than or equal to the partial mitigation, but greater than the full mitigation, the damage is reduced by half and rounded down.

<div class="example-box">
A flame scholar with 6 heat mitigation has a partial heat mitigation score of 12 (6 + 6) and are hit with a powerful fireball spell that deals 11 damage. Since 11 is greater than 6 but 11 is less than 12, the attack is partially mitigated and the flame scholar takes 6 heat damage (half of 11 rounded down).  
</div>

### No Mitigation
If the damage exceeds your mitigation value, you take **full damage**.

<div class="example-box">
A mage with 2 Physical mitigation is struck by a greatsword for 7 damage. Since 7 is greater than 2, the mage takes the full 7 damage.
</div>

## Sources of Mitigation


Mitigation can come from various sources:

- **Armor** - Provides Physical mitigation
- **Magical Items** - Can grant mitigation to specific damage types
- **Spells & Abilities** - Temporary buffs that increase mitigation
- **Racial Traits** - Some races have natural resistances
- **Environmental Effects** - Certain conditions may provide mitigation


## Special Damage Modifications
<div class="triangle-line"></div>

### Half Damage
In some scenarios, due to traits, conditions or unique abilities, a character may be able to halve the damage they take.
### Double Damage
Some creatures or conditions may cause a character to take double damage from a source, such as a plantoid that is vulnerable to fire.

<div class="note-box">
Any damage modification, such as halving or doubling, will always occur before mitigations are calculated
</div>