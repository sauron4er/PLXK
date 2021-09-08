'use strict';
import * as React from 'react';

class Instruction extends React.Component {
  state = {
  
  };

  render() {
    const {id} = this.props;
    return (
      <div>
        {id}
      </div>
    );
  }
  
  static defaultProps = {
    id: 0
  }
}

export default Instruction;