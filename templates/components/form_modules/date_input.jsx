'use strict';
import React from 'react';

class DateInput extends React.Component {
  render() {
    const {date, fieldName, onChange, disabled} = this.props;
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
          disabled={disabled}
        />
      </div>
    );
  }

  static defaultProps = {
    date: '',
    fieldName: '-',
    onChange: () => {},
    disabled: true
  };
}

export default DateInput;
