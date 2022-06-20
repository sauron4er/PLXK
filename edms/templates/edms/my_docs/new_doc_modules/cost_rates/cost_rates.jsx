import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selector_with_filter_and_axios';
import {axiosPostRequest} from 'templates/components/axios_requests';
import CostRatesItem from 'edms/templates/edms/my_docs/new_doc_modules/cost_rates/cost_rates_item';
import SelectorWithFilter from 'templates/components/form_modules/selector_with_filter';

class CostRates extends React.Component {
  state = {
    product_list: []
  };

  getFields() {
    axiosPostRequest(`get_cost_rates_fields/${newDocStore.new_document.cost_rates.product}`)
      .then((response) => {
        newDocStore.new_document.cost_rates.fields = response;
      })
      .catch((error) => notify(error));
  }

  onProductChange = (e) => {
    newDocStore.new_document.cost_rates.product = e.id;
    newDocStore.new_document.cost_rates.product_name = e.name;
    newDocStore.new_document.cost_rates.department = e.department;
    this.getFields();
  };
  
  onTypeChange = (e) => {
    newDocStore.new_document.cost_rates.type = e.name;
  };
  
  onAccountingChange = (e) => {
    newDocStore.new_document.cost_rates.accounting = e.name;
  };
  
  onProductTypeChange = (e) => {
    newDocStore.new_document.cost_rates.product_type = e.name;
  };

  render() {
    const {type, accounting, product_type,  department, product, product_name, fields} = newDocStore.new_document.cost_rates;
  
    return (
      <>
        <SelectorWithFilter
          list={[
            {id: 0, name: 'Основні'},
            {id: 1, name: 'Тимчасові'},
            {id: 2, name: 'Для планування'}
          ]}
          fieldName={'* Тип норм витрат'}
          value={{name: type}}
          onChange={this.onTypeChange}
          disabled={false}
        />
        <hr/>
        
        <SelectorWithFilter
          list={[
            {id: 0, name: 'Бухгалтерський'},
            {id: 1, name: 'Управлінський'}
          ]}
          fieldName={'* Тип обліку'}
          value={{name: accounting}}
          onChange={this.onAccountingChange}
          disabled={false}
        />
        <hr/>
        
        <SelectorWithFilter
          list={[
            {id: 0, name: 'Напівфабрикати'},
            {id: 1, name: 'Готова продукція'}
          ]}
          fieldName={'* Вид продукції'}
          value={{name: product_type}}
          onChange={this.onProductTypeChange}
          disabled={false}
        />
        <hr/>
        
        <SelectorWithFilterAndAxios
          listNameForUrl='cost_rates_products'
          fieldName='* Тип продукції'
          selectId='product_select'
          value={{name: product_name, id: product}}
          onChange={this.onProductChange}
          disabled={false}
        />
        <If condition={department}>
          <small>
            Виробничий підрозділ: <span className='font-weight-bold'>{department}</span>
          </small>
        </If>
        
        <If condition={fields.length}>
          <hr />
          <For each='field' of={fields} index='idx'>
            <CostRatesItem key={idx} index={idx} name={field.name} unit={field.unit} isRequired={field.is_required} />
          </For>
        </If>
      </>
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

export default view(CostRates);
