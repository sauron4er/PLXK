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
      <div className='row align-items-center mt-1 mr-lg-1'>
        <label className='col-lg-1' htmlFor='author'>
          Відповідь:
        </label>
        <textarea
          className='form-control full_width'
          name='preamble'
          id='preamble'
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
