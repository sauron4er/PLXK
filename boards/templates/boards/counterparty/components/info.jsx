'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import providerStore from '../provider/provider_store';
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
    providerStore.provider.name = e.target.value;
  };

  onEdrpouChange = (e) => {
    providerStore.provider.edrpou = e.target.value;
  };

  onLegalAddressChange = (e) => {
    providerStore.provider.legal_address = e.target.value;
  };

  onActualAddressChange = (e) => {
    providerStore.provider.actual_address = e.target.value;
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
      const item = getItemById(selected_product_id, providerStore.provider.products);
      if (item === -1) {
        const selected_product = {
          ...getItemById(selected_product_id, window.products_list),
          status: 'new'
        };
        let new_products = [...providerStore.provider.products];
        new_products.push(selected_product);
        new_products = uniqueArray(new_products);
        providerStore.provider.products = new_products;
      } else {
        if (item.status === 'delete') {
          const product_index = getIndex(item.id, providerStore.provider.products);
          providerStore.provider.products[product_index].status = 'old';
        }
      }

      this.setState({
        selected_product: '',
        selected_product_id: 0
      });
    }
  };
  
  onProductDelete = (i) => {
    if (providerStore.provider.products[i].status === 'new') {
      providerStore.provider.products.splice(i, 1);
    } else {
      providerStore.provider.products[i].status = 'delete';
    }
  };

  render() {
    const {provider, edit_access} = providerStore;
    const {selected_product, selected_product_id} = this.state;

    return (
      <>
        <TextInput text={provider.name} fieldName={'* Назва'} onChange={this.onNameChange} maxLength={100} disabled={!edit_access} />
        <hr/>
        <TextInput
          text={provider.legal_address}
          fieldName={'Юридична адреса'}
          onChange={this.onLegalAddressChange}
          maxLength={200}
          disabled={!edit_access}
        />
        <hr/>
        <TextInput
          text={provider.actual_address}
          fieldName={'Фактична адреса'}
          onChange={this.onActualAddressChange}
          maxLength={200}
          disabled={!edit_access}
        />
        <hr/>
        <TextInput text={provider.edrpou} fieldName={'ЄДРПОУ'} onChange={this.onEdrpouChange} maxLength={8} disabled={!edit_access} />
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
          <For each='product' index='index' of={providerStore.provider.products}>
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
