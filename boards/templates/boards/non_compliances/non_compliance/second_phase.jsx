'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from './non_compliance_store';
class NCSecondPhase extends React.Component {
  
  render() {
    return (
      <div style={nonComplianceStore.getStyle(2)}>
        Рішення
      </div>
    );
  }
}

export default view(NCSecondPhase);
