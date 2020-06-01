'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {uniqueArray, getItemById} from 'templates/components/my_extras';
import LawScopesList from './laws_scopes_list';

class LawScopes extends React.Component {
  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    corrStore.law.scope_id = event.target.options[selectedIndex].getAttribute('data-key');
    corrStore.law.scope_name = event.target.options[selectedIndex].getAttribute('value');
  };

  addLawScope = () => {
    if (corrStore.law.scope_id) {
      let selected_scope = getItemById(corrStore.law.scope_id, corrStore.scopes);
      corrStore.law.scopes.push(selected_scope);
      corrStore.law.scopes = uniqueArray(corrStore.law.scopes);

      corrStore.law.scope_name = '';
      corrStore.law.scope_id = 0;
    }
  };

  render() {
    return (
      <>
        <div className='d-md-flex align-items-center mt-3 mr-1'>
          <label className='mr-1' htmlFor='laws'>
            Сфери застосування:
          </label>
          <div className='flex-grow-1 d-flex'>
            <select
              className='flex-grow-1 form-control'
              id='law_scopes'
              name='law_scopes'
              value={corrStore.law.scope_name}
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

            <button
              className={
                corrStore.law.scope_name
                  ? 'btn btn-sm font-weight-bold ml-1 css_flash_button'
                  : 'btn btn-sm font-weight-bold ml-1 btn-outline-secondary'
              }
              onClick={() => this.addLawScope()}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>

        <If condition={corrStore.law.scopes.length > 0}>
          <LawScopesList />
        </If>
      </>
    );
  }
}

export default view(LawScopes);
