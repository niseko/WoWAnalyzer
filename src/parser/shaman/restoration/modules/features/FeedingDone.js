import React from 'react';

import Panel from 'interface/statistics/Panel';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import HealingValue from 'parser/shared/modules/HealingValue';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

import CooldownThroughputTracker from './CooldownThroughputTracker';
import BeaconHealingBreakdown from './BeaconHealingBreakdown';

class BeaconHealingDone extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
    healingDone: HealingDone,
  };

  _totalBeaconHealing = new HealingValue();
  _beaconHealingBySource = {};

  constructor(options) {
    super(options);
    //this.addEventListener(this.beaconHealSource.beacontransfer.by(SELECTED_PLAYER), this._onBeaconTransfer);
  }

  _onBeaconTransfer(event) {
    this._totalBeaconHealing = this._totalBeaconHealing.add(event.amount, event.absorbed, event.overheal);

    const source = event.originalHeal;
    const spellId = source.ability.guid;
    let sourceHealing = this._beaconHealingBySource[spellId];
    if (!sourceHealing) {
      sourceHealing = this._beaconHealingBySource[spellId] = {
        ability: source.ability,
        healing: new HealingValue(),
      };
    }
    sourceHealing.healing = sourceHealing.healing.add(event.amount, event.absorbed, event.overheal);
  }

  statistic() {
    return (
      <Panel
        title="Cloudburst healing sources"
        explanation={(
          <>
            explanation
          </>
        )}
        position={115}
        pad={false}
      >
        <BeaconHealingBreakdown
          totalHealingDone={this.healingDone.total}
          totalBeaconHealing={this.cooldownThroughputTracker.cbtTotals}
          beaconHealingBySource={this.cooldownThroughputTracker.cbtFeed}
          fightDuration={this.owner.fightDuration}
        />
      </Panel>
    );
  }
}

export default BeaconHealingDone;
