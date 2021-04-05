'use strict';
import * as React from 'react';
import Select from 'react-select';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import {LoaderSmall} from 'templates/components/loaders';

class Counterparty extends React.Component {
  state = {
    counterparties: [],
    filtered_counterparties: [],
    loading: true,
    radio: 'provider' //, 'client'
  };

  componentDidMount() {
    axiosGetRequest('get_counterparties_for_select/')
      .then((response) => {
        this.setState({
          counterparties: response,
          filtered_counterparties: response,
          loading: false
        }, () => {this.filterCounterparties('provider')});
        
      })
      .catch((error) => console.log(error));
  }

  onSelectChange = (e) => {
    newDocStore.new_document.counterparty = e.value;
    newDocStore.new_document.counterparty_name = e.label;
  };
  
  filterCounterparties = (type) => {
    const filtered_counterparties = this.state.counterparties.filter(counterparty => {
      return counterparty.type === type
    })
    this.setState({filtered_counterparties})
  };

  onRadioChange = (e) => {
    this.setState({radio: e.target.value});
    newDocStore.new_document.counterparty = 0;
    newDocStore.new_document.counterparty_name = '';
    this.filterCounterparties(e.target.value);
  };

  render() {
    const {module_info} = this.props;
    const {loading, filtered_counterparties, radio} = this.state;
  
    return (
      <Choose>
        <When condition={!loading}>
          <label className='mr-1'><If condition={module_info.required}>{'* '}</If>{module_info.field_name}:</label><br/>
          <input type='radio' name='counterparty_radio' id='provider' value='provider' onChange={this.onRadioChange} checked={radio === 'provider'} />
          <label className='radio-inline mx-1 mr-4' htmlFor='provider'> Постачальник</label>
          <input type='radio' name='counterparty_radio' id='client' value='client' onChange={this.onRadioChange} checked={radio === 'client'} />
          <label className='radio-inline mx-1' htmlFor='client'> Клієнт</label>
          
          <Select options={filtered_counterparties} onChange={this.onSelectChange} />
          
          <small>
            Якщо потрібного контрагента нема в списку, його можна додати на сторінці{' '}
            <a href={`${window.location.origin}/boards/providers/`} target='_blank'>
              Постачальники
            </a>{' '}
            або{' '}
            <a href={`${window.location.origin}/boards/clients/`} target='_blank'>
              {/*<a href={'http://127.0.0.1:8000/boards/clients/'} target='_blank'>*/}
              Клієнти
            </a>
            . Якщо у вас нема прав на додавання контрагента у базу, зверніться до адміністратора
          </small>
          <small className='text-danger'>{module_info?.additional_info}</small>
        </When>
        <Otherwise>
          <LoaderSmall />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    counterparty: [],
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default view(Counterparty);
