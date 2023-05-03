'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from './counterparty_store';
import TextInput from 'templates/components/form_modules/text_input';
import Selector from 'templates/components/form_modules/selectors/selector';
import Files from 'templates/components/form_modules/files';

class CounterpartyInfo extends React.Component {
  state = {
    selected_product: '',
    selected_product_id: 0
  };

  onNameChange = (e) => {
    counterpartyStore.counterparty.name = e.target.value;
  };

  onCountryChange = (e) => {
    counterpartyStore.counterparty.country = e.target.value;
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

  onCommentaryChange = (e) => {
    counterpartyStore.counterparty.commentary = e.target.value;
  };

  onProductChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    counterpartyStore.counterparty.product_id = e.target.options[selectedIndex].getAttribute('data-key');
    counterpartyStore.counterparty.product = e.target.options[selectedIndex].getAttribute('value');
  };

  onBankDetailsChange = (e) => {
    counterpartyStore.counterparty.bank_details = e.target.value;
  };

  onContactsChange = (e) => {
    counterpartyStore.counterparty.contacts = e.target.value;
  };

  onScopeChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    counterpartyStore.counterparty.scope_id = e.target.options[selectedIndex].getAttribute('data-key');
    counterpartyStore.counterparty.scope = e.target.options[selectedIndex].getAttribute('value');
  };

  onResponsibleChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    counterpartyStore.counterparty.responsible_id = e.target.options[selectedIndex].getAttribute('data-key');
    counterpartyStore.counterparty.responsible = e.target.options[selectedIndex].getAttribute('value');
  };

  render() {
    const {counterparty, type, scopes, employees} = counterpartyStore;
    const {edit_access} = window;

    return (
      <>
        <TextInput text={counterparty.name} fieldName={'* Назва'} onChange={this.onNameChange} maxLength={100} disabled={!edit_access} />
        <If condition={type === 'client'}>
          <hr />
          <TextInput
            text={counterparty.country}
            fieldName={'Країна'}
            onChange={this.onCountryChange}
            maxLength={100}
            disabled={!edit_access}
          />
        </If>
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
          selectedName={counterpartyStore.counterparty.product}
          fieldName={'* Продукція'}
          onChange={this.onProductChange}
          disabled={!edit_access}
        />
        <If condition={type === 'client'}>
          <hr />
          <Files
            oldFiles={counterpartyStore.counterparty.old_bag_scheme_files}
            newFiles={counterpartyStore.new_bag_scheme_files}
            fieldName={'Схема укладки мішків на піддон'}
            onChange={this.onBagSchemeFilesChange}
            onDelete={this.onBagSchemeFilesDelete}
            disabled={!edit_access}
          />
        </If>
        <hr />
        <TextInput
          text={counterparty.bank_details}
          fieldName={'Реквізити'}
          onChange={this.onBankDetailsChange}
          maxLength={200}
          disabled={!edit_access}
        />
        <hr />
        <TextInput
          text={counterparty.contacts}
          fieldName={'Контактні дані'}
          onChange={this.onContactsChange}
          maxLength={200}
          disabled={!edit_access}
        />
        <If condition={type === 'client'}>
          <hr />
          <Selector
            list={scopes}
            selectedName={counterpartyStore.counterparty.scope}
            fieldName={'Сфера застосування продукції'}
            onChange={this.onScopeChange}
            disabled={!edit_access}
          />
          <hr />
          <Selector
            list={employees}
            selectedName={counterpartyStore.counterparty.responsible}
            fieldName={'Відповідальна особа за комунікації з клієнтом'}
            onChange={this.onResponsibleChange}
            disabled={!edit_access}
          />
        </If>
        <hr />
        <TextInput
          text={counterparty.commentary}
          fieldName={'Коментар'}
          onChange={this.onCommentaryChange}
          maxLength={3000}
          disabled={!edit_access}
        />
      </>
    );
  }
}

export default view(CounterpartyInfo);
