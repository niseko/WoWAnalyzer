import SPELLS from 'common/SPELLS/index';
import RACES from 'game/RACES';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/shared/modules/Abilities';

/**
 * Charge forward for 1 sec, knocking enemies down for 1.5 sec.
 */
class BullRush extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.race === RACES.HighmountainTauren;
    if (!this.active) {
      return;
    }

    this.abilities.add({
      spell: SPELLS.BULL_RUSH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      cooldown: 120,
      gcd: {
        base: 1500,
      },
    });
  }
}

export default BullRush;
