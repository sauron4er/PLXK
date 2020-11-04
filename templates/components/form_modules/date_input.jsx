'use strict';
import React from 'react';

class DateInput extends React.Component {
  render() {
    const {date, fieldName, onChange, disabled, className} = this.props;
    return (
      <div className={'form-inline mt-1 ' + className}>
        <If condition={fieldName}><label className='text-nowrap mr-auto mr-md-1' htmlFor={fieldName}>
          {fieldName}:
        </label></If>
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
    fieldName: '',
    onChange: () => {},
    disabled: true,
    className: ''
  };
}

export default DateInput;
