import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Abilities from './modules/Abilities';
import Stormbringer from './modules/core/Stormbringer';

import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/Checklist/Module';
import Flametongue from './modules/core/Flametongue';
import FlametongueRefresh from './modules/core/FlametongueRefresh';
import Rockbiter from './modules/core/Rockbiter';

import CrashingStorm from './modules/talents/CrashingStorm';
import EarthenSpike from './modules/talents/EarthenSpike';
import FuryOfAir from './modules/talents/FuryOfAir';
import ForcefulWinds from './modules/talents/ForcefulWinds';
import Hailstorm from './modules/talents/Hailstorm';
import HotHand from './modules/talents/HotHand';
import Landslide from './modules/talents/Landslide';
import SearingAssault from './modules/talents/SearingAssault';
import Sundering from './modules/talents/Sundering';
import TotemMastery from './modules/talents/TotemMastery';

import SpiritWolf from '../shared/talents/SpiritWolf';
import EarthShield from '../shared/talents/EarthShield';
import StaticCharge from '../shared/talents/StaticCharge';
import AnkhNormalizer from '../shared/normalizers/AnkhNormalizer';
import AstralShift from '../shared/spells/AstralShift';
import PackSpirit from '../shared/azerite/PackSpirit';
import SereneSpirit from '../shared/azerite/SereneSpirit';
import NaturalHarmony from '../shared/azerite/NaturalHarmony';
import AncestralResonance from '../shared/azerite/AncestralResonance';

//Resources
import MaelstromDetails from '../shared/maelstromchart/MaelstromDetails';
import MaelstromTracker from '../shared/maelstromchart/MaelstromTracker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // ShamanCore
    flametongue: Flametongue,
    rockbiter: Rockbiter,
    flametongueRefresh: FlametongueRefresh,
    stormbringer: Stormbringer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,

    //Talents
    crashingStorm: CrashingStorm,
    earthenSpike: EarthenSpike,
    forcefulWinds: ForcefulWinds,
    furyOfAir: FuryOfAir,
    hailstorm: Hailstorm,
    hotHand: HotHand,
    landslide: Landslide,
    searingAssault: SearingAssault,
    sundering: Sundering,
    totemMastery: TotemMastery,

    earthShield: EarthShield,
    spiritWolf: SpiritWolf,
    staticCharge: StaticCharge,
    ankhNormalizer: AnkhNormalizer,
    astralShift: AstralShift,
    packSpirit: PackSpirit,
    sereneSpirit: SereneSpirit,
    naturalHarmony: NaturalHarmony,
    ancestralResonance: AncestralResonance,

    maelstromTracker: MaelstromTracker,
    maelstromDetails: MaelstromDetails,

  };
}

export default CombatLogParser;
