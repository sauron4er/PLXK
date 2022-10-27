'use strict';
import * as React from 'react';
import ContractView from 'docs/templates/docs/contracts/contract_simple_view';
import Modal from 'react-responsive-modal';

class ContractInfo extends React.Component {
  state = {
    contract_modal_open: false
  };

  render() {
    const {fieldName, contract} = this.props;
    const {contract_modal_open} = this.state;

    return (

        <If condition={contract.id !== 0}>
          <div>Це додаткова угода до Договору:</div>
          <div className='css_note_text'>
            <div>
              № {contract.number}, "{contract.subject}"
            </div>

            <button className='btn btn-sm btn-outline-info my-1' onClick={() => this.setState({contract_modal_open: true})}>
              Переглянути Договір
            </button>
          </div>
          <Modal
            open={contract_modal_open}
            onClose={() => this.setState({contract_modal_open: false})}
            showCloseIcon={true}
            closeOnOverlayClick={true}
            styles={{modal: {marginTop: 75}}}
          >
            <ContractView id={contract.id} />
          </Modal>
        </If>
    );
  }

  static defaultProps = {
    contract: {
      id: 0,
      subject: ''
    },
    fieldName: '---'
  };
}

export default ContractInfo;
