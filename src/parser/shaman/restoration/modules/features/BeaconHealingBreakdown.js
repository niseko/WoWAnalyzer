import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import { TooltipElement } from 'common/Tooltip';
import HealingValue from 'parser/shared/modules/HealingValue';

class BeaconHealingBreakdown extends React.Component {
  static propTypes = {
    totalHealingDone: PropTypes.instanceOf(HealingValue).isRequired,
    totalBeaconHealing: PropTypes.instanceOf(HealingValue).isRequired,
    beaconHealingBySource: PropTypes.object.isRequired,
    fightDuration: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.state = {
      absolute: false,
    };
  }

  renderTableBody() {
    const { totalHealingDone, totalBeaconHealing, beaconHealingBySource, fightDuration } = this.props;

    const currentTotal = this.state.absolute ? totalHealingDone.effective : totalBeaconHealing.total;
    const highestHealing = Object.keys(beaconHealingBySource)
      .map(key => beaconHealingBySource[key])
      .reduce((highest, source) => Math.max(highest, source.healing), 1);

    return (
      <tbody>
        {beaconHealingBySource && Object.keys(beaconHealingBySource)
          .sort((a, b) => beaconHealingBySource[b].healing - beaconHealingBySource[a].healing)
          .map(spellId => {
            const { ability, healing, effectiveHealing } = beaconHealingBySource[spellId];

            return (
              <tr key={ability.guid}>
                <td style={{ width: '30%' }}>
                  <SpellLink id={ability.guid} icon={false}>
                    <Icon icon={ability.abilityIcon} />{' '}
                    {ability.name}
                  </SpellLink>
                </td>
                <td style={{ paddingRight: 5, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {formatPercentage(healing / currentTotal)} %
                </td>
                <td style={{ width: '70%' }}>
                  {/* TODO: Color the bar based on the damage type, physical = yellow, chaos = gradient, etc. idk */}
                  <div
                    className="performance-bar"
                    style={{ width: `${healing / highestHealing * 100}%` }}
                  />
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <TooltipElement content={`Total: ${formatNumber(healing)}`}>
                    {formatNumber(healing)}
                  </TooltipElement>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {formatNumber(effectiveHealing)}
                </td>
              </tr>
            );
          })}
      </tbody>
    );
  }

  render() {
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Name</th>
            <th colSpan="3">
              <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>Cloudburst feeding caused</span>
              <div className="pull-right toggle-control">
                <Toggle
                  defaultChecked={false}
                  icons={false}
                  onChange={event => this.setState({ absolute: event.target.checked })}
                  id="absolute-toggle"
                />
                <label htmlFor="absolute-toggle" style={{ marginLeft: '0.5em' }}>
                  relative to total healing
                </label>
              </div>
            </th>
            <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Effective</th>
          </tr>
        </thead>
        {this.renderTableBody()}
      </table>
    );
  }
}

export default BeaconHealingBreakdown;
