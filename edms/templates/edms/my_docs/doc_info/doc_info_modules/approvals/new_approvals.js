'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import { notify, uniqueArray } from "templates/components/my_extras";
import { axiosGetRequest, axiosPostRequest } from "templates/components/axios_requests";
import MultiSelectorWithFilter from "templates/components/form_modules/multi_selector_with_filter";

class NewApprovals extends React.Component {
  state = {
    emp_seats: [],
    approvals: [],
    emp_seat_id: '0',
    emp_seat: ''
  };

  componentWillMount() {
    axiosGetRequest('get_emp_seats')
      .then((response) => {
        this.setState({emp_seats: response});
      })
      .catch((error) => {
        notify(error);
      });
  }
  
  onChange = (e) => {
    this.setState({
      emp_seat_id: e.id,
      emp_seat: e.name
    });
    this.addApproval(e.id, e.name);
  };
  
  addApproval = (id, name) => {
    let approval_list = [...this.state.approvals];
    approval_list.push({
      emp_seat_id: id,
      emp_seat: name
    });
    const unique_seats = uniqueArray(approval_list, 'emp_seat_id');
    this.setState({
      approvals: unique_seats,
      emp_seat_id: '',
      emp_seat: ''
    });
  };

  delApproval = (index) => {
    let approvals = this.state.approvals;
    approvals.splice(index, 1);
    this.setState({approvals: approvals});
  };
  
  postApprovals = () => {
    this.props.postApprovals(this.state.approvals)
  }

  render() {
    const {approvals, emp_seats} = this.state;
    const {closeModal} = this.props;
    return (
      <div style={{minHeight: '400px', minWidth: '600px'}}>
        <div className='modal-header d-flex justify-content-between'>
          <h5 className='modal-title font-weight-bold'>Додаткові візуючі</h5>
          <button className='btn btn-link' onClick={closeModal}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <Choose>
          <When condition={emp_seats.length > 0}>
            <div className='modal-body'>
              <MultiSelectorWithFilter
                fieldName='На візування'
                list={emp_seats}
                onChange={this.onChange}
                getOptionLabel={(option) => option.emp + ', ' + option.seat}
                getOptionValue={(option) => option.id}
                disabled={false}
              />
              
              <If condition={approvals.length > 0}>
                <ul className='mt-1'>
                  {approvals.map((approval, index) => {
                    return (
                      <div key={index} className='d-flex align-items-start'>
                        <li>{approval.emp_seat}</li>
                        <button
                          className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                          onClick={this.delApproval.bind(undefined, index)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    );
                  })}
                </ul>
                <button className='btn btn-info' onClick={this.postApprovals}>
                  Відправити
                </button>
              </If>
            </div>
          </When>
          <Otherwise>
            <div className='mt-4 loader-small' id='loader-1'>
              {' '}
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }

  static defaultProps = {
    doc_id: 0,
    resolutions: [],
    postApprovals: () => {}
  };
}

export default NewApprovals;
