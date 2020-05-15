'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';

class Product extends React.Component {
  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    corrStore.request.product_id = event.target.options[selectedIndex].getAttribute('data-key');
    corrStore.request.product_name = event.target.options[selectedIndex].getAttribute('value');
  };

  render() {

    return (
      <div className='row align-items-center mt-1 mr-lg-1'>
        <label className='col-lg-1' htmlFor='product'>
          Продукт:
        </label>
        <select
          className='col-lg-11 form-control mx-3 mx-lg-0'
          id='product'
          name='product'
          value={corrStore.request.product_name}
          onChange={this.onChange}
        >
          <option key={0} data-key={0} value='0'>
            ------------
          </option>
          {corrStore.products.map((product) => {
            return (
              <option key={product.id} data-key={product.id} value={product.name}>
                {product.name}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
}

export default view(Product);
