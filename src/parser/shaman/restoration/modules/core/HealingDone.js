import SPELLS from 'common/SPELLS';

import CoreHealingDone from 'parser/shared/modules/throughput/HealingDone';

import Combatants from 'parser/shared/modules/Combatants';

class HealingDone extends CoreHealingDone {
  static dependencies = {
    combatants: Combatants,
  };
  on_heal(event) {
    if (!this.combatants.getEntity(event)) {
      return;
    }
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      this._addHealing(event, event.amount, event.absorbed, event.overheal);
    }
  }
  on_damage(event) {
    // Removing Spirit link from total healing done by subtracting the damage done of it
    const spellId = event.ability.guid;
    if (!this.owner.byPlayerPet(event)) {
      return;
    }
    if (spellId === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id) {
      this._subtractHealing(event, event.amount, 0, 0);
    }
  }
}

export default HealingDone;
