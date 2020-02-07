import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Events, { ChangeStatsEvent, ApplyBuffStackEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import CriticalIcon from 'interface/icons/CriticalStrike';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

// https://www.warcraftlogs.com/reports/tq3D9ajfr24nbHFX#fight=3&type=auras&source=18&view=events 

class FlashOfInsight extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected readonly statTracker!: StatTracker;

  statAmount: number = 0;
  stack: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasCorruptionByName("Flash of Insight");
    if (!this.active) {
      return;
    }

    //this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.FLASH_OF_INSIGHT_T1.id) * T1_STATS;

    //options.statTracker.add(SPELLS.DEADLY_MOMENTUM_BUFF.id, {
    //  crit: this.statAmount,
    //});
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FLASH_OF_INSIGHT_BUFF), this.stackChange);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FLASH_OF_INSIGHT_BUFF), this.stackChange);
    this.addEventListener(Events.ChangeStats.by(SELECTED_PLAYER), this.changestats);
  }

  stackChange(event: ApplyBuffStackEvent | RemoveBuffStackEvent) {
    this.stack = event.stack;
    this.log(this.stack);
  }

  changestats(event: ChangeStatsEvent) {
    if (!event.delta.intellect) {
      return;
    }

    const intBefore = (event.before.intellect / (1 + (this.stack / 100)) / 1.05);
    const intAfter = (intBefore + event.delta.intellect) * (1 + (this.stack / 100)) * 1.05;

    this.log(`${event.after.intellect} ${intAfter.toFixed(0)}`);
  }

  addIntellect(baseInt: number, intGain: number) {
    return baseInt * (1 + intGain);
  }
  removeIntellect(baseInt: number, intLoss: number) {
    return (baseInt) / (1 + intLoss);
  }

  get weightedBuffUptime() {
    return this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.FLASH_OF_INSIGHT_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spell={SPELLS.FLASH_OF_INSIGHT_T1}>
          <CriticalIcon /> {this.weightedBuffUptime.toFixed(2)} <small>average Stacks</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FlashOfInsight;
