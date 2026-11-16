# Pain & Stress

Pain and Stress represent the accumulated physical and mental suffering a character endures. Pain comes from physical injuries and trauma, while Stress comes from mental injuries and psychological trauma. Both are automatically calculated and use a mitigation and limit system to determine their effects.

## How Pain & Stress Work
<div class="triangle-line"></div>

Both Pain and Stress follow the same structure. Each character has a **mitigation** value and a **limit** value for both pain and stress. By default, mitigation starts at **3** and the limit starts at **10**. Certain modules, traits, and effects can modify these values.

| Level | Condition | Effects |
|-------|-----------|---------|
| None | Value is at or below your mitigation | No effect. |
| Active | Value is above your mitigation but at or below your limit | +1 penalty die on all rolls. Must pass an Endurance (pain) or Resilience (stress) check of 10 to benefit from a favorable rest. |
| Severe | Value is above your limit | +2 penalty dice on all rolls. Must pass an Endurance (pain) or Resilience (stress) check of 15 to benefit from a favorable rest. Morale is set to 0 and you cannot benefit from morale. |

### Mitigation

Pain or stress mitigation represents a character's ability to shrug off low levels of suffering. If your total pain or stress is at or below your mitigation, it has no effect on you. Modules and traits that increase your mitigation give you a buffer zone where pain or stress simply does not matter.

### Limit

The limit represents how much pain or stress a character can endure before the effects become severe. If your total pain or stress exceeds your limit, you suffer severe penalties. Certain effects can raise or lower this limit.

## Pain
<div class="triangle-line"></div>

Pain represents physical duress a character is under and is an accumulation of either missing health, injuries or other effects.

### Calculating Pain

Pain is calculated from multiple sources:

#### Injuries
- **Cosmetic Injuries**: 0 pain
- **Minor Physical Injuries**: 1 pain each
- **Major Physical Injuries**: 3 pain each
- **Severe Physical Injuries**: 5 pain each

#### Health Status
- **Below 10 Health**: +5 pain

#### Example

<div class="example-box">
Kael the mercenary has taken a beating in a skirmish with bandits. He has a maximum health of 20 but is currently at 8 health after a brutal fight. He has one minor physical injury and one major physical injury from the battle. His pain calculation is: 1 (minor injury) + 3 (major injury) + 5 (below 10 health) = 9 total pain. With his default pain mitigation of 3 and pain limit of 10, Kael is in <strong>Pain</strong> and suffers +1 penalty die on all rolls. Every movement is becoming difficult as the adrenaline wears off.
</div>

## Stress
<div class="triangle-line"></div>

Stress represents mental and psychological duress a character is under and is an accumulation of either missing resolve, mental injuries or other effects.

### Calculating Stress

Stress is calculated from multiple sources:

#### Injuries
- **Minor Mental Injuries**: 1 stress each
- **Major Mental Injuries**: 3 stress each
- **Severe Mental Injuries**: 5 stress each

#### Resolve Status
- **Below 10 Resolve**: +5 stress

#### Example

<div class="example-box">
Lyra the scholar has been delving into forbidden texts and witnessed unspeakable horrors in an ancient crypt. She has a maximum resolve of 20 but is currently at just 7 resolve after days of psychological torment. She has one severe mental injury and one major mental injury from her time in the depths. Her stress calculation is: 5 (severe injury) + 3 (major injury) + 5 (below 10 resolve) = 13 total stress. With her default stress mitigation of 3 and stress limit of 10, Lyra is in <strong>Severe Stress</strong>. She suffers +2 penalty dice on all rolls, cannot benefit from morale, and must pass a Resilience check of 15 to benefit from a favorable rest. She can barely distinguish reality from nightmare anymore.
</div>

## Managing Pain & Stress
<div class="triangle-line"></div>

### Natural Recovery
Both pain and stress decrease as their underlying causes are addressed:
- Healing injuries removes their associated pain or stress
- Recovering health and resolve to get over thresholds
- Treatment from modules or specialized skills that reduce stress or pain

### Substances
Certain substances can temporarily suppress pain or stress, allowing characters to function despite severe trauma. Painkillers can either reduce or completely eliminate pain on a temporary basis, letting wounded characters push through injuries that would otherwise incapacitate them. Alcohol and depressants can numb mental anguish and reduce stress, providing short-term relief from psychological trauma. Euphoric substances can similarly suppress stress by inducing artificial feelings of well-being and calm. However, all of these substances carry the risk of dependency, with repeated use potentially leading to addiction. See the [Substances](substances) page for complete details on available substances, their effects, and dependency mechanics.
