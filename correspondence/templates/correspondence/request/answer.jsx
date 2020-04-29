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
        <input
          className='w-25 ml-1'
          onChange={this.onChange}
          value={corrStore.request.answer}
        />
      </div>
    );
  }

  static defaultProps = {};
}

export default view(Answer);
