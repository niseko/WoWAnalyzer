import React from 'react';

import ItemLink from 'common/ItemLink';

import Analyzer from 'Parser/Core/Analyzer';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

// Example logs with missing gems:
// https://www.warcraftlogs.com/reports/gxXHq9r8ZhaTGNBQ#fight=8&source=202

const HAS_GEM_SLOT_BONUS_ID = 1808;

class GemChecker extends Analyzer {
  static GEMABLE_SLOTS = {
    0: 'HEAD',
    1: 'NECK', // REMOVE once bfa launches
    2: 'SHOULDER',
    4: 'CHEST',
    5: 'WAIST',
    6: 'LEGS',
    7: 'FEET',
    8: 'WRISTS',
    9: 'HANDS',
    10: 'FINGER1',
    11: 'FINGER2',
    12: 'TRINKET1',
    13: 'TRINKET2',
    14: 'BACK',
  };
  static LEGENDARY_GEM_SLOTS = { // always have gems but no gem bonus ID
    1: 'NECK',
    10: 'FINGER1',
    11: 'FINGER2',
  }
  static MAX_GEM_IDS = [
    151584, // Mastery
    151583, // Haste
    151585, // Versatility
    151580, // Critical Strike

    195879, // Agility
    195880, // Intellect
    195878, // Strength
  ];

  numGearWithGemSlots = 0;

  get gemableGear() {
    this.numGearWithGemSlots = 0;
    return Object.keys(this.constructor.GEMABLE_SLOTS).reduce((obj, slot) => {
      const currentSlot = this.selectedCombatant._getGearItemBySlotId(slot);
      if (currentSlot.bonusIDs && currentSlot.bonusIDs.includes(HAS_GEM_SLOT_BONUS_ID)) {
        this.numGearWithGemSlots++;
        obj[slot] = currentSlot;
      } else if (currentSlot.quality === 5 && this.constructor.LEGENDARY_GEM_SLOTS.hasOwnProperty(slot)) {
        this.numGearWithGemSlots++;
        obj[slot] = currentSlot;
      }
      return obj;
    }, {});
  }
  get numGemableGear() {
    return this.numGearWithGemSlots;
  }
  get slotsMissingGem() {
    const gear = this.gemableGear;
    return Object.keys(gear).filter(slot => !this.hasGem(gear[slot]));
  }
  get numSlotsMissingGem() {
    return this.slotsMissingGem.length;
  }
  get slotsMissingMaxGem() {
    const gear = this.gemableGear;
    return Object.keys(gear).filter(slot => this.hasGem(gear[slot]) && !this.hasMaxGem(gear[slot]));
  }
  get numSlotsMissingMaxGem() {
    return this.slotsMissingMaxGem.length;
  }
  hasGem(item) {
    return !!item.gems;
  }
  hasMaxGem(item) {
    // needs to be changed if they add multiple gem slots again, none of the currently available ones are used in raiding
    return this.constructor.MAX_GEM_IDS.includes(item.gems[0].id);
  }

  suggestions(when) {
    const gear = this.gemableGear;
    // iterating with keys instead of value because the values don't store what slot is being looked at
    Object.keys(gear)
      .forEach(slot => {
        const item = gear[slot];
        const slotName = this.constructor.GEMABLE_SLOTS[slot];
        const hasGem = this.hasGem(item);

        when(hasGem).isFalse()
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(
              <React.Fragment>
                Your <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>{slotName}</ItemLink> has an empty socket. Insert a strong gem to very easily increase your throughput slightly.
              </React.Fragment>
            )
              .icon(item.icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
          });

        const noMaxGem = hasGem && !this.hasMaxGem(item);
        when(noMaxGem).isTrue()
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(
              <React.Fragment>
                Your <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>{slotName}</ItemLink> has a cheap gem in the socket. Insert a strong gem to very easily increase your throughput slightly.
              </React.Fragment>
            )
              .icon(item.icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
          });
      });
  }
}

export default GemChecker;
