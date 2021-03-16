'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from './counterparty_store';

class CounterpartyContracts extends React.Component {
  
  
  render() {
    const {counterparty, edit_access} = counterpartyStore;

    return (
      <div>Договори</div>
    );
  }
}

export default view(CounterpartyContracts);
