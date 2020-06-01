'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';

class Scope extends React.Component {
  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    corrStore.request.scope_id = event.target.options[selectedIndex].getAttribute('data-key');
    corrStore.request.scope_name = event.target.options[selectedIndex].getAttribute('value');
  };

  render() {
    return (
      <div className='row align-items-center mt-1 mr-lg-1'>
        <label className='col-lg-2' htmlFor='scope'>
          Сфера застосування:
        </label>
        <select
          className='col-lg-10 form-control mx-3 mx-lg-0'
          id='scope'
          name='scope'
          value={corrStore.request.scope_name}
          onChange={this.onChange}
        >
          <option key={0} data-key={0} value='0'>
            ------------
          </option>
          {corrStore.scopes.map((scope) => {
            return (
              <option key={scope.id} data-key={scope.id} value={scope.name}>
                {scope.name}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
}

export default view(Scope);
