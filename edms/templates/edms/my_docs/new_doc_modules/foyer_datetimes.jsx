'use strict';
import * as React from 'react';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';
import {view, store} from '@risingstack/react-easy-state';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

class FoyerDatetimes extends React.Component {
  onDateChange = (e) => {
    newDocStore.new_document.foyer_datetimes.date = e.target.value;
  };

  onTimeChange = (e, index, direction) => {
    newDocStore.new_document.foyer_datetimes.times[index][direction] = e.target.value;
  };

  addTime = (e) => {
    newDocStore.new_document.foyer_datetimes.times.push({out: '', in: ''});
  };

  delTime = (e, index) => {
    newDocStore.new_document.foyer_datetimes.times.splice(index, 1);
  };

  render() {
    const {module_info} = this.props;
    const {foyer_datetimes} = newDocStore.new_document;
  
    return (
      <div className='mt-1'>
        <label htmlFor='foyer_date'>
          <If condition={module_info.required}>{'* '}</If>
          {module_info.field_name}:
        </label>
        <input
          className='form-control col-lg-3 mb-1'
          id='foyer_date'
          name='foyer_date'
          type='date'
          value={foyer_datetimes.date}
          onChange={this.onDateChange}
        />
        <For each='time' of={foyer_datetimes.times} index='index'>
          <div className='d-flex mt-1' key={index}>
            <span className='mr-1'>Вихід:</span>
            <input
              className='form-control col-lg-2 mr-1'
              type='time'
              value={time.out}
              onChange={e => this.onTimeChange(e, index, 'out')}
            />
            <span className='mr-1'>Вхід:</span>
            <input
              className='form-control col-lg-2 mr-1'
              type='time'
              value={time.in}
              onChange={e => this.onTimeChange(e, index, 'in')}
            />
            <button onClick={this.addTime} className='btn btn-sm btn-outline-secondary'>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <If condition={index > 0}>
              <button id={index} onClick={e => this.delTime(e, index)} className='btn btn-sm btn-outline-secondary ml-1'>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </If>
          </div>
        </For>
      </div>
    );
  }

  static defaultProps = {
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default view(FoyerDatetimes);
