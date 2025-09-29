# Attacks & Damage


<div class="triangle-line"></div>


### Weapon Skills
At creation, a player character determines their talents with their weapon, just as they do their attributes. Through modules, the character gains skills.
As with normal skill checks, the character rolls a number of dice equal to their talent and a dice type equal to their skill when they wish to make an attack.

<br>

The default value for the weapon skills a player character has are the following, representing a beginner adventurer:

- **Brawling**: +1 Talent
- **Throwing**: +1 Talent 
- **Simple Melee**: +1 Talent
- **Simple Ranged**: +1 Talent
- **Complex Melee**: +0 Talent 
- **Complex Ranged**: +0 Talent


### Types of Attacks

- **Melee**: An attack either with a non-ranged weapon or melee attack. Examples include longswords, halberds, axes and punching.
- **Ranged**: An attack with either a ranged weapon or a thrown weapon/object. Examples include longbows, pistols, throwing knives and darts.
- **Area**: An attack that deals damage to all creatures within a defined space. Examples include shrapnel and volleys of arrows.

### Making an Attack

Attacking is simple; you declare that you are using the attack action, or a specialized action from a module that uses a weapon, and roll your check.
When an attack is made, a defense check is also made in an attempt to avoid it.

If at least one dice meets or beats the defensive check, the attack hits and you calculate damage.

### Defense Checks
When attacked, all characters have the ability to defend themselves. When attacked with a ranged weapon, melee attack or a throwing weapon, a character makes a defense check. A character can choose to either make an evasion check or a deflection check, but there are some minor differences:
- **Evasion** :  When the check is greater than all the attack dice, the attack completely misses. When defending against an area attack, the check is halved and rounded down.
- **Deflection** :  When the check is greater than all the attack dice when defending against a melee attack, the attack is blocked. When making a deflection check against a ranged or area attack, the check is halved and rounded down. When using a light shield, the penalty against ranged attacks is removed and using a heavy shield removes the penalty for area and ranged attacks.

<div class="note-box">
Some attacks may call for a specfic check other than a defense check. When a character is asked to make a defense check, they make either an evasion or deflection check and apply the rules. If an attack calls for a different type of check, it will be specified in the description.
</div>

### Calculating Damage

The major difference between skill checks and weapon attacks is that every single dice in the attack pool matters. Instead of rolling for damage, the amount of damage the attack deals is calculated by <b>how many</b> dice beat the defense check.

All weapons in AnyventureDX have two important parts: primary damage and extra damage. Your first dice that hits in your attack pool deals primary damage, and every additional dice deals extra damage.

<div class="example-box">
A monk is wielding a quarterstaff and makes an attack against a goblin with it. Let us assume they have 2 talents in simple weapons and +3 skill, allowing them to roll 2d10.
The goblin has an unfortunate defense roll of 3 and the monk rolls a 6 and an 8 for a total of two successes. The primary damage on a quaterstaff is 5 and the extra damage is 3.
 Adding these together (5 + 3), the attack deals 8 damage.  
</div>

Anytime damage is calculated, the target of the attack can mitigate some or all of the damage. This is covered in the [Mitigation](/wiki/damage-mitigation) section.

### Dual Wielding

Any character can dual wield, but it is not very effective without investing in the dual wielder module. By default, when using a 1-handed weapon in their main hand, a character can equip a simple 1-handed melee weapon in their off-hand.

When a character is dual wielding, once per turn, when they make a melee attack with their primary hand, they can spend one energy to make another attack with their off-hand. This attack from the off-hand is rolled with a single dice, regardless of talent. The amount of energy required is always 1 + the cost in energy to swing the weapon. For most scenarios with simple melee weapons, there is no cost to swing the weapon, so it is simply 1 energy.


### Critical Hits
Critical hits add damage to your weapon attacks when you roll above a certain threshold. When you land one or more critical hits, you add the primary damage to your total calculation again. 

The critical hit threshold begins when gaining +4 skill in a weapon, allowing the attacker to roll a d12. A result of a 12 on the d12 is a critical hit. 

  | Dice | Critical Range | Critical Chance |
  |------|----------------|-----------------|
  | d12  | 12             | 8.33%           |
  | d16  | 15-16          | 12.5%           |
  | d20  | 18-20          | 15%             |
  | d24  | 20-24          | 20%             |


<div class="example-box">
A grand knight is wielding a longsword and normally rolls 4d16 on their attacks. Their longsword deals 7 primary damage and 4 extra damage. Because the enemy is dazed, they gain a bonus dice for a total of 5d12. Their attack dice pool ends up being [15, 3, 7, 16, 9] while the enemies defense check was an 8.
The 16,15 and 9 are all successes, and the 16 makes it a critical hit. By default, a character can only benefit from one critical hit dice. The final damage calculation ends up being (7[primary] + 4[extra] + 4[extra] + 7[critical]) for a total of 18.
</div>
