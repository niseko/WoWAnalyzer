import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';

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

import BoneShield from './BoneShield';
import BloodPlagueUptime from './BloodPlagueUptime';
import AlwaysBeCasting from './AlwaysBeCasting';
import CrimsonScourge from './CrimsonScourge';
import MarrowrendUsage from './MarrowrendUsage';
import DeathsCaress from '../Core/DeathsCaress';

import BoneStorm from '../Talents/Bonestorm';
import MarkOfBloodUptime from '../Talents/MarkOfBlood';
import Ossuary from '../Talents/Ossuary';
import RuneStrike from '../Talents/RuneStrike';
import Consumption from '../Talents/Consumption';

import RunicPowerDetails from '../RunicPower/RunicPowerDetails';
import RuneTracker from '../../../Shared/RuneTracker';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    legendaryCountChecker: LegendaryCountChecker,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    prePotion: PrePotion,
    bloodplagueUptime: BloodPlagueUptime,
    alwaysBeCasting: AlwaysBeCasting,
    enchantChecker: EnchantChecker,
    gemChecker: GemChecker,
    boneShield: BoneShield,
    ossuary: Ossuary,
    runeStrike: RuneStrike,
    deathsCaress: DeathsCaress,

    bonestorm: BoneStorm,
    consumption: Consumption,
    markOfBloodUptime: MarkOfBloodUptime,

    crimsonScourge: CrimsonScourge,
    marrowrendUsage: MarrowrendUsage,

    runicPowerDetails: RunicPowerDetails,
    runeTracker: RuneTracker,
  };

  rules = [
    new Rule({
      name: 'Use your short cooldowns',
      description: 'These should generally always be recharging to maximize efficiency.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLOOD_BOIL,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEATH_AND_DECAY,
            when: this.selectedCombatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id),
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.CRIMSON_SCOURGE.id} /> procs spent</React.Fragment>,
            check: () => this.crimsonScourge.efficiencySuggestionThresholds,
            when: !this.selectedCombatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLOODDRINKER_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RUNE_STRIKE_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.RUNE_STRIKE_TALENT.id),
          }),
        ];
      },
    }),

        new Rule({
      name: 'Do not overcap your resources',
      description: 'Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities. Try to spend Runic Power before reaching the maximum amount and always keep atleast 3 Runes on cooldown to avoid wasting resources.',
      requirements: () => {
        return [
          new Requirement({
            name: 'Runic Power Efficiency',
            check: () => this.runicPowerDetails.efficiencySuggestionThresholds,
          }),
          new Requirement({
            name: 'Rune Efficiency',
            check: () => this.runeTracker.suggestionThresholdsEfficiency,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.MARROWREND.id} /> efficiency</React.Fragment>,
            check: () => this.marrowrendUsage.suggestionThresholdsEfficiency,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.RUNE_STRIKE_TALENT.id} /> efficiency</React.Fragment>,
            check: () => this.runeStrike.cooldownReductionThresholds,
          }),
          new Requirement({
            name: <React.Fragment>Avoid casting <SpellLink id={SPELLS.DEATHS_CARESS.id} /></React.Fragment>,
            check: () => this.deathsCaress.averageCastSuggestionThresholds,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your offensive cooldowns',
      description: 'You should aim to use these cooldowns as often as you can to maximize your damage output unless you are saving them for their defensive value.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DANCING_RUNE_WEAPON,
            onlyWithSuggestion: false,
          }),
          new Requirement({
            name: <React.Fragment>Possible <SpellLink id={SPELLS.CONSUMPTION_TALENT.id} /> hits</React.Fragment>,
            check: () => this.consumption.hitSuggestionThreshold, 
            when: this.selectedCombatant.hasTalent(SPELLS.CONSUMPTION_TALENT.id),
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.BONESTORM_TALENT.id} /> efficiency</React.Fragment>,
            check: () => this.bonestorm.suggestionThresholds,
            when: this.selectedCombatant.hasTalent(SPELLS.BONESTORM_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Maintain your buffs and debuffs',
      description: 'It is important to maintain these as they contribute a large amount to your DPS and HPS.',
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.BLOOD_PLAGUE.id} /> Uptime</React.Fragment>,
            check: () => this.bloodplagueUptime.uptimeSuggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.MARK_OF_BLOOD_TALENT.id} /> Uptime</React.Fragment>,
            when: this.selectedCombatant.hasTalent(SPELLS.MARK_OF_BLOOD_TALENT.id),
            check: () => this.markOfBloodUptime.uptimeSuggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.BONE_SHIELD.id} /> Uptime</React.Fragment>,
            check: () => this.boneShield.uptimeSuggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.OSSUARY.id} /> Uptime</React.Fragment>,
            when: this.selectedCombatant.hasTalent(SPELLS.OSSUARY_TALENT.id),
            check: () => this.ossuary.uptimeSuggestionThresholds,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your defensive cooldowns',
      description: 'Use these to block damage spikes and keep damage smooth to reduce external healing required.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.VAMPIRIC_BLOOD,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ICEBOUND_FORTITUDE,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ANTI_MAGIC_SHELL,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RUNE_TAP_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.RUNE_TAP_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TOMBSTONE_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.TOMBSTONE_TALENT.id),
          }),
        ];
      },
    }),

    new PreparationRule(),
  ]
}

export default Checklist;
