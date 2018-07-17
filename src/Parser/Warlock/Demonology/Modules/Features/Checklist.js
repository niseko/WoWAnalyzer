import React from 'react';
import SPELLS from 'common/SPELLS';
import CoreChecklist, { Requirement, Rule } from 'Parser/Core/Modules/Features/Checklist';
import SpellLink from 'common/SpellLink';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/Combatants';
import Abilities from 'Parser/Core/Modules/Abilities';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import GemChecker from 'Parser/Core/Modules/Items/GemChecker';
import SoulShardDetails from 'Parser/Warlock/Demonology/Modules/SoulShards/SoulShardDetails';
import SoulShardTracker from 'Parser/Warlock/Demonology/Modules/SoulShards/SoulShardTracker';
import AlwaysBeCasting from 'Parser/Warlock/Demonology/Modules/Features/AlwaysBeCasting';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import Felstorm from 'Parser/Warlock/Demonology/Modules/Features/Felstorm';
import DoomUptime from 'Parser/Warlock/Demonology/Modules/Features/DoomUptime';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    felstorm: Felstorm,
    enchantChecker: EnchantChecker,
    gemChecker: GemChecker,
    soulShardDetails: SoulShardDetails,
    soulShardTracker: SoulShardTracker,
    doomUptime: DoomUptime,
  };

  rules = [
    new Rule({
      name: 'Use your core spells',
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CALL_DREADSTALKERS,
            onlyWithSuggestion: false,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.DOOM_TALENT.id} icon /> Uptime</React.Fragment>,
            check: () => this.doomUptime.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.DOOM_TALENT.id),
          }),
        ];
      },
    }),

    new Rule({
      name: 'Don\'t cap your Soul Shards',
      description: 'Avoid overcapping Soul Shards.',
      requirements: () => {
        return [
          new Requirement({
            name: 'Wasted shards per minute',
            check: () => this.soulShardDetails.suggestionThresholds,
            valueTooltip: `You wasted ${this.soulShardTracker.wasted} shards.`,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your offensive cooldowns',
      description: 'Be mindful of your cooldowns if you are specced into them and use them when it\'s appropriate. It\'s okay to hold a cooldown for a little bit when the encounter requires it (burn phases), but generally speaking you should use them as much as you can.',
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SUMMON_DEMONIC_TYRANT,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.NETHER_PORTAL_TALENT,
            when: combatant.hasTalent(SPELLS.NETHER_PORTAL_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.POWER_SIPHON_TALENT,
            when: combatant.hasTalent(SPELLS.POWER_SIPHON_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.GRIMOIRE_FELGUARD_TALENT,
            when: combatant.hasTalent(SPELLS.GRIMOIRE_FELGUARD_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEMONIC_STRENGTH_TALENT,
            when: combatant.hasTalent(SPELLS.DEMONIC_STRENGTH_TALENT.id),
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.FELSTORM_BUFF.id} icon /></React.Fragment>,
            check: () => this.felstorm.suggestionThresholds,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your defensive and utility spells.',
      description: <React.Fragment>Use other spells in your toolkit to your advantage. For example, you can try to minimize necessary movement by using <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon />, <SpellLink id={SPELLS.DEMONIC_CIRCLE_TALENT.id} icon />, <SpellLink id={SPELLS.BURNING_RUSH_TALENT.id} icon /> or mitigate incoming damage with <SpellLink id={SPELLS.UNENDING_RESOLVE.id} icon />/<SpellLink id={SPELLS.DARK_PACT_TALENT.id} icon />.<br />
        While you shouldn't cast these defensives on cooldown, be aware of them and use them whenever effective. Not using them at all indicates you might not be aware of them or not using them optimally.</React.Fragment>,
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEMONIC_CIRCLE_TELEPORT,
            when: combatant.hasTalent(SPELLS.DEMONIC_CIRCLE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DARK_PACT_TALENT,
            when: combatant.hasTalent(SPELLS.DARK_PACT_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.UNENDING_RESOLVE,
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Always be casting',
      description: <React.Fragment>You should try to avoid doing nothing during the fight. When you have to move, use your instant abilities or try to utilize <SpellLink id={SPELLS.DEMONIC_CIRCLE_TALENT.id} icon>Teleport</SpellLink> or <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon>Gateway</SpellLink> to reduce the movement even further.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Downtime',
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
        ];
      },
    }),

    new PreparationRule(),
  ];
}

export default Checklist;

