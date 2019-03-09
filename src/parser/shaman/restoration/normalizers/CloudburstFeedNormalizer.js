import EventsNormalizer from 'parser/core/EventsNormalizer';

import SPELLS from 'common/SPELLS';

const MAX_DELAY = 20000;

/**
 * 
*/

class CloudburstFeedNormalizer extends EventsNormalizer {

  fabricatedEvent = null;

  normalize(events) {
    if (!this.selectedCombatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id)) {
      return events;
    }

    let healing = null;
    let overhealing = null;

    // go through first x seconds first to check for prepull casts
    // if cast, break out
    // if heal or recall create a cast event at pull

    events.forEach((event, eventIndex) => {
      if (event.type === 'cast' && event.ability.guid === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
        const castTimestamp = event.timestamp;
        healing = null;
        overhealing = null;

        // Look ahead through the events to see if there is an CLOUDBURST_TOTEM_HEAL within a 20 second period
        for (let nextEventIndex = eventIndex; nextEventIndex < events.length-1; nextEventIndex += 1) {
          const nextEvent = events[nextEventIndex];

          if ((nextEvent.timestamp - castTimestamp) > MAX_DELAY) {
            event.overhealRatio = overhealing / (healing + overhealing);
            //event.__modified = true;
            break;
          } else if (nextEvent.type === 'heal' && nextEvent.ability.guid === SPELLS.CLOUDBURST_TOTEM_HEAL.id) {
            healing += nextEvent.amount + (nextEvent.absorbed || 0);
            overhealing += nextEvent.overheal || 0;
          }
        }
      }
    });

    return events;
  }

}
export default CloudburstFeedNormalizer;
