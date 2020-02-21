import SPELLS from 'common/SPELLS/index';
import Events, { ApplyBuffStackEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

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

    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FLASH_OF_INSIGHT_BUFF), this.stackChange);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FLASH_OF_INSIGHT_BUFF), this.stackChange);
  }

  stackChange(event: ApplyBuffStackEvent | RemoveBuffStackEvent) {
    this.log(this.stack);
    if (this.stack === 0) {
      this.statTracker.addStatMultiplier("intellect", (1 + event.stack / 100), false);
      this.stack = event.stack;
      return;
    }
    
    this.statTracker.removeStatMultiplier("intellect", (1 + (this.stack / 100)), true);
    this.statTracker.addStatMultiplier("intellect", (1 + (event.stack / 100)), true);

    //if (event.stack > this.stack) { // THIS IS NOT THE SAME AS REMOVING AND THEN ADDING; FIX
    //  this.log(`adding ${(event.stack - this.stack)}`);
    //  this.statTracker.addStatMultiplier("intellect", (1 + ((event.stack - this.stack) / 100)), true);
    //} else {
    //  this.log(`removing ${(this.stack - event.stack)}`);
    //  this.statTracker.removeStatMultiplier("intellect", (1 + ((this.stack - event.stack) / 100)), true);
    //}
    this.stack = event.stack;
  }

  // TODO add statistic

  //statistic() {
  //  return (
  //    <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
  //      <BoringSpellValueText spell={SPELLS.FLASH_OF_INSIGHT_T1}>
  //        <CriticalIcon /> {this.weightedBuffUptime.toFixed(2)} <small>average Stacks</small>
  //      </BoringSpellValueText>
  //    </Statistic>
  //  );
  //}
}

export default FlashOfInsight;
