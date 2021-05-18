'use strict';
import * as React from 'react';

class NonCompliance extends React.Component {
  
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm">
            One of three columns
          </div>
          <div className="col-sm">
            One of three columns
          </div>
          <div className="col-sm">
            One of three columns
          </div>
        </div>
      </div>
    );
  }
  
  static defaultProps = {
    id: 0
  }
}

export default NonCompliance;
