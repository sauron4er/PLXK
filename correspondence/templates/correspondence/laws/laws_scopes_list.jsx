'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import 'static/css/my_styles.css';

class LawScopesList extends React.Component {
  delScope = (id) => {
    for (const i in corrStore.law.scopes) {
      if (corrStore.law.scopes.hasOwnProperty(i) && corrStore.law.scopes[i].id === id) {
        corrStore.law.scopes.splice(i, 1);
      }
    }
  };

  render() {
    return (
      <div className='mt-2 mr-1'>
        <For each='scope' index='id' of={corrStore.law.scopes}>
          <div key={scope.id} className='css_selected_law'>
            <div>{scope.name}</div>
            <button
              className='btn btn-sm btn-outline-secondary font-weight-bold ml-auto'
              onClick={() => this.delScope(scope.id)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </For>
      </div>
    );
  }
}

export default view(LawScopesList);
