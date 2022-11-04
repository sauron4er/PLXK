'use strict';
import * as React from 'react';

class ReclamationPrintItem extends React.Component {
  render() {
    const {ua, value, cols, position, className} = this.props;
    return (
      <div className={`col-${cols} text-${position} ${className}`}>
        <span className='font-italic'>{ua}</span>
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
    value: '',
    cols: '12',
    position: 'left',
    className: ''
  };
}

export default ReclamationPrintItem;
