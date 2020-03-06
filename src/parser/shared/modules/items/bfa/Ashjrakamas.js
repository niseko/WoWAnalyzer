import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import UptimeIcon from 'interface/icons/Uptime';
import PrimaryStatIcon from 'interface/icons/PrimaryStat';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { formatPercentage, formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

/**
 * Ashjra'kamas, Shroud of Resolve -
 * Equip: Your spells and abilities have a chance to increase your $pri by 1900 for 15 sec.
 */
const PROC_ADDED_ITEMLEVEL = 492;
const STATS = 3648;

class Ashjrakamas extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBack(ITEMS.ASHJRAKAMAS_SHROUD_OF_RESOLVE.id) && this.selectedCombatant.getItem(ITEMS.ASHJRAKAMAS_SHROUD_OF_RESOLVE.id).itemLevel >= PROC_ADDED_ITEMLEVEL;
    if (!this.active) {
      return;
    }

    // TODO check if this buff scales, hotfix notes make it sound static.
    //this.stats = calculatePrimaryStat(492, 3648, this.selectedCombatant.getItem(ITEMS.ASHJRAKAMAS_SHROUD_OF_RESOLVE.id).itemLevel);

    this.statTracker.add(SPELLS.DRACONIC_EMPOWERMENT.id, {
      intellect: STATS,
      strength: STATS,
      agility: STATS,
    });
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DRACONIC_EMPOWERMENT.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.ASHJRAKAMAS_SHROUD_OF_RESOLVE}>
          <PrimaryStatIcon stat={this.selectedCombatant.spec.primaryStat} /> <TooltipElement content={(
            <div>
              <UptimeIcon /> {formatPercentage(this.totalBuffUptime, 2)}% uptime
            </div>
          )}
          > {formatNumber(this.totalBuffUptime * STATS)} <small>average {this.selectedCombatant.spec.primaryStat} gained</small></TooltipElement><br />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default Ashjrakamas;
