'use strict';
import * as React from 'react';

class Day extends React.Component {
  render() {
    const {day, module_info, onChange} = this.props;
    
    return (
      <div className='mt-1'>
        <label htmlFor={'day-' + module_info.queue}>
          <If condition={module_info.required}>{'* '}</If>{module_info.field_name}:
          <input
            className='form-control'
            id={'day-' + module_info.queue}
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
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default Day;
