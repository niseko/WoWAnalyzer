import React from 'react';
import PropTypes from 'prop-types';

import TooltipProvider from 'interface/common/TooltipProvider';

import ITEMS from './ITEMS';
import getItemQualityLabel from './getItemQualityLabel';
import ItemIcon from './ItemIcon';

class ItemLink extends React.PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
    children: PropTypes.node,
    details: PropTypes.object,
    quality: PropTypes.number,
    icon: PropTypes.bool,
  };
  static defaultProps = {
    icon: true,
  };

  elem = null;

  componentDidMount() {
    this.componentDidUpdate();
  }
  componentDidUpdate() {
    TooltipProvider.refresh(this.elem);
    // eslint-disable-next-line no-undef
    if ($WowheadPower !== "undefined") {
      // eslint-disable-next-line no-undef
      $WowheadPower.refreshLinks()
    }
  }

  render() {
    const { id, children, details, icon, ...others } = this.props;
    delete others.quality;

    if (process.env.NODE_ENV === 'development' && !children && !ITEMS[id]) {
      throw new Error(`Unknown item: ${id}`);
    }

    let quality;
    if (this.props.quality !== undefined && this.props.quality !== null) {
      quality = this.props.quality;
    } else if (this.props.details) {
      quality = Math.max(this.props.details.itemLevel >= 370 ? 4 : 3, this.props.details.quality);
    } else {
      quality = ITEMS[id] ? ITEMS[id].quality : 0;
    }

    return (
      <a
        href={TooltipProvider.item(id, details)}
        target="_blank"
        rel="noopener noreferrer"
        className={getItemQualityLabel(quality)}
        data-wh-rename-link="false"
        ref={elem => {
          this.elem = elem;
        }}
        {...others}
      >
        {icon && <ItemIcon id={id} noLink />}{' '}
        {children || ITEMS[id].name}
      </a>
    );
  }
}

export default ItemLink;
