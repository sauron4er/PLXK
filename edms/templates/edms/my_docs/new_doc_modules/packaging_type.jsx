'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';

class PackagingType extends React.Component {
  onChange = (event) => {
    newDocStore.new_document.packaging_type = event.target.value;
  };
  
  componentDidMount() {
    newDocStore.new_document.packaging_type = this.props.packaging_type
  }
  
  render() {
    const {fieldName} = this.props;
  
    return (
      <div className='row align-items-center mt-1 mr-lg-1'>
        <label className='col-lg-4' htmlFor='packaging_type'>
          {fieldName}:
        </label>
        <select
          className='col-lg-8 form-control mx-3 mx-lg-0'
          id='packaging_type'
          name='packaging_type'
          value={newDocStore.new_document.packaging_type}
          onChange={this.onChange}
        >
          <option key={0} data-key={0} value='0'>
            ------------
          </option>
          <option key={1} data-key={1} value='Шт.'>
            Шт.
          </option>
          <option key={2} data-key={2} value='Кг.'>
            Кг.
          </option>
        </select>
      </div>
    );
  }

  static defaultProps = {
    fieldName: '-',
    packaging_type: '---'
  };
}

export default view(PackagingType);
