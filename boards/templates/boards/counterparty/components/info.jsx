'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from './counterparty_store';
import TextInput from 'templates/components/form_modules/text_input';
import MultiSelector from 'templates/components/form_modules/multi_selector';
import {getIndex, getItemById, uniqueArray} from 'templates/components/my_extras';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import Selector from 'templates/components/form_modules/selector';
import corrStore from '../../../../../correspondence/templates/correspondence/store';

class CounterpartyInfo extends React.Component {
  state = {
    selected_product: '',
    selected_product_id: 0
  };
  onNameChange = (e) => {
    counterpartyStore.counterparty.name = e.target.value;
  };

  onEdrpouChange = (e) => {
    counterpartyStore.counterparty.edrpou = e.target.value;
  };

  onLegalAddressChange = (e) => {
    counterpartyStore.counterparty.legal_address = e.target.value;
  };

  onActualAddressChange = (e) => {
    counterpartyStore.counterparty.actual_address = e.target.value;
  };

  onProductChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    counterpartyStore.counterparty.product_id = e.target.options[selectedIndex].getAttribute('data-key');
    counterpartyStore.counterparty.product_name = e.target.options[selectedIndex].getAttribute('value');
  };

  render() {
    const {counterparty} = counterpartyStore;
    const {edit_access} = window;
    const {selected_product} = this.state;

    return (
      <>
        <TextInput text={counterparty.name} fieldName={'* Назва'} onChange={this.onNameChange} maxLength={100} disabled={!edit_access} />
        <hr />
        <TextInput
          text={counterparty.legal_address}
          fieldName={'Юридична адреса'}
          onChange={this.onLegalAddressChange}
          maxLength={200}
          disabled={!edit_access}
        />
        <hr />
        <TextInput
          text={counterparty.actual_address}
          fieldName={'Фактична адреса'}
          onChange={this.onActualAddressChange}
          maxLength={200}
          disabled={!edit_access}
        />
        <hr />
        <TextInput text={counterparty.edrpou} fieldName={'ЄДРПОУ'} onChange={this.onEdrpouChange} maxLength={8} disabled={!edit_access} />
        <hr />

        <Selector
          list={window.products_list}
          selectedName={counterpartyStore.counterparty.product_name}
          fieldName={'Продукція'}
          onChange={this.onProductChange}
          disabled={!edit_access}
        />
      </>
    );
  }
}

export default view(CounterpartyInfo);
