'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from 'boards/templates/boards/counterparty/components/counterparty_store';
import Tables from 'edms/templates/edms/tables/tables';

class CounterpartyMockups extends React.Component {
  
  render() {
    const {counterparty, edit_access} = counterpartyStore;
  
    return (
      <If condition={counterparty.id !== 0}>
        <Tables doc_type_id={6} counterparty_id={counterparty.id}/>
      </If>
    );
  }
}

export default view(CounterpartyMockups);
