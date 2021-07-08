'use strict';
import * as React from 'react';

class NCPrintItem extends React.Component {
  render() {
    const {ua, en, value, cols, position, className} = this.props;
    return (
      <div className={`col-${cols} text-${position} ${className}`}>
        <span className='font-italic'>{ua}</span>{' '}
        <span className='font-italic'>
          <small>/ {en}</small>
        </span>
        :{' '}
        <Choose>
          <When condition={value.length > 10}>
            <div className='font-weight-bold'>{value}</div>
          </When>
          <Otherwise>
            <span className='font-weight-bold'>{value}</span>
          </Otherwise>
        </Choose>
      </div>
    );
  }

  static defaultProps = {
    ua: '',
    en: '',
    value: '',
    cols: '12',
    position: 'left',
    className: ''
  };
}

export default NCPrintItem;
