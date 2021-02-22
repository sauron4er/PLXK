'use strict';
import * as React from 'react';
import ContractView from 'docs/templates/docs/contracts/contract_view';
import Modal from 'react-responsive-modal';

class Stage extends React.Component {
  render() {
    const {stage} = this.props;
  
    return (
      <div className='mt-2'>
        Стадія виконання:
        <Choose>
          <When condition={stage==='in work'}>
            <span className='ml-1 p-1 border bg-warning'>В роботі</span>
          </When>
          <When condition={stage==='denied'}>
            <span className='ml-1 p-1 border bg-danger'>Відмовлено</span>
          </When>
          <When condition={stage==='done'}>
            <span className='ml-1 p-1 border bg-info'>Виконано</span>
          </When>
          <When condition={stage==='confirm'}>
            <span className='ml-1 p-1 border bg-success'>Виконання підтверджено</span>
          </When>
          <Otherwise>
            <span className='ml-1 p-1 border'>Ініційовано</span>
          </Otherwise>
        </Choose>
      </div>
    );
  }

  static defaultProps = {
    stage: ''
  };
}

export default Stage;
