import * as React from 'react';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';
import {view, store} from '@risingstack/react-easy-state';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import 'react-datetime/css/react-datetime.css';
import Datetime from 'react-datetime';
import moment from 'moment';
import 'moment/locale/uk';

class FoyerRanges extends React.Component {
  onOutDateTimeChange = (e, index) => {
    if (e instanceof moment && moment(e).isValid()) newDocStore.new_document.foyer_ranges[index].out = e.toDate();
    else newDocStore.new_document.foyer_ranges[index].out = 'invalid';
  };

  onInDateTimeChange = (e, index) => {
    if (e instanceof moment && moment(e).isValid()) newDocStore.new_document.foyer_ranges[index].in = e.toDate();
    else newDocStore.new_document.foyer_ranges[index].in = 'invalid';
  };

  addRange = (e) => {
    newDocStore.new_document.foyer_ranges.push({out: '', in: ''});
  };

  delRange = (e, index) => {
    newDocStore.new_document.foyer_ranges.splice(index, 1);
  };

  render() {
    const {module_info} = this.props;
    const {foyer_ranges, doc_type_version} = newDocStore.new_document;

    return (
      <div className='mt-1'>
        <label htmlFor='foyer_date'>
          <If condition={module_info.required}>{'* '}</If>
          {module_info.field_name}:
        </label>
        <Choose>
          <When condition={[1, 2].includes(doc_type_version)}>  {/*1, 2 - Звільнююча*/}
            <For each='time' of={foyer_ranges} index='index'>
              <div className='d-flex mt-1' key={index}>
                <span className='mr-1 font-weight-bold'>Вихід:</span>
                <Datetime onChange={(e) => this.onOutDateTimeChange(e, index)} value={foyer_ranges[index].out} />
                <span className='mx-1'>Вхід:</span>
                <Datetime onChange={(e) => this.onInDateTimeChange(e, index)} value={foyer_ranges[index].in} />
                <If condition={index === foyer_ranges.length - 1}>
                  <button onClick={this.addRange} className='btn btn-sm btn-outline-secondary ml-1'>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </If>
                <If condition={index > 0}>
                  <button id={index} onClick={(e) => this.delRange(e, index)} className='btn btn-sm btn-outline-secondary ml-1'>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </If>
              </div>
            </For>
          </When>
          <Otherwise>  {/*3, 4 - Забув, тимчасова*/}
            <For each='time' of={foyer_ranges} index='index'>
              <div className='d-flex mt-1' key={index}>
                <span className='mr-1'>Вхід:</span>
                <Datetime onChange={(e) => this.onInDateTimeChange(e, index)} value={foyer_ranges[index].in} />
                <span className='mx-1 font-weight-bold'>Вихід:</span>
                <Datetime onChange={(e) => this.onOutDateTimeChange(e, index)} value={foyer_ranges[index].out} />
                <If condition={index === foyer_ranges.length - 1}>
                  <button onClick={this.addRange} className='btn btn-sm btn-outline-secondary ml-1'>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </If>
                <If condition={index > 0}>
                  <button id={index} onClick={(e) => this.delRange(e, index)} className='btn btn-sm btn-outline-secondary ml-1'>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </If>
              </div>
            </For>
          </Otherwise>
        </Choose>
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

export default view(FoyerRanges);
