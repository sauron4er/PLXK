'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';

class Deadline extends React.Component {
  onChange = (e) => {
    newDocStore.new_document.deadline = e.target.value;
  }
  
  render() {
    const {module_info} = this.props;
    
    return (
      <div className='mt-1'>
        <label htmlFor={'deadline-' + module_info.queue}>
          <If condition={module_info.required}>{'* '}</If>{module_info.field_name}:
          <input
            className='form-control'
            id={'deadline-' + module_info.queue}
            name='day'
            type='date'
            value={newDocStore.new_document.deadline}
            onChange={this.onChange}
          />
        </label>
      </div>
    );
  }

  static defaultProps = {
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default view(Deadline);
