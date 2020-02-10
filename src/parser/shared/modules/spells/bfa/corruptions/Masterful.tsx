import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

const T1_MULTIPLIER = .06;
const T2_MULTIPLIER = .09;
const T3_MULTIPLIER = .12;

class Masterful extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected readonly statTracker!: StatTracker;

  statMultiplier: number = 1;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasCorruptionByName("Masterful");
    if (!this.active) {
      return;
    }

    this.statMultiplier += this.selectedCombatant.getCorruptionCount(SPELLS.MASTERFUL_T1.id) * T1_MULTIPLIER;
    this.statMultiplier += this.selectedCombatant.getCorruptionCount(SPELLS.MASTERFUL_T2.id) * T2_MULTIPLIER;
    this.statMultiplier += this.selectedCombatant.getCorruptionCount(SPELLS.MASTERFUL_T3.id) * T3_MULTIPLIER;

    options.statTracker.addStatMultiplier("mastery", this.statMultiplier);
  }

  // TODO add statistic
}

export default Masterful;
