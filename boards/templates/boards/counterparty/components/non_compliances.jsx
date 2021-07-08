'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from './counterparty_store';
import NonCompliances from "boards/templates/boards/non_compliances/non_compliances";

class CounterpartyNonCompliances extends React.Component {
  render() {
    const {counterparty} = counterpartyStore;

    return (
      <If condition={counterparty.id !== 0}>
        <NonCompliances counterparty_id={counterparty.id} counterparty_name={counterparty.name} />
      </If>
    );
  }
}

export default view(CounterpartyNonCompliances);
