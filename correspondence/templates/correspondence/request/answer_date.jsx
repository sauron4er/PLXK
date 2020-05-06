'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';

class AnswerDate extends React.Component {
  onChange = (event) => {
    corrStore.request.answer_date = event.target.value;
  };

  render() {
    return (
      <div className='form-inline mt-1'>
        <label className='text-nowrap mr-auto mr-md-1' htmlFor='answer_date'>
          Дата надання відповіді:
        </label>
        <input
          className='form-control'
          id='answer_date'
          type='date'
          value={corrStore.request.answer_date}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default view(AnswerDate);
