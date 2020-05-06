'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';

class AnswerResponsible extends React.Component {
  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    corrStore.request.answer_responsible_name = event.target.options[selectedIndex].getAttribute('value');
    corrStore.request.answer_responsible_id = event.target.options[selectedIndex].getAttribute('data-key');
  };

  render() {

    return (
      <div className='row align-items-center mt-1 mr-lg-1'>
        <label className='col-lg-2' htmlFor='responsible'>
          Відповідальний за надання відповіді:
        </label>
        <select
          className='col-lg-10 form-control mx-3 mx-lg-0'
          id='responsible'
          name='responsible'
          value={corrStore.request.answer_responsible_name}
          onChange={this.onChange}
        >
          <option key={0} data-key={0} value='0'>
            ------------
          </option>
          {corrStore.employees.map((emp) => {
            return (
              <option key={emp.id} data-key={emp.id} value={emp.name}>
                {emp.name}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
}

export default view(AnswerResponsible);
