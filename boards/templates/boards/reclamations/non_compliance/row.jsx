'use strict';
import * as React from 'react';

class NCRow extends React.Component {
  render() {
    return (
      <div className={`d-flex align-content-start p-0 ${this.props.className}`}>
        {this.props.children}
      </div>
    );
  }
  
  static defaultProps = {
    className: ''
  }
}

export default NCRow;
