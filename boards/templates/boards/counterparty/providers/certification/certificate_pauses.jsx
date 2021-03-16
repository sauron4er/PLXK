'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from '../../components/counterparty_store';
import CertificatePause from './certificate_pause';

class CertificatePauses extends React.Component {
  state = {
    start: '',
    end: ''
  };

  onStartChange = (e) => {
    this.setState({start: e.target.value});
  };

  onEndChange = (e) => {
    this.setState({end: e.target.value});
  };

  changePause = (index, start, end) => {
    counterpartyStore.certificate.pauses[index].start = start;
    counterpartyStore.certificate.pauses[index].end = end;
  };

  render() {
    const {pauses} = counterpartyStore.certificate;
  
    return (
      <div>
        <div>Паузи:</div>
        <table className='table table-sm mt-1'>
          <thead className='thead-inverse'>
            <tr>
              <th>Дата початку</th>
              <th>Дата кінця</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <For each='pause' index='index' of={pauses}>
              <CertificatePause key={pause.id} pause={pause} index={index} changePause={this.changePause} />
            </For>
          </tbody>
        </table>
      </div>
    );
  }
}

export default view(CertificatePauses);
