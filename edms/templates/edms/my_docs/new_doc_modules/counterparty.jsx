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
    radio: 'provider', //, 'client'
    from_base_area: false
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
            this.filterCounterparties('provider');
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
    this.setState({radio: e.target.value});
    newDocStore.new_document.counterparty = 0;
    newDocStore.new_document.counterparty_name = '';
    this.filterCounterparties(e.target.value);
  };

  onCounterpartyInputChange = (e) => {
    newDocStore.new_document.counterparty_input = e.target.value;
  };

  changeFromBaseArea = (e) => {
    this.setState({from_base_area: !this.state.from_base_area});
    newDocStore.new_document.counterparty_input = '';
  };

  render() {
    const {module_info} = this.props;
    const {filtered_counterparties, radio, from_base_area} = this.state;

    return (
      <div>
        <label className='mr-1'>
          <If condition={module_info.required}>{'* '}</If>
          {module_info.field_name}:
        </label>
        <br />
        <If condition={!from_base_area}>
          <textarea
            className='form-control full_width'
            name='counterparty_input'
            id='counterparty_input'
            value={newDocStore.new_document.counterparty_input}
            rows={1}
            onChange={this.onCounterpartyInputChange}
            maxLength={100}
          />
        </If>

        <input
          className='mr-1'
          type='checkbox'
          id='from_base_area'
          name='from_base_area'
          onClick={this.changeFromBaseArea}
          checked={from_base_area}
        />
        <label htmlFor='from_base_area'>Обрати контрагента з бази</label>

        <If condition={from_base_area}>
          <br />
          <input
            type='radio'
            name='counterparty_radio'
            id='provider'
            value='provider'
            onChange={this.onRadioChange}
            checked={radio === 'provider'}
          />
          <label className='radio-inline mx-1 mr-4' htmlFor='provider'>
            {' '}
            Постачальник
          </label>
          <input
            type='radio'
            name='counterparty_radio'
            id='client'
            value='client'
            onChange={this.onRadioChange}
            checked={radio === 'client'}
          />
          <label className='radio-inline mx-1' htmlFor='client'>
            {' '}
            Клієнт
          </label>

          <Select
            options={filtered_counterparties}
            onChange={this.onSelectChange}
            value={{name: newDocStore.new_document.counterparty_name, id: newDocStore.new_document.counterparty}}
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
        </If>
      </div>
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
