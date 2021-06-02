'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from './non_compliance_store';
import NCItem from 'boards/templates/boards/non_compliances/non_compliance/item';
import NCRow from 'boards/templates/boards/non_compliances/non_compliance/row';
class NCThirdPhase extends React.Component {
  
  render() {
    const {non_compliance} = nonComplianceStore;
    
    return (
      <div>
        <NCRow>
          <NCItem className='font-weight-bold text-center text-white bg-dark'>
            Виконання
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem className='text-danger'>УВАГА якщо це повторна поставка товару постачальником, надати 1 накладну на повернення</NCItem>
        </NCRow>
        
      </div>
    );
  }
}

export default view(NCThirdPhase);
