'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';

class Registration extends React.Component {
  onChange = (e) => {
    newDocStore.new_document.registration_number = e.target.value;
  };

  render() {
    const {registration_number} = newDocStore.new_document;
    const {field_name, additional_info} = this.props.moduleInfo;

    return (
      <>
        <div className='mt-1'>{field_name}:</div>
        <div className='d-flex align-items-center mt-1'>
          <input
            className='form-control mr-1'
            name='registration'
            id='registration'
            value={registration_number}
            onChange={this.onChange}
            maxLength={50}
          />
        </div>
        <If condition={additional_info}><small className='text-danger'>{additional_info}</small></If>
      </>
    );
  }

  static defaultProps = {
    moduleInfo: {
      fieldName: '',
      additional_info: ''
    }    
  };
}

export default view(Registration);
