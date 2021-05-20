'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from './non_compliance_store';
class NCThirdPhase extends React.Component {
  
  render() {
    return (
      <div style={nonComplianceStore.getStyle(3)}>
        Виконання
      </div>
    );
  }
}

export default view(NCThirdPhase);
