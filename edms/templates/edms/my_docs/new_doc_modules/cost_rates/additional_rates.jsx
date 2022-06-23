import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';
import AdditionalCostRate from "edms/templates/edms/my_docs/new_doc_modules/cost_rates/additional_rate";

class AdditionalCostRates extends React.Component {
  changeACR = (index, ACR) => {
    newDocStore.new_document.cost_rates.additional_fields[index] = ACR;
  };
  
  addBlankAdditionalCostRate = () => {
    newDocStore.new_document.cost_rates.additional_fields.push({id: 0, name: '', unit: '', term: '', norm: '', comment: ''});
  };
  
  render() {
    const {additional_fields} = newDocStore.new_document.cost_rates
    
    return (
      <Choose>
        <When condition={additional_fields.length > 0}>
          <div className='mb-1'><small className='font-weight-bold'>Додаткові норми витрат:</small></div>
          <For each='acr' of={additional_fields} index='index'>
            <AdditionalCostRate key={index} index={index}/>
          </For>
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-outline-primary' onClick={() => this.addBlankAdditionalCostRate()}>
            Додати норму витрат
          </button>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {};
}

export default view(AdditionalCostRates);
