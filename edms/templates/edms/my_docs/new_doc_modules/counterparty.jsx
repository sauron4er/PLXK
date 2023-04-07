'use strict';
import * as React from 'react';
import Select from 'react-select';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';

class Counterparty extends React.Component {
  state = {
    counterparties: [],
    filtered_counterparties: [],
  };

  componentDidMount() {
    axiosGetRequest('get_counterparties/')
      .then((response) => {
        this.setState(
          {
            counterparties: response,
            filtered_counterparties: response
          },
          () => {
            this.filterCounterparties('client');
          }
        );
      })
      .catch((error) => console.log(error));
  }

  onSelectChange = (e) => {
    newDocStore.new_document.counterparty = e.id;
    newDocStore.new_document.counterparty_name = e.name;
  };

  filterCounterparties = (type) => {
    const filtered_counterparties = this.state.counterparties.filter((counterparty) => {
      return counterparty.type === type;
    });
    this.setState({filtered_counterparties});
  };

  onRadioChange = (e) => {
    newDocStore.new_document.counterparty_type = e.target.value;
    newDocStore.new_document.counterparty = 0;
    newDocStore.new_document.counterparty_name = '';
    this.filterCounterparties(e.target.value);
  };

  render() {
    const {module_info} = this.props;
    const {filtered_counterparties} = this.state;
    const {counterparty_type, counterparty, counterparty_name} = newDocStore.new_document;
    console.log(counterparty_type);

    return (
      <>
        <label className='mr-1'>
          <If condition={module_info.required}>{'* '}</If>
          {module_info.field_name}:
        </label>
        <br />
        <input
          type='radio'
          name='counterparty_radio'
          id='client'
          value='client'
          onChange={this.onRadioChange}
          checked={counterparty_type === 'client'}
        />
        <label className='radio-inline mx-1' htmlFor='client'>
          {' '}
          Клієнт
        </label>
        
        <input
          type='radio'
          name='counterparty_radio'
          id='provider'
          value='provider'
          onChange={this.onRadioChange}
          checked={counterparty_type === 'provider'}
          className='ml-2'
        />
        <label className='radio-inline mx-1 mr-4' htmlFor='provider'>
          {' '}
          Постачальник
        </label>

        <Select
          options={filtered_counterparties}
          onChange={this.onSelectChange}
          value={{name: counterparty_name, id: counterparty}}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.id}
        />

        <small>
          Якщо потрібного контрагента нема в списку, його можна додати на сторінці{' '}
          <a href={`${window.location.origin}/boards/providers/`} target='_blank'>
            Постачальники
          </a>{' '}
          або{' '}
          <a href={`${window.location.origin}/boards/clients/`} target='_blank'>
            Клієнти
          </a>
          . Якщо у вас нема прав на додавання контрагента у базу, зверніться до адміністратора
        </small>
        <small className='text-danger'>{module_info?.additional_info}</small>
      </>
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
