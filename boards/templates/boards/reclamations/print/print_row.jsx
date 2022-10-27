'use strict';
import * as React from 'react';

class NCPrintRow extends React.Component {
  render() {
    const {className, children, last, right} = this.props;
  
    return (
      <div className={`d-flex pb-1 ${!last ? 'border-bottom' : null} ${right ? 'flex-row-reverse' : null} ${className}`}>
        {children}
      </div>
    );
  }
  
  static defaultProps = {
    className: '',
    last: undefined,
    right: undefined
  }
}

export default NCPrintRow;
