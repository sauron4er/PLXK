'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {notify} from 'templates/components/my_extras';
import {axiosGetRequest} from 'templates/components/axios_requests';

class NewApprovals extends React.Component {
  state = {
    emp_seats: [],
    approvals: [],
    emp_seat_id: '0',
    emp_seat: ''
  };

  componentWillMount() {
    axiosGetRequest('get_emp_seats/')
      .then((response) => {
        this.setState({emp_seats: response});
      })
      .catch((error) => {
        notify(error);
      });
  }

  onChange = (event) => {
    if (event.target.name === 'approval') {
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        emp_seat_id: event.target.options[selectedIndex].getAttribute('data-key'),
        emp_seat: event.target.options[selectedIndex].getAttribute('value')
      });
    } else {
      this.setState({[event.target.name]: event.target.value});
    }
  };

  // заставляє батьківський компонент запостити позначку
  onClick = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state.approvals);
  };

  addApproval = () => {
    if (this.state.emp_seat_id !== '0') {
      const new_approval = {
        emp_seat_id: this.state.emp_seat_id,
        emp_seat: this.state.emp_seat
      };
      this.setState((prevState) => ({
        approvals: [...prevState.approvals, new_approval],
        emp_seat_id: '0',
        emp_seat: ''
      }));
    } else {
      notify('Оберіть отримувача.');
    }
  };

  delApproval = (index) => {
    let approvals = this.state.approvals;
    approvals.splice(index, 1);
    this.setState({approvals: approvals});
  };

  render() {
    const {emp_seat, approvals, emp_seats} = this.state;
    const {onCloseModal} = this.props;
    return (
      <>
        <div className='modal-header d-flex justify-content-between'>
          <h5 className='modal-title font-weight-bold'>Створення списку на погодження</h5>
          <button className='btn btn-link' onClick={onCloseModal}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <Choose>
          <When condition={emp_seats.length > 0}>
            <div className='modal-body'>
              <label htmlFor='approval-select'>На погодження:</label>
              <select className='full_width form-control' id='approval-select' name='approval' value={emp_seat} onChange={this.onChange}>
                <option data-key={0} value='Не внесено'>
                  ------------
                </option>
                {emp_seats.map((emp_seat) => {
                  return (
                    <option key={emp_seat.id} data-key={emp_seat.id} value={emp_seat.emp + ', ' + emp_seat.seat}>
                      {emp_seat.emp}, {emp_seat.seat}
                    </option>
                  );
                })}
              </select>
              <button className='mt-2 btn btn-outline-secondary' onClick={this.addApproval}>
                Додати
              </button>
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
                <button className='btn btn-info' onClick={this.onClick}>
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
      </>
    );
  }

  static defaultProps = {
    resolutions: []
  };
}

export default NewApprovals;
