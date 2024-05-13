'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';

class ClientRequirementsItem extends React.Component {
  onChange = (e) => {
    newDocStore.new_document.client_requirements[this.props.name] = e.target.value;
  };

  render() {
    const {name, label, notRequired} = this.props;
    const {client_requirements} = newDocStore.new_document;

    return (
      <div className='col-md-4'>
        <div className='css_edms_doc_module'>
          <label htmlFor={name}>
            <small><If condition={!notRequired}>* </If>{label}</small>
          </label>
          <input
            className='form-control'
            name={name}
            id={name}
            value={client_requirements[name]}
            onChange={this.onChange}
            maxLength={10}
          />
        </div>
      </div>
    );
  }

  static defaultProps = {
    name: '',
    label: '',
  };
}

export default view(ClientRequirementsItem);
