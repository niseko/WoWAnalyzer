import React from 'react';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import GemChecker from 'Parser/Core/Modules/Items/GemChecker';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import AlwaysBeCasting from './AlwaysBeCasting';
import AgonyUptime from './AgonyUptime';
import CorruptionUptime from './CorruptionUptime';
import SiphonLifeUptime from '../Talents/SiphonLifeUptime';
import SoulShardDetails from '../SoulShards/SoulShardDetails';
import SoulShardTracker from '../SoulShards/SoulShardTracker';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
    gemChecker: GemChecker,

    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    siphonLifeUptime: SiphonLifeUptime,
    soulShardDetails: SoulShardDetails,
    soulShardTracker: SoulShardTracker,
  };

  rules = [
    new Rule({
      name: 'Maintain your DoTs on the boss',
      description: 'Affliction Warlocks rely on DoTs as a means of dealing damage to the target. You should try to keep as highest uptime on them as possible.',
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.AGONY.id} icon /> uptime</React.Fragment>,
            check: () => this.agonyUptime.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.CORRUPTION_CAST.id} icon /> uptime</React.Fragment>,
            check: () => this.corruptionUptime.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.SIPHON_LIFE_TALENT.id} icon /> uptime</React.Fragment>,
            check: () => this.siphonLifeUptime.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.SIPHON_LIFE_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Don\'t cap your Soul Shards',
      description: 'Soul Shards are your main and most important resource and since their generation is random as Affliction, it\'s very important not to let them cap.',
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
      name: 'Use your cooldowns',
      description: 'Be mindful of your cooldowns if you are specced into them and use them when it\'s appropriate. It\'s okay to hold a cooldown for a little bit when the encounter requires it (burn phases), but generally speaking you should use them as much as you can.',
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SUMMON_DARKGLARE,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DARK_SOUL_MISERY_TALENT,
            when: combatant.hasTalent(SPELLS.DARK_SOUL_MISERY_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.VILE_TAINT_TALENT,
            when: combatant.hasTalent(SPELLS.VILE_TAINT_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.PHANTOM_SINGULARITY_TALENT,
            when: combatant.hasTalent(SPELLS.PHANTOM_SINGULARITY_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your utility and defensive spells',
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
      description: <React.Fragment>You should try to avoid doing nothing during the fight. When you're out of Soul Shards, cast <SpellLink id={SPELLS.SHADOW_BOLT_AFFLI.id} icon />/<SpellLink id={SPELLS.DRAIN_SOUL_TALENT.id} icon />, refresh your DoTs etc. When you have to move, use your instant abilities or try to utilize <SpellLink id={SPELLS.DEMONIC_CIRCLE_TALENT.id} icon>Teleport</SpellLink> or <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon>Gateway</SpellLink> to reduce the movement even further.</React.Fragment>,
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
