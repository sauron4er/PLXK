'use strict';
import * as React from 'react';

class ReclamationPrintColumn extends React.Component {
  render() {
    return (
      <div className={`d-flex flex-column ${this.props.className}`}>
        {this.props.children}
      </div>
    );
  }
  
  static defaultProps = {
    className: ''
  }
}

export default ReclamationPrintColumn;
