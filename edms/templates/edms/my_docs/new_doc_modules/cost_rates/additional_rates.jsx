import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';
import AdditionalRequirement
  from 'edms/templates/edms/my_docs/new_doc_modules/client_requirements/additional_requirement';

class AdditionalRequirements extends React.Component {
  
  changeAR = (index, name, requirement) => {
    newDocStore.new_document.client_requirements.additional_requirements[index].name = name;
    newDocStore.new_document.client_requirements.additional_requirements[index].requirement = requirement;
  };
  
  render() {
    const {additional_requirements} = newDocStore.new_document.client_requirements
    const {addBlankAdditionalRequirement} = newDocStore
    
    return (
      <Choose>
        <When condition={additional_requirements.length > 0}>
          <div className='mb-1'><small className='font-weight-bold'>Додаткові нестандартні вимоги:</small></div>
          <For each='ar' of={additional_requirements} index='index'>
            <AdditionalRequirement key={ar.id} ar={ar} index={index} changeAR={this.changeAR}/>
          </For>
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-outline-primary' onClick={() => addBlankAdditionalRequirement()}>
            Додати вимоги
          </button>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {};
}

export default view(AdditionalRequirements);
