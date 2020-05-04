'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';

class Answer extends React.Component {
  onChange = (event) => {
    corrStore.request.answer = event.target.value;
  };

  render() {
    return (
      <div className='d-flex align-items-center mt-1'>
        <label className='flex-grow-1 text-nowrap mr-1' htmlFor='answer'>
          Відповідь:
        </label>
        <textarea
          className='form-control'
          name='answer'
          id='answer'
          value={corrStore.request.answer}
          onChange={this.onChange}
          maxLength={4000}
        />
      </div>
    );
  }

  static defaultProps = {};
}

export default view(Answer);
