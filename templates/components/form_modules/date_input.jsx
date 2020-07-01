'use strict';
import React from 'react';

class DateInput extends React.Component {
  render() {
    const {date, fieldName, onChange} = this.props;
    return (
      <div className='form-inline mt-1'>
        <label className='text-nowrap mr-auto mr-md-1' htmlFor={fieldName}>
          {fieldName}:
        </label>
        <input
          className='form-control'
          id={fieldName}
          type='date'
          value={date}
          onChange={onChange}
        />
      </div>
    );
  }

  static defaultProps = {
    date: '',
    fieldName: '-',
    onChange: () => {},
  };
}

export default DateInput;
