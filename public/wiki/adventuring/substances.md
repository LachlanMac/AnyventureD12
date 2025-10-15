# Substances

Substances are consumable items that provide temporary benefits to adventurers, ranging from liquid courage before a dangerous negotiation to powerful stimulants that enhance mental faculties. While these effects can be invaluable in the right situation, all substances carry the risk of dependency.

## Using Substances

Consuming a substance requires an Action. Once consumed, the substance's effects begin immediately and last for the specified duration. Multiple substances can be active simultaneously, though using multiple doses of the same substance or related substances may increase dependency risk.

Track the duration of each active substance separately. When a substance's duration expires, its effects end immediately. Some substances, particularly euphorics, may have additional effects when they wear off.

## Dependency Mechanics
<div class="triangle-line"></div>

Every substance has a dependency risk. Using substances repeatedly will cause you to develop a dependency, which makes it harder to resist using more. There are four dependency categories, each tracked separately:

- **Alcohol** (Endurance)
- **Painkillers** (Endurance)
- **Depressants** (Resilience)
- **Euphorics** (Resilience)

### Dependency Tiers

Each category has a dependency tier from 0 (no dependency) to 3 (severe dependency). Your current dependency tier affects future checks:

| Dependency Tier | Effect on Future Dependency Checks |
|----------------|-------------------------------------|
| 0 | Roll normally |
| 1 | +1 penalty die |
| 2 | +2 penalty dice |
| 3 | +3 penalty dice (roll multiple dice, take lowest) |

### Gaining Dependency

When you rest after using a substance, you must make a dependency check for that category. Roll either Endurance or Resilience depending on the substance type against a threshold based on the substance's dependency modifier.

**Threshold = 1 + substance dependency modifier**

If you succeed, nothing happens and you avoid becoming more dependent. If you fail the check, increase your dependency tier by 1 (maximum 3) and lose resolve equal to your new dependency tier.

If you used multiple substances from the same category before resting, add each additional substance's dependency modifier to the threshold. This represents building tolerance as you consume more.

<div class="example-box">
Gareth drinks a shot of strong liquor (dependency modifier +2) around the campfire. When he takes his rest, he must make an Endurance check against a threshold of 3 (1 + 2). He currently has tier 1 alcohol dependency, giving him +1 penalty die on the check. He rolls 2d8 (his normal pool) with +1 penalty die and gets a 4, beating the threshold. He avoids increasing his dependency this time.
</div>

### Reducing Dependency

If you have any dependency in a category and go through a full day and rest without consuming that type of substance, you can attempt to reduce your dependency. Make a dependency check against a threshold of 8.

If you succeed, reduce your dependency tier by 1. If you fail, you lose resolve equal to your current dependency tier as you struggle with the absence of the substance.

<div class="example-box">
Lyra has tier 3 painkiller dependency from using Crimson Tears regularly. She decides she needs to kick the habit and goes a full day without taking any painkillers, then completes a rest. She must make an Endurance check against a threshold of 8, but her tier 3 dependency gives her +3 penalty dice. She rolls 1d10 (her normal pool) with +3 penalty dice and gets a 5, failing the check. She loses 3 resolve as she suffers through the pain without relief. Her dependency tier remains at 3.
</div>

## Substance Categories
<div class="triangle-line"></div>

### Alcohol
Alcoholic beverages provide a boost to resolve, helping adventurers steel their nerves or recover from mental strain. From weak ales served in roadside taverns to potent spirits reserved for celebrations, alcohol is widely available throughout the realm. The strength of the drink determines both its effectiveness and its addictive properties.

<!-- SUBSTANCE_ALCOHOL_TABLE_START -->
*Substance data will be automatically populated from the game database*
<!-- SUBSTANCE_ALCOHOL_TABLE_END -->

### Painkiller
Painkillers suppress the debilitating effects of injuries, allowing wounded adventurers to continue fighting despite broken bones or deep wounds. These substances range from simple herbal remedies to powerful opiates that can completely mask even the most severe trauma. Healers and field medics often carry these, though their dependency risk makes long-term use dangerous.

<!-- SUBSTANCE_PAINKILLER_TABLE_START -->
*Substance data will be automatically populated from the game database*
<!-- SUBSTANCE_PAINKILLER_TABLE_END -->

### Depressant
Depressants suppress stress and mental strain, providing relief from the psychological weight of injuries and trauma. They grant the Numbed condition and can provide various mental immunities depending on potency. Useful for managing stress buildup, but carry significant addiction risk.

<!-- SUBSTANCE_DEPRESSANT_TABLE_START -->
*Substance data will be automatically populated from the game database*
<!-- SUBSTANCE_DEPRESSANT_TABLE_END -->

### Euphoric
Euphorics provide an immediate surge of morale and confidence, making them popular among performers, gamblers, and desperate warriors. However, this artificial high comes at a cost—when the substance wears off, users experience a morale crash that leaves them worse off than before. Combat stimulants are particularly prized by mercenaries and berserkers despite their severe aftereffects.

<!-- SUBSTANCE_EUPHORIC_TABLE_START -->
*Substance data will be automatically populated from the game database*
<!-- SUBSTANCE_EUPHORIC_TABLE_END -->
