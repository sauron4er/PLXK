'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import {LoaderSmall} from 'templates/components/loaders';

class ProductType extends React.Component {
  state = {
    products: [],
    sub_products: [],
    loading: true
  };

  componentDidMount() {
    axiosGetRequest('get_product_types/' + this.props.direction + '/')
      // axiosGetRequest('get_product_types')
      .then((response) => {
        this.setState({
          products: response.products,
          sub_products: response.sub_products,
          loading: false
        });
      })
      .catch((error) => console.log(error));
  
      this.changeDocVersion();
  }
  
  changeDocVersion = () => {
    switch (newDocStore.new_document.sub_product_type) {
      case 1:
      case '1':
      case 2:
      case '2':
        newDocStore.new_document.doc_version = 1;
        break;
      case 3:
      case '3':
        newDocStore.new_document.doc_version = 2;
        break;
      case 4:
      case '4':
      case 5:
      case '5':
        newDocStore.new_document.doc_version = 3;
        break;
      default:
        newDocStore.new_document.doc_version = 0;
        break;
    }
  };

  getSubTypes = () => {
    const sub_products = this.state.sub_products.filter((sp) => sp.type_id == newDocStore.new_document.product_type);
    return sub_products.map((sp) => {
      return (
        <option key={sp.id} data-key={sp.id} value={sp.name}>
          {sp.name}
        </option>
      );
    });
  };

  onProductChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    newDocStore.new_document.product_type = event.target.options[selectedIndex].getAttribute('data-key');
    newDocStore.new_document.product_type_name = event.target.options[selectedIndex].getAttribute('value');
    newDocStore.new_document.sub_product_type = 0;
    newDocStore.new_document.sub_product_type_name = '';
    newDocStore.clean_client_requirements();
    this.changeDocVersion();
  };
  
  onSubProductChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    newDocStore.new_document.sub_product_type = event.target.options[selectedIndex].getAttribute('data-key');
    newDocStore.new_document.sub_product_type_name = event.target.options[selectedIndex].getAttribute('value');
    newDocStore.clean_client_requirements();
    this.changeDocVersion();
  };

  render() {
    const {module_info} = this.props;
    const {loading, products} = this.state;
  
    return (
      <Choose>
        <When condition={!loading}>
          <div className='row align-items-center mt-1 mr-lg-1'>
            <label className='col-lg-4' htmlFor='product_type'>
              {module_info.field_name}:
            </label>
            <select
              className='col-lg-8 form-control mx-3 mx-lg-0'
              id='product_type'
              name='product_type'
              value={newDocStore.new_document.product_type_name}
              onChange={this.onProductChange}
            >
              <option key={0} data-key={0} value='0'>
                ------------
              </option>
              {products.map((ptype) => {
                return (
                  <option key={ptype.id} data-key={ptype.id} value={ptype.name}>
                    {ptype.name}
                  </option>
                );
              })}
            </select>
            </div>
          <div className='row align-items-center mt-1 mr-lg-1'>
            <label className='col-lg-4' htmlFor='sub_product_type'>
              Підтип продукції:
            </label>
            <select
              className='col-lg-8 form-control mx-3 mx-lg-0'
              id='sub_product_type'
              name='sub_product_type'
              value={newDocStore.new_document.sub_product_type_name}
              onChange={this.onSubProductChange}
            >
              <option key={0} data-key={0} value='0'>
                ------------
              </option>
              {this.getSubTypes()}
            </select>
          </div>
          <small className='text-danger'>{module_info?.additional_info}</small>
        </When>
        <Otherwise>
          <LoaderSmall />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    direction: '',
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default view(ProductType);
