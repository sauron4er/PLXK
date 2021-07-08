'use strict';
import * as React from 'react';

class NCItem extends React.Component {
  render() {
    return (
      <div className={`col-lg-${this.props.cols} border border-light  ${this.props.className}`} style={this.props.style}>
        {this.props.children}
      </div>
    );
  }

  static defaultProps = {
    cols: '12',
    className: '',
    style: null
  };
}

export default NCItem;
