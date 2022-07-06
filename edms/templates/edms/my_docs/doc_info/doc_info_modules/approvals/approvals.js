'use strict';
import * as React from 'react';
import {faCheckDouble} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Approval from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/approvals/approval';
import SubmitButton from 'templates/components/form_modules/submit_button';
import Modal from 'react-responsive-modal';
import NewApprovals from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/approvals/new_approvals';
import {axiosPostRequest} from 'templates/components/axios_requests';
import { notify } from "templates/components/my_extras";

class Approvals extends React.Component {
  state = {
    approvals: this.props.info.approval_list,
    modal_open: false
  };

  postApprovals = (new_approvals) => {
    let formData = new FormData();
    formData.append('doc_id', this.props.info.id);
    formData.append('approvals', JSON.stringify(new_approvals));
    formData.append('resp_seat_id', this.props.info.responsible_seat_id);
    axiosPostRequest('add_approvals', formData)
      .then((response) => {
        if (response === 'error') notify('Помилка при додаванні візуючих, оновіть сторінку або зверніться до адміністратора');
        else {
          this.addApprovals(response);
          this.closeModal();
        }
      })
      .catch((error) => notify(error));
  };

  addApprovals = (new_approvals) => {
    let approvals = [...this.state.approvals];
    approvals.splice(-1, 0, ...new_approvals);
    this.setState({approvals});
  };

  delApproval = (index) => {
    let approvals = [...this.state.approvals];
    approvals.splice(index, 1);
    this.setState({approvals});
  };

  openModal = () => {
    this.setState({modal_open: true});
  };

  closeModal = () => {
    this.setState({modal_open: false});
  };

  render() {
    const {info} = this.props;
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
              <If condition={info.approvals_changeable}>
                <th> </th>
              </If>
            </tr>
          </thead>
          <tbody>
            <For each='approval' index='idx' of={approvals}>
              <Approval key={idx} approval={approval} info={info} index={idx} delApproval={this.delApproval} />
            </For>
          </tbody>
        </table>
        <If condition={info.approvals_changeable}>
          <SubmitButton className='btn-sm btn-outline-info my-0' text='Додати візуючих' onClick={this.openModal} />
        </If>
        <Modal
          open={modal_open}
          onClose={this.closeModal}
          showCloseIcon={false}
          closeOnOverlayClick={false}
          styles={{modal: {marginTop: 100}}}
        >
          <NewApprovals postApprovals={this.postApprovals} closeModal={this.closeModal} />
        </Modal>
      </div>
    );
  }
  
  static defaultProps = {
    info: {},
  };
}

export default Approvals;
