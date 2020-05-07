'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {uniqueArray, getItemById} from 'templates/components/my_extras';
import LawsList from "./laws_list";

class Laws extends React.Component {
  state = {
    law_name: ''
  };

  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    corrStore.selected_law_id = event.target.options[selectedIndex].getAttribute('data-key');
    this.setState({
      law_name: event.target.options[selectedIndex].getAttribute('value')
    });
  };

  addLaw = (e) => {
    e.preventDefault();
    if (corrStore.selected_law_id) {
      const selected_law = getItemById(corrStore.selected_law_id, corrStore.laws);
      corrStore.request.laws.push(selected_law);
      corrStore.request.laws = uniqueArray(corrStore.request.laws);
      this.setState({law_name: ''});
    }
  };

  render() {
    const {law_name} = this.state;
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
              value={law_name}
              onChange={this.onChange}
            >
              <option key={0} data-key={0} value='0'>
                ------------
              </option>
              {corrStore.laws.map((law) => {
                return (
                  <option key={law.id} data-key={law.id} value={law.name}>
                    {law.name}
                  </option>
                );
              })}
            </select>

            <button
              className={
                law_name
                  ? 'btn btn-sm font-weight-bold ml-1 css_flash_button'
                  : 'btn btn-sm font-weight-bold ml-1 btn-outline-secondary'
              }
              onClick={this.addLaw}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>

        <If condition={corrStore.request.laws.length > 0}>
          <LawsList />
        </If>
      </>
    );
  }
}

export default view(Laws);
