import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreChecklist, { Requirement, Rule } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
// general:
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import GemChecker from 'Parser/Core/Modules/Items/GemChecker';
// features:
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import AlwaysBeCasting from '../Features/AlwaysBeCasting';
// spells:
import Mindbender from '../Spells/Mindbender';
import ShadowWordPain from '../Spells/ShadowWordPain';
import VampiricTouch from '../Spells/VampiricTouch';
import Voidform from '../Spells/Voidform';
import VoidTorrent from '../Spells/VoidTorrent';
// import ITEMS from 'common/ITEMS';
// import ItemLink from 'common/ItemLink';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    // general:
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
    gemChecker: GemChecker,

    // features:
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,

    // spells:
    mindbender: Mindbender,
    shadowWordPain: ShadowWordPain,
    vampiricTouch: VampiricTouch,
    voidform: Voidform,
    voidTorrent: VoidTorrent,
  };

  rules = [
    new Rule({
      name: <React.Fragment>Maximize <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> & <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> uptime</React.Fragment>,
      description: (
        <React.Fragment>
          Both <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> and <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> duration extends when the target or a nearby target gets hit by <SpellLink id={SPELLS.VOID_BOLT.id} />.
          Due to this, you often only need to apply these spells to new targets and refresh them on targets that are too far away from your primary target.
        </React.Fragment>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: `Shadow word: Pain uptime`,
            check: () => this.shadowWordPain.suggestionThresholds,
          }),
          new Requirement({
            name: `Vampiric Touch uptime`,
            check: () => this.vampiricTouch.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: <React.Fragment>Minimize casting downtime</React.Fragment>,
      description: (
        <React.Fragment>
          Try to minimize your time not casting. Use your core spells on cooldown and fillers when they are not available. If you know you have an upcoming position requirement, stutterstep with each <SpellLink id={SPELLS.VOID_BOLT.id} /> cast towards that location. During high movement you can use <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> as a filler.
        </React.Fragment>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: `Casting downtime`,
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use core spells as often as possible',
      description: <React.Fragment>Spells such as <SpellLink id={SPELLS.VOID_BOLT.id} />, <SpellLink id={SPELLS.MIND_BLAST.id} /> are your most important spells. Try to cast them as much as possible.</React.Fragment>,
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.VOID_BOLT,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.MIND_BLAST,
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),
    new Rule({
      name: <React.Fragment>Maximize <SpellLink id={SPELLS.VOIDFORM.id} /> stacks</React.Fragment>,
      description: (
        <React.Fragment>
          Your Voidforms are an important part of your overall damage.
          Try to get over 50 stacks every Voidform with proper <SpellLink id={SPELLS.VOID_TORRENT_TALENT.id} /> and <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> usage.
          Use Void torrent early on and Mindbender around 30 Voidform stacks.
        </React.Fragment>
      ),
      performanceMethod: 'average',
      requirements: () => {
        return [
          new Requirement({
            name: 'Uptime',
            check: () => this.voidform.suggestionUptimeThresholds,
          }),
          ...this.voidform.voidforms.filter(voidform => !voidform.excluded).map((voidform, index) => {
            return (
              new Requirement({
                name: `Voidform #${index + 1} stacks`,
                check: () => this.voidform.suggestionStackThresholds(voidform),
              })
            );
          }),
        ];
      },
    }),
    this.mindbender.active && new Rule({
      name: <React.Fragment>Maximize <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> effectiveness</React.Fragment>,
      description: (
        <React.Fragment>
          Mindbender has a big impact on your <SpellLink id={SPELLS.VOIDFORM.id} /> durations.
          Try to use Mindbender a few seconds before you are about to drop out from the Voidform, normally around 25 stacks. Never use Mindbender outside of Voidform.
          <br />Using Mindbender too early shortens your Voidform and might thus greatly affect the next voidforms (by still having it on cooldown).
        </React.Fragment>
      ),
      requirements: () => {
        return this.mindbender.mindbenders.map((mindbender, index) => {
          return (
            new Requirement({
              name: `Mindbender #${index + 1} used at # stacks`,
              check: () => this.mindbender.suggestionStackThresholds(mindbender),
            })
          );
        });
      },
    }),
    this.voidTorrent.active && new Rule({
      name: <React.Fragment>Maximize <SpellLink id={SPELLS.VOID_TORRENT_TALENT.id} /> effectiveness</React.Fragment>,
      description: (
        <React.Fragment>
          Void Torrent has a big impact on your overall damage.
          Void Torrent delays insanity drain, effectively extending Voidform by at least the channeled duration increasing your overall haste, Voidform uptime and the damage of <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> and <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} />.
          Try to use one Void Torrent in each <SpellLink id={SPELLS.VOIDFORM.id} /> and plan ahead to avoid interrupting it.
        </React.Fragment>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: 'Channeling time lost',
            check: () => this.voidTorrent.suggestionThresholds,
          }),
          new GenericCastEfficiencyRequirement({
            name: 'Time on cooldown',
            spell: SPELLS.VOID_TORRENT_TALENT,
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
