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
When an attack is made, a defense check is also made in an attempt to avoid it. Player characters usually roll defense checks, while NPCs usually use static defense checks.

If at least one dice meets or beats the defensive check, the attack hits and you calculate damage.

### Defense Checks
When attacked, all characters have the ability to defend themselves. When attacked with a ranged weapon, melee attack or a throwing weapon, a character makes a defense check. A defense check may be rolled or static. Player characters usually roll defense checks, while NPCs usually use static defense checks.

A character can choose to either make an evasion check or a deflection check, but there are some minor differences:
- **Evasion** :  When the check is greater than all the attack dice, the attack completely misses. When defending against an area attack, the check is halved and rounded down.
- **Deflection** :  When the check is greater than all the attack dice when defending against a melee attack, the attack is blocked. When making a deflection check against a ranged or area attack, the check is halved and rounded down. When using a light shield, the penalty against ranged attacks is removed and using a heavy shield removes the penalty for area and ranged attacks.

#### Static NPC Defense Checks

NPCs use static values for Deflection, Evasion, and Resilience unless a rule specifically says they roll. These static defenses are listed in the NPC's stat block.

Bonuses and penalties apply to the final defense check value whether the check is rolled or static. A +2 bonus to Deflection increases a rolled Deflection check by 2 or increases an NPC's static Deflection by 2. A -1 penalty to Evasion lowers either result by 1.

<div class="note-box">
Some attacks may call for a specfic check other than a defense check. When a character is asked to make a defense check, they make either an evasion or deflection check and apply the rules. If an attack calls for a different type of check, it will be specified in the description.
</div>

### Calculating Damage

The major difference between skill checks and weapon attacks is that every single dice in the attack pool matters. Instead of rolling for damage, the amount of damage the attack deals is determined by <b>how many</b> dice beat the defense check.

Every weapon has a **damage chart**: a list of numbers showing how much damage you deal based on how many dice hit. The more hits you land, the more damage you deal.

To calculate the chart manually, add the weapon's **base** and **growth** together. That's your damage on the first hit. For each additional hit, add the **growth** value again.

- **Base**: The weapon's inherent power. A heavier or more powerful weapon has a higher base. Increasing a weapon's base raises the entire damage chart.
- **Growth**: How much the weapon rewards additional hits. A weapon with high growth scales steeply with skill investment. Increasing a weapon's growth makes each additional hit more impactful.

For example, a longsword has a base of 5 and a growth of 4. The first hit deals 9 (5 + 4), the second hit deals 13 (9 + 4), and so on, giving a damage chart of [9, 13, 17, 21, 25]. Crafting enhancements and special materials can increase a weapon's base or growth.

<div class="example-box">
A monk is wielding a quarterstaff (base 6, growth 3) and makes an attack against a goblin. They have 2 talents in simple weapons and +3 skill, rolling 2d10. The goblin has a static defense of 3. The monk rolls a 6 and an 8. Both beat 3, so that's 2 hits.

Looking at the quarterstaff's damage chart: [9, 12, 15, 18, 21, 24]

2 hits = **12 damage**.
</div>

### Aimed Weapons

Some weapons, including bows, slings, firearms, and magic staves/wands, have the **Aimed** property. These weapons require precision to be effective; the first die in the attack pool does not count toward hits. This means you need at least 2 successful dice to deal any damage at all.

For aimed weapons, the first hit on the damage chart is skipped. Your spell check or attack still needs to succeed, but the first successful die is used for aiming rather than damage.

<div class="example-box">
An archer fires a shortbow (base 4, growth 3, aimed) with 3 talents in simple ranged and +2 skill, rolling 3d8. The target has a static defense of 4. The archer rolls a 7, 5 and 2.

Two dice beat the defense (7 and 5), but because the shortbow is aimed, the first die doesn't count. That leaves 1 effective hit.

Shortbow damage chart: [—, 7, 10, 13, 16, 19]

2 dice hitting = **7 damage**.

Compare this to a crossbow (base 6, growth 2, no aimed). At 2 hits, the crossbow does **10 damage** with no aiming penalty. The tradeoff: crossbows require reloading.
</div>

Anytime damage is calculated, the target of the attack can mitigate some or all of the damage. This is covered in the [Mitigation](/wiki/damage-mitigation) section.

### Dual Wielding

Any character can dual wield, but it is not very effective without investing in the dual wielder module. By default, when using a 1-handed weapon in their main hand, a character can equip a simple 1-handed melee weapon in their off-hand.

When a character is dual wielding, once per turn, when they make a melee attack with their primary hand, they can spend one energy to make another attack with their off-hand. This attack from the off-hand is rolled with a single dice, regardless of talent. The amount of energy required is always 1 + the cost in energy to swing the weapon. For most scenarios with simple melee weapons, there is no cost to swing the weapon, so it is simply 1 energy.


