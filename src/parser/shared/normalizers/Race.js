import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';

// TODO add zandalari and kultiran
const RACE_ABILITIES = {
  Human: [SPELLS.EVERY_MAN_FOR_HIMSELF.id],
  Orc: [SPELLS.BLOOD_FURY_SPELL.id, SPELLS.BLOOD_FURY_SPELL_AND_PHYSICAL.id, SPELLS.BLOOD_FURY_PHYSICAL.id],
  Dwarf: [SPELLS.STONEFORM.id, SPELLS.STONEFORM_BUFF.id, SPELLS.MIGHT_OF_THE_MOUNTAIN.id],
  NightElf: [SPELLS.SHADOWMELD.id],
  Undead: [SPELLS.TOUCH_OF_THE_GRAVE.id, SPELLS.WILL_OF_THE_FORSAKEN.id, SPELLS.CANNIBALIZE.id],
  Tauren: [SPELLS.WAR_STOMP.id],
  Gnome: [SPELLS.ESCAPE_ARTIST.id],
  Troll: [SPELLS.BERSERKING.id],
  Goblin: [SPELLS.ROCKET_JUMP.id, SPELLS.ROCKET_BARRAGE.id, SPELLS.PACK_HOBGOBLIN.id],
  BloodElf: [SPELLS.ARCANE_TORRENT_MANA1.id, SPELLS.ARCANE_TORRENT_MANA2.id, SPELLS.ARCANE_TORRENT_MANA3.id, SPELLS.ARCANE_TORRENT_RAGE.id, SPELLS.ARCANE_TORRENT_ENERGY.id, SPELLS.ARCANE_TORRENT_RUNIC_POWER.id, SPELLS.ARCANE_TORRENT_MONK.id, SPELLS.ARCANE_TORRENT_FOCUS.id, SPELLS.ARCANE_TORRENT_FURY.id],
  Draenei: [SPELLS.GIFT_OF_THE_NAARU_DK.id, SPELLS.GIFT_OF_THE_NAARU_HUNTER.id, SPELLS.GIFT_OF_THE_NAARU_MAGE.id, SPELLS.GIFT_OF_THE_NAARU_MONK.id, SPELLS.GIFT_OF_THE_NAARU_PALADIN.id, SPELLS.GIFT_OF_THE_NAARU_PRIEST.id, SPELLS.GIFT_OF_THE_NAARU_SHAMAN.id, SPELLS.GIFT_OF_THE_NAARU_WARRIOR.id],
  Worgen: [SPELLS.DARKFLIGHT.id, SPELLS.TWO_FORMS.id],
  PandarenNeutral: [SPELLS.QUAKING_PALM.id],
  Nightborne: [SPELLS.CANTRIPS.id,SPELLS.ARCANE_PULSE.id],
  HighmountainTauren: [SPELLS.BULL_RUSH.id],
  VoidElf: [SPELLS.SPATIAL_RIFT_INITIAL.id, SPELLS.SPATIAL_RIFT_TELEPORT.id, SPELLS.ENTROPIC_EMBRACE_BUFF.id, SPELLS.ENTROPIC_EMBRACE_DAMAGE.id],
  LightforgedDraenei: [SPELLS.LIGHTS_RECKONING.id, SPELLS.LIGHTS_JUDGMENT.id, SPELLS.FORGE_OF_LIGHT.id],
  DarkIronDwarf: [SPELLS.FIREBLOOD.id],
  MagharOrc: [SPELLS.ANCESTRAL_CALL.id, SPELLS.RICTUS_OF_THE_LAUGHING_SKULL.id, SPELLS.ZEAL_OF_THE_BURNING_BLADE.id, SPELLS.FEROCITY_OF_THE_FROSTWOLF.id, SPELLS.MIGHT_OF_THE_BLACKROCK.id],
};
/**
 */
class Race extends EventsNormalizer {
  normalize(events) {
    events.forEach(event => {
      if (!this.owner.byPlayer(event)) {
        return;
      }

      if (event.type === 'begincast' || event.type === 'cast' || event.type === 'applybuff') { // and all the other buff things
        if (Object.values(RACE_ABILITIES).some(spell => spell.some(id => id === event.ability.guid))) {
          this.owner.characterProfile.race = RACES.HighmountainTauren.id;
          console.log(this.selectedCombatant._combatantInfo);
        }
      }
    });
    return events;
  }
}

export default Race;
