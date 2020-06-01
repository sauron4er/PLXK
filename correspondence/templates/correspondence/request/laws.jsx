'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {uniqueArray, getItemById, getIndex} from 'templates/components/my_extras';
import LawsList from './laws_list';

class Laws extends React.Component {
  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    corrStore.selected_law_id = event.target.options[selectedIndex].getAttribute('data-key');
    corrStore.selected_law_name = event.target.options[selectedIndex].getAttribute('value');
  };

  addLaw = () => {
    if (corrStore.selected_law_id) {
      let existing_law = getItemById(corrStore.selected_law_id, corrStore.request.laws);
      if (existing_law !== -1) {
        for (const i in corrStore.request.laws) {
          if (
            corrStore.request.laws.hasOwnProperty(i) &&
            corrStore.request.laws[i].id === parseInt(corrStore.selected_law_id)
          ) {
            corrStore.request.laws[i].status = 'old';
            break;
          }
        }
      } else {
        let selected_law = getItemById(corrStore.selected_law_id, corrStore.laws);
        selected_law = {...selected_law, status: 'new'};
        corrStore.request.laws.push(selected_law);
        corrStore.request.laws = uniqueArray(corrStore.request.laws);
      }
      corrStore.selected_law_name = '';
      corrStore.selected_law_id = 0;
    }
  };

  render() {
    return (
      <>
        <div className='d-md-flex align-items-center mt-3'>
          <label className='mr-1' htmlFor='laws'>
            Законодавство:
          </label>
          <div className='flex-grow-1 d-flex'>
            <select
              className='flex-grow-1 form-control'
              id='laws'
              name='laws'
              value={corrStore.selected_law_name}
              onChange={this.onChange}
            >
              <option key={0} data-key={0} value='0'>
                ------------
              </option>
              {corrStore.laws.map((law) => {
                if (getIndex(parseInt(corrStore.request.scope_id), law.scopes) !== -1) {
                  return (
                    <option key={law.id} data-key={law.id} value={law.name}>
                      {law.name}
                    </option>
                  );
                }
              })}
            </select>

            <button
              className={
                corrStore.selected_law_name
                  ? 'btn btn-sm font-weight-bold ml-1 css_flash_button'
                  : 'btn btn-sm font-weight-bold ml-1 btn-outline-secondary'
              }
              onClick={() => this.addLaw()}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
        <small>Оберіть сферу застосування, щоб сформувати список відповідних законів</small>

        <If condition={corrStore.request.laws.length > 0}>
          <LawsList />
        </If>
      </>
    );
  }
}

export default view(Laws);
