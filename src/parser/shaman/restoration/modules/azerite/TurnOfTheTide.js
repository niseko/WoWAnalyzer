import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import StatTracker from 'parser/shared/modules/StatTracker';
import Haste from 'parser/shared/modules/Haste';
import BaseHealerAzerite from './BaseHealerAzerite';

const TIDAL_WAVE_HASTE = 0.3;
const TIDAL_WAVE_CRIT = 0.4;
const TURN_BONUS = 0.05;

/**
 * Turn of the Tide:
 * Both bonuses of Tidal Waves are increased by 5%, and spells affected by it heal for an additional 601.
 */

class TurnOfTheTide extends BaseHealerAzerite {
  static dependencies = {
    statTracker: StatTracker,
    haste: Haste,
  };
  static TRAIT = SPELLS.TURN_OF_THE_TIDE_TRAIT;
  static HEAL = SPELLS.TURN_OF_THE_TIDE_TRAIT;

  traitRawHealing = 0;
  currentCoefficient = 0;

  constructor(...args) {
    super(...args);
    this.active = this.hasTrait;
    if (!this.active) {
      return;
    }
    this.traitRawHealing = this.azerite.reduce((total, trait) => total + trait.rawHealing, 0);
    this.moreInformation = "The Tidal Wave bonus percentage does not stack and is only factored into the 1st trait";

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_WAVE), this.onHealingWave);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_SURGE_RESTORATION), this.onHealingSurge);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.cast);
    // todo check chaincasting for haste
  }

  cast(event) {
    console.log(event.spellPower);
  }

  onHealingWave(event) {
    const hasTidalWave = this.selectedCombatant.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, -1);
    if (!hasTidalWave) {
      return;
    }
    this.currentCoefficient = SPELLS.HEALING_WAVE.coefficient;

    // its just gonna be below GCD if you have flash flood already anyway
    const hasFlashFlood = this.selectedCombatant.hasBuff(SPELLS.FLASH_FLOOD_BUFF.id, event.timestamp, -1);
    if (hasFlashFlood) {
      this.parseHeal(event, 0);
      return;
    }
    const currentHaste = 1 + this.haste.current;
    const tidalWaveBonus = ((currentHaste + TIDAL_WAVE_HASTE + TURN_BONUS) / (currentHaste + TIDAL_WAVE_HASTE)) - 1;
    this.parseHeal(event, tidalWaveBonus);
  }

  onHealingSurge(event) {
    const hasTidalWave = this.selectedCombatant.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, -1);
    if (!hasTidalWave) {
      return;
    }
    this.currentCoefficient = SPELLS.HEALING_SURGE_RESTORATION.coefficient;
    const currentCrit = 1 + this.statTracker.currentCritPercentage;
    const tidalWaveBonus = ((currentCrit + TIDAL_WAVE_CRIT + TURN_BONUS) / (currentCrit + TIDAL_WAVE_CRIT)) - 1;
    this.parseHeal(event, tidalWaveBonus);
  }

  parseHeal(event, tidalWaveBonus) {
    // calculating the 5% bonus on the tidal wave effect, but only adding it to the first trait as it doesn't stack
    // the first trait is the last in the azerite array
    const tidalWaveHealing = (event.amount || 0 + event.overheal || 0 + event.absorbed || 0) * tidalWaveBonus;
    const actualHealing = Math.max(0,tidalWaveHealing - (event.overheal || 0));
    const overHealing = tidalWaveHealing - actualHealing;
    this.azerite[this.azerite.length - 1].healing += actualHealing;
    this.azerite[this.azerite.length - 1].overhealing += overHealing;

    // calculating the actual extra healing
    const currentIntellect = this.statTracker.currentIntellectRating;
    const spellHeal = this.currentCoefficient * currentIntellect;
    const traitComponent = this.traitRawHealing / (spellHeal + this.traitRawHealing);
    this._processHealing(event,traitComponent);
  }
}

export default TurnOfTheTide;
