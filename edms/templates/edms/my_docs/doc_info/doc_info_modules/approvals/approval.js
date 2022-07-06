'use strict';
import * as React from 'react';
import {faCircle, faCheckCircle, faTimesCircle} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { axiosPostRequest } from "templates/components/axios_requests";
import {notify} from 'templates/components/my_extras';

class Approval extends React.Component {
  state = {
    delete_loading: false
  };

  getCheckedStyle = (approved) => {
    let checkedStyle = 'align-self-center';
    if (approved === true) {
      checkedStyle = checkedStyle + ' text-success';
    } else if (approved === false) {
      checkedStyle = checkedStyle + ' text-danger';
    }
    return checkedStyle;
  };

  deleteApproval = () => {
    this.setState({delete_loading: true}, () => {
      let formData = new FormData();
      formData.append('doc_id', this.props.info.id);
      formData.append('resp_seat_id', this.props.info.responsible_seat_id);
      axiosPostRequest(`del_approval/${this.props.approval.id}`, formData)
        .then((response) => {
          this.setState({delete_loading: false});
          if (response === 'ok') this.props.delApproval(this.props.index);
          else notify('Помилка при видаленні візуючого, оновіть сторінку або зверніться до адміністратора')
        })
        .catch((error) => notify(error));
    });
  };

  render() {
    const {approval, info} = this.props;
    const {delete_loading} = this.state;
  
    return (
      <tr>
        <td className='align-middle text-center'>
          <div className={this.getCheckedStyle(approval.approved)}>
            <Choose>
              <When condition={approval.approved === true}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </When>
              <Otherwise>
                <FontAwesomeIcon icon={faCircle} />
              </Otherwise>
            </Choose>
          </div>
        </td>
        <td className='align-middle'>
          <small>{approval.emp_seat}</small>
        </td>
        <td className='align-middle'>
          <small>{approval.comment}</small>
        </td>
        <td className='align-middle text-center'>
          <small>{approval.approved_date}</small>
        </td>

        <If condition={info?.approvals_changeable && approval.approve_queue === 1}>
          <td className='align-middle text-center'>
            {/*approval.approve_queue === 0 - автор, 1 - візуючі, 2 - директори*/}
            <Choose>
              <When condition={delete_loading}>
                <div className='spinner-border spinner-border-sm' role='status'>
                  <span className='sr-only'>Loading...</span>
                </div>
              </When>
              <Otherwise>
                <button type='button btn-sm' className='close' aria-label='Close' onClick={this.deleteApproval}>
                  <span aria-hidden='true'>&times;</span>
                </button>
              </Otherwise>
            </Choose>
          </td>
        </If>
      </tr>
    );
  }

  static defaultProps = {
    approval: [],
    info: {},
    index: -1,
    delApproval: () => {}
  };
}

export default Approval;
