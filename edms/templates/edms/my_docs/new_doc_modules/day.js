'use strict';
import React from 'react';

class Day extends React.Component {
  render() {
    const {day, fieldName, onChange, queue} = this.props;
    
    return (
      <div className='mt-1'>
        <label htmlFor={'day-' + queue}>
          {fieldName}:
          <input
            className='form-control'
            id={'day-' + queue}
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
    day: '',
    fieldName: '???',
    queue: 1,
  };
}

export default Day;
