'use strict';
import * as React from 'react';

class Gate extends React.Component {
  render() {
    const {fieldName, checkedGate, onChange} = this.props;
    return (
      <div className='mt-1'>
        <label className='mr-1'>{fieldName}:</label>
        <input type="radio" name="gate_radio" value='1' onChange={onChange} checked={parseInt(checkedGate)===1} /><label className="radio-inline mx-1"> 1</label>
        <input type="radio" name="gate_radio" value='2' onChange={onChange} checked={parseInt(checkedGate)===2} /><label className="radio-inline mx-1"> 2</label>
      </div>
    );
  }

  static defaultProps = {
    checkedGate: 1,
    fieldName: '???'
  };
}

export default Gate;
