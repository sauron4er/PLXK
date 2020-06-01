'use strict';
import React from 'react';

class Day extends React.Component {
  render() {
    const {day, fieldName, onChange} = this.props;
    return (
      <div className='mt-1'>
        <label htmlFor='day'>
          {fieldName}:
          <input
            className='form-control'
            id='day'
            name='day'
            type='date'
            value={day}
            onChange={onChange}
          />
        </label>
      </div>
    );
  }

  static defaultProps = {
    day: '1111-11-11',
    fieldName: '???'
  };
}

export default Day;
