'use strict';
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import {uniqueArray} from '../../_else/my_extras';

class Approvals extends React.Component {
  state = {
    approval_seats: this.props.approvalSeats,
    select_approval_seat_id: 0,
    select_approval_seat: '',
    seat_list: []
  };

  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    this.setState({
      select_approval_seat_id: event.target.options[selectedIndex].getAttribute('data-key'),
      select_approval_seat: event.target.options[selectedIndex].getAttribute('value')
    });
  };

  // отримуємо з бд список посад для селекту "На погодження"
  componentDidMount() {
    axios({
      method: 'get',
      url: 'get_seats/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        this.setState({
          seat_list: response.data
        });
      })
      .catch((error) => {
        console.log('errorpost: ' + error);
      });
  }

  // надсилає новий список у батьківський компонент:
  changeList = (new_list) => {
    const changed_event = {
      target: {
        name: 'approval_seats',
        value: new_list
      }
    };
    this.props.onChange(changed_event);
  };

  // додає нову посаду для погодження у список
  addNewApprovalSeat = (e) => {
    e.preventDefault();
    if (this.state.select_approval_seat !== '') {
      let approval_seats = [...this.state.approval_seats];
      approval_seats.push({
        id: this.state.select_approval_seat_id,
        seat: this.state.select_approval_seat
      });
      const unique_seats = uniqueArray(approval_seats);
      this.setState({
        approval_seats: unique_seats,
        select_approval_seat_id: '',
        select_approval_seat: ''
      });
      // надсилаємо новий список у батьківський компонент
      this.changeList(unique_seats);
    }
  };

  // видає посаду з списку погоджуючих
  delApprovalSeat = (e, seat_id) => {
    e.preventDefault();
    // надсилаємо новий список у батьківський компонент
    this.changeList(this.state.approval_seats.filter((seat) => seat.id !== seat_id));

    this.setState((prevState) => ({
      approval_seats: prevState.approval_seats.filter((seat) => seat.id !== seat_id)
    }));
  };

  render() {
    const {seat_list, select_approval_seat, approval_seats} = this.state;
    const {fieldName} = this.props;
    return (
      <If condition={seat_list.length > 0}>
        <br />
        <div className='d-flex align-items-start mt-1'>
          <label className='flex-grow-1 text-nowrap mr-1' htmlFor='select_approval_seat'>
            {fieldName}:
          </label>
          <select
            className='form-control'
            id='select_approval_seat'
            name='select_approval_seat'
            value={select_approval_seat}
            onChange={this.onChange}
          >
            <option key={0} data-key={0} value='0'>
              ------------
            </option>
            {seat_list.map((seat) => {
              return (
                <option key={seat.id} data-key={seat.id} value={seat.seat}>
                  {seat.seat}
                </option>
              );
            })}
          </select>
          <button
            className='btn btn-sm btn-outline-secondary font-weight-bold ml-1'
            onClick={this.addNewApprovalSeat}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <If condition={approval_seats.length > 0}>
          <ul className='mt-1'>
            {approval_seats.map((seat) => {
              return (
                <div key={seat.id} className='d-flex align-items-start'>
                  <li>{seat.seat}</li>
                  <button
                    className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                    onClick={(e) => this.delApprovalSeat(e, seat.id)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              );
            })}
          </ul>
        </If>
        <br />
      </If>
    );
  }

  static defaultProps = {
    approvalSeats: [],
    fieldName: 'На погодження'
  };
}

export default Approvals;
