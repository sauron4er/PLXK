'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from './counterparty_store';
import Correspondence from 'correspondence/templates/correspondence/correspondence';

class CounterpartyCorrespondence extends React.Component {
  render() {
    const {counterparty} = counterpartyStore;

    return (
      <If condition={counterparty.id !== 0}>
        <Correspondence counterparty_id={counterparty.id} counterparty_name={counterparty.name} />
      </If>
    );
  }
}

export default view(CounterpartyCorrespondence);
