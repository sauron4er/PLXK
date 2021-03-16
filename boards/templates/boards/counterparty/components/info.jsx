'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from './counterparty_store';
import TextInput from 'templates/components/form_modules/text_input';
import MultiSelector from 'templates/components/form_modules/multi_selector';
import {getIndex, getItemById, uniqueArray} from 'templates/components/my_extras';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';

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

  selectProduct = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    this.setState(
      {
        selected_product_id: e.target.options[selectedIndex].getAttribute('data-key'),
        selected_product: e.target.options[selectedIndex].getAttribute('value')
      },
      () => this.addProduct(this.state.selected_product_id)
    );
  };

  addProduct = (selected_product_id) => {
    if (selected_product_id) {
      const item = getItemById(selected_product_id, counterpartyStore.counterparty.products);
      if (item === -1) {
        const selected_product = {
          ...getItemById(selected_product_id, window.products_list),
          status: 'new'
        };
        let new_products = [...counterpartyStore.counterparty.products];
        new_products.push(selected_product);
        new_products = uniqueArray(new_products);
        counterpartyStore.counterparty.products = new_products;
      } else {
        if (item.status === 'delete') {
          const product_index = getIndex(item.id, counterpartyStore.counterparty.products);
          counterpartyStore.counterparty.products[product_index].status = 'old';
        }
      }

      this.setState({
        selected_product: '',
        selected_product_id: 0
      });
    }
  };
  
  onProductDelete = (i) => {
    if (counterpartyStore.counterparty.products[i].status === 'new') {
      counterpartyStore.counterparty.products.splice(i, 1);
    } else {
      counterpartyStore.counterparty.products[i].status = 'delete';
    }
  };

  render() {
    const {counterparty} = counterpartyStore;
    const {edit_access} = window;
    const {selected_product} = this.state;
  
    return (
      <>
        <TextInput text={counterparty.name} fieldName={'* Назва'} onChange={this.onNameChange} maxLength={100} disabled={!edit_access} />
        <hr/>
        <TextInput
          text={counterparty.legal_address}
          fieldName={'Юридична адреса'}
          onChange={this.onLegalAddressChange}
          maxLength={200}
          disabled={!edit_access}
        />
        <hr/>
        <TextInput
          text={counterparty.actual_address}
          fieldName={'Фактична адреса'}
          onChange={this.onActualAddressChange}
          maxLength={200}
          disabled={!edit_access}
        />
        <hr/>
        <TextInput text={counterparty.edrpou} fieldName={'ЄДРПОУ'} onChange={this.onEdrpouChange} maxLength={8} disabled={!edit_access} />
        <hr/>
        <MultiSelector
          list={window.products_list}
          selectedName={selected_product}
          valueField={'name'}
          fieldName={'Продукція'}
          onChange={this.selectProduct}
          disabled={!edit_access}
          withAddButton={false}
        />
        <div className='mt-2'>
          <For each='product' index='index' of={counterpartyStore.counterparty.products}>
            <If condition={product.status !== 'delete'}>
              <div className='d-flex mb-1' key={index}>
                <div>{product.name}</div>
                <button
                  className='btn btn-sm btn-outline-secondary font-weight-bold ml-auto'
                  onClick={() => this.onProductDelete(index)}
                  disabled={!edit_access}
                >
                  <FontAwesomeIcon icon={faTimes}/>
                </button>
              </div>
            </If>
          </For>
        </div>
      </>
    );
  }
}

export default view(CounterpartyInfo);
