import EventsNormalizer from 'parser/core/EventsNormalizer';

import SPELLS from 'common/SPELLS';

const MAX_DELAY = 17000;
const CBT_DELAY = 15000;

/*
* Cloudburst Totem had some weird behaviour (even if it rarely happens), 
* because of that you can have a cast event without heal events.
* This happens if everyone in range is at 100% HP, it will just not heal at all.
*
* That throws off the CooldownThroughputTracker, gathering all events
* until the CBT after that explodes and giving results that are completely wrong.
*
* This Normalizer creates a 100% overhealed healing event where the heal would have been,
* if no healing events happened within 20 seconds after casting the totem.
 */

class CloudburstCastNormalizer extends EventsNormalizer {

  fabricatedEvent = null;
  precast = true;
  precastEvent = null;

  normalize(events) {
    if (!this.selectedCombatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id)) {
      return events;
    }
    const fixedEvents = [];

    events.forEach((event, eventIndex) => {

      if(this.fabricatedEvent) {
        if(event.timestamp >= this.fabricatedEvent.timestamp) {
          fixedEvents.push(this.fabricatedEvent);
          this.fabricatedEvent = null;
        }
      }

      fixedEvents.push(event);

      if (event.type === 'cast' && event.ability.guid === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
        this.precast = false;
        const castTimestamp = event.timestamp;
        let recallTimestamp = null;
        // Look ahead through the events to see if there is an CLOUDBURST_TOTEM_HEAL within a 20 second period
        for (let nextEventIndex = eventIndex; nextEventIndex < events.length-1; nextEventIndex += 1) {
          const nextEvent = events[nextEventIndex];
          if ((nextEvent.timestamp - castTimestamp) > MAX_DELAY) {
            // No CLOUDBURST_TOTEM_HEAL found within the period, meaning this cast wasn't able to find targets and did not have any healing events -> create a 100% overheal event
            const newTimestamp = (recallTimestamp) ? recallTimestamp : event.timestamp+CBT_DELAY;
            this.fabricatedEvent = {
              timestamp: newTimestamp,
              type: "heal",
              sourceID: event.sourceID,
              targetID: event.sourceID,
              sourceIsFriendly: true,
              targetIsFriendly: true,
              ability: {
                abilityIcon: SPELLS.CLOUDBURST_TOTEM_HEAL.icon,
                guid: SPELLS.CLOUDBURST_TOTEM_HEAL.id,
                name: SPELLS.CLOUDBURST_TOTEM_HEAL.name,
                type: 8,
              },
              amount: 0,
              overheal: 1,
              hitType: 1,
              hitPoints: event.maxHitPoints,
              maxHitPoints: event.maxHitPoints,
              __fabricated: true,
            };
            break;
          // new cast or recall point, whichever comes first
          } else if (nextEvent.type === 'cast' && (nextEvent.ability.guid === SPELLS.CLOUDBURST_TOTEM_RECALL.id || nextEvent.ability.guid === SPELLS.CLOUDBURST_TOTEM_TALENT.id)) {
            recallTimestamp = recallTimestamp ? recallTimestamp : nextEvent.timestamp;
            continue;
          } else if (nextEvent.type === 'heal' && nextEvent.ability.guid === SPELLS.CLOUDBURST_TOTEM_HEAL.id) {
            // CLOUDBURST_TOTEM_HEAL found, this was fine
            break;
          }
        }
      }
      if ((event.timestamp <= MAX_DELAY) && ((event.type === 'cast' && event.ability.guid === SPELLS.CLOUDBURST_TOTEM_RECALL.id) || (event.type === 'heal' && event.ability.guid === SPELLS.CLOUDBURST_TOTEM_HEAL.id))) {
        if (this.precast) {
          this.precastEvent = {
            //
          };
        }
      }
    });
    // if precast event, add to start of fixedevents
    // this needs to happen before the feed normalizer though
    return fixedEvents;
  }
}
export default CloudburstCastNormalizer;
