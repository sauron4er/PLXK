'use strict';
import * as React from 'react';

class Datetime extends React.Component {
  render() {
    const {datetime, module_info, onChange} = this.props;
    
    return (
      <div className='mt-1'>
        <label htmlFor={'day-' + module_info.queue}>
          <If condition={module_info.required}>{'* '}</If>{module_info.field_name}:
          <div className='d-flex'><input
            className='form-control mr-1'
            id={"day-" + module_info.queue}
            name='day'
            type='date'
            value={datetime.day}
            onChange={e => onChange(e, 'day', module_info.queue)}
          />
            <input
              className='form-control'
              id={"time-" + module_info.queue}
              name='time'
              type='time'
              value={datetime.time}
              onChange={e => onChange(e, 'time', module_info.queue)}
            /></div>
        </label>
      </div>
    );
  }

  static defaultProps = {
    datetime: '',
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default Datetime;
