'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from './counterparty_store';
import Contracts from 'docs/templates/docs/contracts';

class CounterpartyContracts extends React.Component {
  
  
  render() {
    const {counterparty, edit_access} = counterpartyStore;
  
    return (
      <If condition={counterparty.id !== 0}><Contracts counterparty_filter={counterparty.id} counterparty_name={counterparty.name}/></If>
    );
  }
}

export default view(CounterpartyContracts);
