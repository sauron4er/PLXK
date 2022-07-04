'use strict';
import * as React from 'react';
import {faCheckDouble} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Approval from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/approvals/approval';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {ToastContainer} from 'react-toastify';
import Modal from 'react-responsive-modal';
import NewApprovals from "edms/templates/edms/my_docs/doc_info/doc_info_modules/approvals/new_approvals";

class Approvals extends React.Component {
  state = {
    approvals: this.props.approvals,
    modal_open: false
  };

  openModal = () => {
    this.setState({modal_open: true})
  };
  
  addApprovals = () => {
    console.log(1);
  };

  delApproval = (index) => {
    let approvals = [...this.state.approvals];
    approvals.splice(index, 1);
    this.setState({approvals});
  };
  
  onCloseModal = () => {
    this.setState({modal_open: false})
  }

  render() {
    const {changeable} = this.props;
    const {approvals, modal_open} = this.state;

    return (
      <div className='mt-2'>
        Таблиця візування:
        <table className='table table-bordered mt-2 bg-white'>
          <thead>
            <tr>
              <th className='text-center'>
                <FontAwesomeIcon icon={faCheckDouble} />
              </th>
              <th>П.І.Б., посада</th>
              <th>Коментар</th>
              <th className='text-center'>Дата</th>
              <If condition={changeable}>
                <th> </th>
              </If>
            </tr>
          </thead>
          <tbody>
            <For each='approval' index='idx' of={approvals}>
              <Approval key={idx} approval={approval} changeable={changeable} index={idx} delApproval={this.delApproval} />
            </For>
          </tbody>
        </table>
        <If condition={changeable}>
          <SubmitButton className='btn-sm btn-outline-info my-0' text='Додати візуючих' onClick={this.openModal} />
        </If>
        <Modal
          open={modal_open}
          onClose={this.onCloseModal}
          showCloseIcon={false}
          closeOnOverlayClick={false}
          styles={{modal: {marginTop: 100}}}
        >
          <NewApprovals addApprovals={this.addApprovals} />
        </Modal>
      </div>
    );
  }

  static defaultProps = {
    approvals: [],
    changeable: false
  };
}

export default Approvals;
