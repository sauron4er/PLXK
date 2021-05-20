'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from './non_compliance_store';
class NCComments extends React.Component {
  
  render() {
    return (
      <>
        Коментарі
      </>
    );
  }
}

export default view(NCComments);
