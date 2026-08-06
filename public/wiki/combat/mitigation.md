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

Every creature has two values for each damage type: **Mitigation** and **Mitigation Limit**. Together, these define a window of damage you can actually take from that type.

- **Mitigation**: Damage at or below this value is completely ignored.
- **Mitigation Limit**: Damage above this value is capped to this value.

By default, all creatures start with **0 Mitigation** and a **25 Mitigation Limit** for every damage type. This means they ignore nothing and can take up to 25 damage from a single source.

### Mitigation (Ignoring Damage)
If the incoming damage is equal to or less than your mitigation, you take **0 damage**.

<div class="example-box">
A knight in plate armor has 5 physical mitigation. A goblin stabs them with a dagger for 4 damage. Since 4 is less than 5, the knight takes no damage. Their armor completely absorbs the blow.
</div>

### Mitigation Limit (Capping Damage)
If the incoming damage exceeds your mitigation limit, you only take damage equal to your limit.

<div class="example-box">
A knight in plate armor has a physical mitigation limit of 18. A giant smashes them with a club for 22 damage. Since 22 exceeds 18, the knight only takes 18 damage. The armor absorbs the worst of the impact.
</div>

### Damage Within the Window
If the incoming damage is greater than your mitigation but less than or equal to your mitigation limit, you take the **full damage**.

<div class="example-box">
A knight has 5 physical mitigation and an 18 physical mitigation limit. They are hit by a longsword for 12 damage. Since 12 is above 5 but below 18, they take the full 12 damage.
</div>

### Immunity
A creature with a mitigation of 25 or higher for a damage type is considered **immune** to that damage type.

## Sources of Mitigation
<div class="triangle-line"></div>

Mitigation and mitigation limits can be modified by various sources:

- **Armor** - Body armor raises mitigation and lowers the limit for physical damage. Higher quality materials like True Steel, Aetherium, and Starsteel further improve both values.
- **Armor Accessories** - Helmets, gloves, and boots primarily lower the mitigation limit, dampening the worst hits.
- **Modules** - Character progression modules can raise mitigation, lower the limit, or both depending on the archetype.
- **Ancestry** - Some ancestries have innate resistances that raise mitigation or vulnerabilities that raise the limit above 25.
- **Traits** - Traits like Planar or Vampirism can significantly alter mitigation values.
- **Spells & Abilities** - Temporary effects that modify mitigation or set the limit to a specific value.
- **Crafting** - Armor infusions and meals can improve mitigation values.

## Vulnerabilities
<div class="triangle-line"></div>

Some creatures or characters have a mitigation limit **above 25** for certain damage types. This means they can take more damage than normal from that type.

<div class="example-box">
A Lizardfolk has a cold mitigation limit of 29 due to their Cold Blooded trait. A blizzard spell dealing 28 cold damage would deal the full 28, whereas a human with the default limit of 25 would only take 25 from the same spell.
</div>

## Special Damage Modifications
<div class="triangle-line"></div>

### Half Damage
In some scenarios, due to traits, conditions or unique abilities, a character may be able to halve the damage they take.

### Double Damage
Some creatures or conditions may cause a character to take double damage from a source, such as a plantoid that is vulnerable to fire.

<div class="note-box">
Any damage modification, such as halving or doubling, always occurs before mitigation is calculated.
</div>
