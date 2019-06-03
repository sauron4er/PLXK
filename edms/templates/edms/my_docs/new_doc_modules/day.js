'use strict';
import React from 'react';

class Day extends React.Component {
  render() {
    const {day, fieldName, onChange} = this.props;
    return (
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
    );
  }

  static defaultProps = {
    day: '1111-11-11',
    fieldName: '???'
  };
}

export default Day;
