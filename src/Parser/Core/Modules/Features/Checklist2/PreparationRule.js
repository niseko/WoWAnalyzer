import React from 'react';
import PropTypes from 'prop-types';

import Rule from './Rule';
import Requirement from './Requirement';

class PreparationRule extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
    thresholds: PropTypes.object.isRequired,
  };

  renderLegendaryRequirements() {
    const { thresholds } = this.props;

    return (
      <React.Fragment>
        <Requirement
          name="Max possible legendaries equipped"
          thresholds={thresholds.legendariesEquipped}
        />
        <Requirement
          name="Legendaries fully upgraded"
          thresholds={thresholds.legendariesUpgraded}
        />
      </React.Fragment>
    );
  }
  renderPotionRequirements() {
    const { thresholds } = this.props;

    return (
      <React.Fragment>
        <Requirement
          name="Used a pre-potion"
          thresholds={thresholds.prePotion}
        />
        <Requirement
          name="Used a second potion"
          thresholds={thresholds.secondPotion}
        />
      </React.Fragment>
    );
  }
  renderEnchantRequirements() {
    const { thresholds } = this.props;

    return (
      <React.Fragment>
        <Requirement
          name="All items enchanted"
          thresholds={thresholds.itemsEnchanted}
        />
        <Requirement
          name="Using high quality enchants"
          thresholds={thresholds.itemsBestEnchanted}
        />
      </React.Fragment>
    );
  }
  renderGemRequirements() {
    const { thresholds } = this.props;

    return (
      <React.Fragment>
        <Requirement
          name="All items gemmed"
          thresholds={thresholds.itemsGemmed}
        />
        <Requirement
          name="Using high quality gems"
          thresholds={thresholds.itemsBestGemmed}
        />
      </React.Fragment>
    );
  }

  render() {
    const { children } = this.props;

    return (
      <Rule
        name="Be well prepared"
        description="Being well prepared with potions, enchants and legendaries is an easy way to improve your performance."
      >
        {this.renderLegendaryRequirements()}
        {this.renderEnchantRequirements()}
        {this.renderGemRequirements()}
        {this.renderPotionRequirements()}
        {children}
      </Rule>
    );
  }
}

export default PreparationRule;
