import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import PlayerBreakdownTab from 'interface/others/PlayerBreakdownTab';
import HealingValue from 'parser/shared/modules/HealingValue';


import { ABILITIES_AFFECTED_BY_MASTERY } from '../../constants';

class MasteryEffectiveness extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    statTracker: StatTracker,
  };

  totalMasteryHealing = 0;
  totalMaxPotentialMasteryHealing = 0;

  masteryHealEvents = [];

  rawMasteryEffectivenessSum = 0;
  rawMasteryEffectivenessCount = 0;
  get rawMasteryEffectivenessAverage() {
    return this.rawMasteryEffectivenessSum / this.rawMasteryEffectivenessCount;
  }
  scaledMasteryEffectivenessSum = 0;
  scaledMasteryEffectivenessCount = 0;
  get scaledMasteryEffectivenessAverage() {
    return this.scaledMasteryEffectivenessSum / this.scaledMasteryEffectivenessCount;
  }
  totalMasteryHealingDone = 0;

  on_byPlayer_heal(event) {
    const isAbilityAffectedByMastery = ABILITIES_AFFECTED_BY_MASTERY.includes(event.ability.guid);
    if (!isAbilityAffectedByMastery) {
      return;
    }

    const healthBeforeHeal = event.hitPoints - event.amount;
    const masteryEffectiveness = Math.max(0, 1 - healthBeforeHeal / event.maxHitPoints);

    this.rawMasteryEffectivenessSum += masteryEffectiveness;
    this.rawMasteryEffectivenessCount += 1;

    const hp = event.hitPoints;
    const remainingHealthMissing = event.maxHitPoints - hp;
    const heal = new HealingValue(event.amount, event.absorbed, event.overheal);
    const applicableMasteryPercentage = this.statTracker.currentMasteryPercentage * masteryEffectiveness;


    // The base healing of the spell (excluding any healing added by mastery)
    const baseHealingDone = heal.raw / (1 + applicableMasteryPercentage);
    const actualMasteryHealingDone = Math.max(0, heal.effective - baseHealingDone);
    this.totalMasteryHealingDone += actualMasteryHealingDone;

    // The max potential mastery healing if we had a mastery effectiveness of 100% on this spell. This does NOT include the base healing
    // Example: a heal that did 1,324 healing with 32.4% mastery with 100% mastery effectiveness will have a max potential mastery healing of 324.
    const maxPotentialRawMasteryHealing = baseHealingDone * this.statTracker.currentMasteryPercentage; // * 100% mastery effectiveness
    const maxPotentialRawMasteryGain = maxPotentialRawMasteryHealing - actualMasteryHealingDone;
    const maxPotentialMasteryGain = actualMasteryHealingDone + Math.min(remainingHealthMissing, maxPotentialRawMasteryGain);

    const adjustedMasteryEffectiveness = actualMasteryHealingDone / maxPotentialMasteryGain;
    if (!isNaN(adjustedMasteryEffectiveness)) {
      this.scaledMasteryEffectivenessSum += adjustedMasteryEffectiveness;
      this.scaledMasteryEffectivenessCount += 1;
    }

    this.masteryHealEvents.push({
      ...event,
      healthBeforeHeal,
      masteryEffectiveness,
      baseHealingDone,
      actualMasteryHealingDone,
      maxPotentialMasteryGain,
    });
    event.masteryEffectiveness = masteryEffectiveness;
  }

  // Totems count as pets, but are still affected by mastery.
  on_byPlayerPet_heal(event) {
    this.on_byPlayer_heal(event);
  }

  get masteryEffectivenessPercent() {
    return this.report.totalActualMasteryHealingDone / (this.report.totalMaxPotentialMasteryGain || 1);
  }

  statistic() {
    console.log('raw', this.rawMasteryEffectivenessAverage);
    console.log('scaling (health capped)', this.scaledMasteryEffectivenessAverage);
    console.log('total mastery healing done', this.owner.formatItemHealingDone(this.totalMasteryHealingDone));
    const masteryPercent = this.statTracker.currentMasteryPercentage;
    const avgEffectiveMasteryPercent = this.masteryEffectivenessPercent * masteryPercent;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEEP_HEALING.id} />}
        value={`${formatPercentage(this.masteryEffectivenessPercent)} %`}
        position={STATISTIC_ORDER.CORE(30)}
        label={(
          <dfn data-tip={`The percent of your mastery that you benefited from on average (so always between 0% and 100%). Since you have ${formatPercentage(masteryPercent)}% mastery, this means that on average your heals were increased by ${formatPercentage(avgEffectiveMasteryPercent)}% by your mastery.`}>
            Mastery benefit
          </dfn>
        )}
      />
    );
  }

  get report() {
    let totalHealingWithMasteryAffectedAbilities = 0;
    let totalActualMasteryHealingDone = 0;
    let totalMaxPotentialMasteryGain = 0;

    const statsByTargetId = this.masteryHealEvents.reduce((obj, event) => {
      // Update the fight-totals
      totalHealingWithMasteryAffectedAbilities += event.amount;
      totalActualMasteryHealingDone += event.actualMasteryHealingDone;
      totalMaxPotentialMasteryGain += event.maxPotentialMasteryGain;

      // Update the player-totals
      if (!obj[event.targetID]) {
        const combatant = this.combatants.players[event.targetID];
        obj[event.targetID] = {
          combatant,
          healingReceived: 0,
          healingFromMastery: 0,
          maxPotentialHealingFromMastery: 0,
        };
      }
      const playerStats = obj[event.targetID];
      playerStats.healingReceived += event.amount;
      playerStats.healingFromMastery += event.actualMasteryHealingDone;
      playerStats.maxPotentialHealingFromMastery += event.maxPotentialMasteryGain;

      return obj;
    }, {});

    return {
      statsByTargetId,
      totalHealingWithMasteryAffectedAbilities,
      totalActualMasteryHealingDone,
      totalMaxPotentialMasteryGain,
    };
  }

  tab() {
    return {
      title: 'Mastery',
      url: 'mastery',
      render: () => (
        <PlayerBreakdownTab
          report={this.report}
          playersById={this.owner.playersById}
        />
      ),
    };
  }
}

export default MasteryEffectiveness;
