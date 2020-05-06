'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';

class RequestDate extends React.Component {
  onChange = (event) => {
    corrStore.request.request_date = event.target.value;
  };

  render() {
    return (
      <div className='d-flex align-items-center mt-1'>
        <label className='flex-grow-1 text-nowrap mr-1' htmlFor='request_date'>
          Дата отримання запиту:
        </label>
        <input
          className='form-control'
          id='request_date'
          type='date'
          value={corrStore.request.request_date}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default view(RequestDate);
