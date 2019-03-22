'use strict';
import React, {Fragment} from 'react';

class Gate extends React.Component {
  render() {
    const {fieldName, gate} = this.props;

    return (
      <Fragment>
        <div>{fieldName}: {gate}</div>
      </Fragment>
    );
  }

  static defaultProps = {
    gate: [],
    fieldName: '???'
  };
}

export default Gate;
