import React from 'react';

import SPELLS from 'common/SPELLS';
import EventEmitter from 'parser/core/modules/EventEmitter';
import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';

import Tab from 'interface/others/Tab';
import CooldownOverview from 'interface/others/CooldownOverview';
import Feeding from 'interface/others/Feeding';

import { ABILITIES_NOT_FEEDING_INTO_ASCENDANCE, ABILITIES_FEEDING_INTO_CBT } from '../../constants';


const debug = false;

class FeedingTracker extends CoreCooldownThroughputTracker {
  static dependencies = {
    ...CoreCooldownThroughputTracker.dependencies,
    eventEmitter: EventEmitter,
  };
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.ASCENDANCE_TALENT_RESTORATION,
      summary: [
        BUILT_IN_SUMMARY_TYPES.FEEDING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    },
    {
      spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.FEEDING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    },
  ];

  hasCBT = false;
  currentCloudburstOverheal = 0;
  cbtFeed = [];
  cbtTotals = { total: 0, totalEffective: 0 };

  hasAsc = false;
  ascFeed = [];
  ascTotals = { total: 0, totalEffective: 0 };

  processAll() {
    this.pastCooldowns
      .filter(cooldown => cooldown.end && !cooldown.processed)
      .forEach((cooldown) => {
        let feed = null;
        let totals = null;
        let feedingFactor = 0;
        if (cooldown.spell.id === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
          feed = this.cbtFeed;
          totals = this.cbtTotals;
          feedingFactor = 0.3;
        } else if (cooldown.spell.id === SPELLS.ASCENDANCE_TALENT_RESTORATION.id) {
          feed = this.ascFeed;
          totals = this.ascTotals;
          feedingFactor = 1.0;
        }

        let percentOverheal = 0;
        if ((cooldown.healing + cooldown.overheal) > 0) {
          percentOverheal = cooldown.overheal / (cooldown.healing + cooldown.overheal);
        }

        Object.keys(cooldown.feed).forEach((spellId) => {
          spellId = Number(spellId);
          if (!feed[spellId]) {
            feed[spellId] = [];
            feed[spellId].healing = 0;
            feed[spellId].effectiveHealing = 0;
            feed[spellId].name = cooldown.feed[spellId].name;
            feed[spellId].icon = cooldown.feed[spellId].icon;
          }
          const rawHealing = cooldown.feed[spellId].healing;
          const effectiveHealing = rawHealing * (1 - percentOverheal) * feedingFactor;
          feed[spellId].healing += rawHealing;
          feed[spellId].effectiveHealing += effectiveHealing;
          totals.total += rawHealing;
          totals.totalEffective += effectiveHealing;
        });

        //this.generateFeedEvents(cooldown, feedingFactor, percentOverheal);

        cooldown.processed = true;
      });
  }

  // Fabricate new events to make it easy to listen to just feed heal events while being away of the original heals. 
  // While we could also modify the original heal event and add a reference to the feed amount, this would be less clean as mutating objects makes things harder and more confusing to use, and may lead to conflicts.
  generateFeedEvent(event, cooldown, percentOverheal) {
    let feedingFactor = 0;
    if (cooldown.spell.id === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
      feedingFactor = 0.3;
    } else if (cooldown.spell.id === SPELLS.ASCENDANCE_TALENT_RESTORATION.id) {
      feedingFactor = 1.0;
    }

    const eventFeed = ((event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0)) * feedingFactor * (1 - percentOverheal);

    this.eventEmitter.fabricateEvent({
      ...event,
      type: 'feed_heal',
      feed: eventFeed,
    }, cooldown.spell);
  }

  getIndirectHealing(spellId) {
    let healing = 0;
    if (this.cbtFeed[spellId]) {
      healing += this.cbtFeed[spellId].effectiveHealing || 0;
    }

    if (this.ascFeed[spellId]) {
      healing += this.ascFeed[spellId].effectiveHealing || 0;
    }

    return healing;
  }

  addNewCooldown(spell, timestamp) {
    const cooldown = {
      ...spell,
      start: timestamp,
      end: null,
      processed: false,
      healing: 0,
      overheal: 0,
      feed: [],
      events: [],
    };

    this.pastCooldowns.push(cooldown);
    this.activeCooldowns.push(cooldown); // ?

    return cooldown;
  }

  constructor(...args) {
    super(...args);

    this.hasCBT = this.selectedCombatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id);
    this.hasAsc = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_RESTORATION.id);

    // Store cooldown info in case it was cast before pull. If we see a cast before it expires, all data in it is discarded.
    // Needs new solution maybe
/*     this.hasCBT && (this.lastCBT = this.addNewCooldown({
      spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    }, this.owner.fight.start_time));
    this.hasAsc && (this.lastAsc = this.addNewCooldown({
      spell: SPELLS.ASCENDANCE_TALENT_RESTORATION,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    }, this.owner.fight.start_time)); */
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    const spell = this.constructor.cooldownSpells.find(cooldownSpell => cooldownSpell.spell.id === spellId);
    if (!spell) {
      return;
    }

    const cooldown = this.addNewCooldown(spell, event.timestamp);

    if (spellId === SPELLS.ASCENDANCE_TALENT_RESTORATION.id) {
      this.lastAsc = cooldown;
    }
    if (spellId === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
      this.lastCBT = cooldown;
    }
  }

  on_toPlayer_removebuff(event) {
    this.endCooldown(event);
    this.processAll();
  }

  on_finished() {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.end = this.owner.fight.end_time;

      // If cloudburst is still up at the end of the fight, it didn't do any healing, so dont process it.
      if (cooldown.spell.id === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
        cooldown.processed = true;
      }
    });
    this.activeCooldowns = [];

    //this.processAll();

    console.log(this.pastCooldowns);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
      this.currentCloudburstOverheal = event.overhealRatio || 0;
    }

    super.on_byPlayer_cast(event);
  }

  removeLastCooldown(spellId) {
    const indexactiveCooldowns = this.activeCooldowns.findIndex(cooldown => cooldown.spell.id === spellId);

    const reverseIndexCooldowns = [...this.pastCooldowns].reverse().findIndex(cooldown => cooldown.spell.id === spellId);
    const indexCooldowns = this.pastCooldowns.length - reverseIndexCooldowns - 1;

    if (indexactiveCooldowns !== -1 && indexCooldowns !== -1) {
      this.activeCooldowns.splice(indexactiveCooldowns, 1);
      this.pastCooldowns.splice(indexCooldowns, 1);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (event.ability.guid === SPELLS.CLOUDBURST_TOTEM_HEAL.id && this.lastCBT) {
      this.lastCBT.healing += (event.amount || 0) + (event.absorbed || 0);
      this.lastCBT.overheal += (event.overheal || 0);
    } else if (event.ability.guid === SPELLS.ASCENDANCE_HEAL.id && this.lastAsc) {
      this.lastAsc.healing += (event.amount || 0) + (event.absorbed || 0);
      this.lastAsc.overheal += (event.overheal || 0);
    }

    const healingDone = (event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0);
    this.activeCooldowns.forEach((cooldown) => {
      const cooldownId = cooldown.spell.id;
      if ((cooldownId === SPELLS.CLOUDBURST_TOTEM_TALENT.id && ABILITIES_FEEDING_INTO_CBT.includes(spellId)) ||
        (cooldownId === SPELLS.ASCENDANCE_TALENT_RESTORATION.id && !ABILITIES_NOT_FEEDING_INTO_ASCENDANCE.includes(spellId))) {
        if (!cooldown.feed[spellId]) {
          cooldown.feed[spellId] = [];
          cooldown.feed[spellId].healing = 0;
          cooldown.feed[spellId].name = event.ability.name;
          cooldown.feed[spellId].icon = event.ability.abilityIcon;
        }
        cooldown.feed[spellId].healing += healingDone;
        cooldown.events.push(event);
        this.generateFeedEvent(event, cooldown, this.currentCloudburstOverheal); // needs ascendance
      }
    });
  }

  tab() {
    return {
      title: 'Feeding',
      url: 'feeding',
      render: () => (
        <Tab>
          <Feeding
            cooldownThroughputTracker={this} //
            fightStart={this.owner.fight.start_time}
            fightEnd={this.owner.fight.end_time}
            cooldowns={this.pastCooldowns}
          />
        </Tab>
      ),
    };
  }
}

export default FeedingTracker;
