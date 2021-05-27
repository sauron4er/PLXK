'use strict';
import * as React from 'react';

class NCRow extends React.Component {
  render() {

    return (
      <div className='d-flex align-content-start p-0'>
        {this.props.children}
      </div>
    );
  }
}

export default NCRow;
