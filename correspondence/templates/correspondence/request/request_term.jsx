'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';

class RequestTerm extends React.Component {
  onChange = (event) => {
    corrStore.request.request_term = event.target.value;
  };

  render() {
    return (
      <div className='form-inline mt-1'>
        <label className='text-nowrap mr-auto mr-md-1' htmlFor='request_term'>
          Термін виконання:
        </label>
        <input
          className='form-control'
          id='request_term'
          type='date'
          value={corrStore.request.request_term}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default view(RequestTerm);
