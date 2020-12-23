'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';

class ChooseCompany extends React.Component {

  onChange = (event) => {
    newDocStore.new_document.company = event.target.value
  };

  render() {
    const {module_info} = this.props;
    const {company} = newDocStore.new_document;

    return (
      <div className='mt-1'>
        <label className='mr-1'>{module_info.field_name}:</label>
        <input type="radio" name="gate_radio" value='ТДВ' id='TDV' onChange={this.onChange} checked={company === 'ТДВ'} />
        <label className="radio-inline mx-1" htmlFor='TDV'> ТДВ "ПЛХК"</label>
        <input type="radio" name="gate_radio" value='ТОВ' id='TOV' onChange={this.onChange} checked={company === 'ТОВ'} />
        <label className="radio-inline mx-1" htmlFor='TOV'> ТОВ "ПЛХК"</label>
        <small className='text-danger'>{module_info?.additional_info}</small>
      </div>
    );
  }

  static defaultProps = {
    module_info: {
      field_name: 'Оберіть підприємство',
      queue: 0,
      required: false,
      additional_info: null
    },
  };
}

export default view(ChooseCompany);
