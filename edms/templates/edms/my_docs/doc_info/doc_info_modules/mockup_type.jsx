'use strict';
import * as React from 'react';

class MockupType extends React.Component {
  render() {
    const {fieldName, mockup_type} = this.props;
  
    console.log(mockup_type);
  
    return (
      <>
        <div>{fieldName}: {mockup_type}</div>
      </>
    );
  }

  static defaultProps = {
    mockup_type: '---',
    fieldName: '???'
  };
}

export default MockupType;
