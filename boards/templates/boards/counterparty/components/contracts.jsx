'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import providerStore from '../provider/provider_store';

class CounterpartyContracts extends React.Component {
  
  
  render() {
    const {provider, edit_access} = providerStore;

    return (
      <div>Договори</div>
    );
  }
}

export default view(CounterpartyContracts);
