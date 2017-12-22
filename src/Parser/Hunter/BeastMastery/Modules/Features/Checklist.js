import React from 'react';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import AlwaysBeCasting from 'Parser/Hunter/BeastMastery/Modules/Features/AlwaysBeCasting';
import AMurderOfCrows from 'Parser/Hunter/BeastMastery/Modules/Talents/AMurderOfCrows';
import SpellLink from 'common/SpellLink';
import Icon from "common/Icon";
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import DireBeast from 'Parser/Hunter/BeastMastery/Modules/Spells/DireBeast/DireBeast';
import BestialWrathAverageFocus from 'Parser/Hunter/BeastMastery/Modules/Spells/BestialWrath/BestialWrathAverageFocus';
import KillerCobra from 'Parser/Hunter/BeastMastery/Modules/Talents/KillerCobra';
import AspectOfTheBeast from 'Parser/Hunter/BeastMastery/Modules/Talents/AspectOfTheBeast';
import AspectOfTheWild from 'Parser/Hunter/BeastMastery/Modules/Spells/AspectOfTheWild';
import DireFrenzy from 'Parser/Hunter/BeastMastery/Modules/Talents/DireFrenzy';

class Checklist extends CoreChecklist {
  static dependencies = {
    combatants: Combatants,

    //general
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,

    //features:
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    enchantChecker: EnchantChecker,

    //talents
    aMurderOfCrows: AMurderOfCrows,
    killerCobra: KillerCobra,
    aspectOfTheBeast: AspectOfTheBeast,

    //Spells
    aspectOfTheWild: AspectOfTheWild,
    direBeast: DireBeast,
    direFrenzy: DireFrenzy,
    bestialWrathAverageFocus: BestialWrathAverageFocus,
  };

  rules = [
    new Rule({
      name: 'Use core spells as often as possible',
      description: <Wrapper>Spells such as <SpellLink id={SPELLS.KILL_COMMAND.id} icon /> and <SpellLink id={SPELLS.DIRE_BEAST.id} icon /> should be used on cooldown. <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> should never be capping stacks, but you also want to maximize buff uptime by spreading out the casts as much as possible. You'll want as many good casts of <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon />, <SpellLink id={SPELLS.TITANS_THUNDER.id} icon /> and <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} icon /> as possible - this is achieved by lining them up with <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> for each cast, and in preparation for each <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> you want to have saved up some focus. <a href="https://www.icy-veins.com/wow/beast-mastery-hunter-pve-dps-rotation-cooldowns-abilities" target="_blank" rel="noopener noreferrer">More info.</a></Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DIRE_BEAST,
            when: !combatant.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DIRE_FRENZY_TALENT,
            when: combatant.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.KILL_COMMAND,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BESTIAL_WRATH,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TITANS_THUNDER,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ASPECT_OF_THE_WILD,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BARRAGE_TALENT,
            when: combatant.hasTalent(SPELLS.BARRAGE_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper> Use your Dire ability properly </Wrapper>,
      description: <Wrapper>Using either <SpellLink id={SPELLS.DIRE_BEAST.id} icon /> or <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> properly is a key to achieving high dps. </Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>Casts with less than 3s CD on <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /></Wrapper>,
            when: !this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
            check: () => this.direBeast.badDireBeastThreshold,
          }),
          new Requirement({
            name: <Wrapper>Uptime of <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> </Wrapper>,
            when: this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
            check: () => this.direFrenzy.direFrenzyUptimeThreshold,
          }),
          new Requirement({
            name: <Wrapper>3 Stacks Uptime of <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> </Wrapper>,
            when: this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
            check: () => this.direFrenzy.direFrenzy3StackThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Cooldown efficiency</Wrapper>,
      description: <Wrapper> Use <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> & <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} icon />properly </Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>Average focus on <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> cast</Wrapper>,
            check: () => this.bestialWrathAverageFocus.focusOnBestialWrathCastThreshold,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} icon /> casts w/o <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> up</Wrapper>,
            check: () => this.aspectOfTheWild.badCastThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Talent Efficiency</Wrapper>,
      description: <Wrapper>hehe</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} icon /> damage</Wrapper>,
            when: combatant.hasTalent(SPELLS.ASPECT_OF_THE_BEAST_TALENT.id),
            check: () => this.aspectOfTheBeast.aspectOfTheBeastDamageThreshold,
          }),
          new Requirement({
            name: <Wrapper>Wasted <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} icon /> resets</Wrapper>,
            when: combatant.hasTalent(SPELLS.KILLER_COBRA_TALENT.id),
            check: () => this.killerCobra.wastedKillerCobraThreshold,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon /> casts with less than 7s remaining of <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> duration</Wrapper>,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
            check: () => this.aMurderOfCrows.shouldHaveSavedThreshold,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon /> casts without <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> ready to cast after</Wrapper>,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
            check: () => this.aMurderOfCrows.badCastThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper><Icon
        icon='spell_mage_altertime'
        alt='Casting downtime'
        style={{
          height: '1.3em',
          marginTop: '-.1em',
        }}
      /> Downtime</Wrapper>,
      description: <Wrapper> Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.COBRA_SHOT.id} icon /> to stay off the focus cap and do some damage.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><Icon
              icon='spell_mage_altertime'
              alt='Casting downtime'
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            /> Downtime</Wrapper>,
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Be well prepared',
      description: 'Being prepared is important if you want to perform to your highest potential',
      requirements: () => {
        return [
          new Requirement({
            name: 'All legendaries upgraded to max item level',
            check: () => ({
              actual: this.legendaryUpgradeChecker.upgradedLegendaries.length,
              isLessThan: this.legendaryCountChecker.max,
              style: 'number',
            }),
          }),
          new Requirement({
            name: 'Used max possible legendaries',
            check: () => ({
              actual: this.legendaryCountChecker.equipped,
              isLessThan: this.legendaryCountChecker.max,
              style: 'number',
            }),
          }),
          new Requirement({
            name: 'Used a pre-potion',
            check: () => this.prePotion.prePotionSuggestionThresholds,
          }),
          new Requirement({
            name: 'Used a second potion',
            check: () => this.prePotion.secondPotionSuggestionThresholds,
          }),
          new Requirement({
            name: 'Gear has best enchants',
            check: () => {
              const numEnchantableSlots = Object.keys(this.enchantChecker.enchantableGear).length;
              return {
                actual: numEnchantableSlots - (this.enchantChecker.slotsMissingEnchant.length + this.enchantChecker.slotsMissingMaxEnchant.length),
                isLessThan: numEnchantableSlots,
                style: 'number',
              };
            },
          }),
        ];
      },
    }),

  ];

}

export default Checklist;
