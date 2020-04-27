'use strict';
import React from 'react';
import {uniqueArray} from 'templates/components/my_extras';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import 'static/css/my_styles.css';

class OrderMail extends React.Component {
  state = {
    employee_list: window.employee_list ? window.employee_list : [],
    to_default: true,
    everyone: false,
    list: false,
    none: false,
    receivers: [],
    receiver_id: 0,
    receiver_name: ''
  };

  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    this.setState({
      receiver_id: event.target.options[selectedIndex].getAttribute('data-key'),
      receiver_name: event.target.options[selectedIndex].getAttribute('value')
    });
  };

  arrangeCheckBoxes = (event) => {
    this.setState({
      to_default: false,
      everyone: false,
      list: false,
      none: false,
      [event.target.id]: true
    });

    this.props.mailMode(event.target.id);
  };

  addReceiver = (e) => {
    e.preventDefault();
    if (this.state.receiver_name !== '') {
      let receivers = [...this.state.receivers];
      receivers.push({
        id: this.state.receiver_id,
        name: this.state.receiver_name
      });
      const unique_receivers = uniqueArray(receivers);
      this.setState({
        receivers: unique_receivers,
        receiver_id: '',
        receiver_name: ''
      });
      // надсилаємо новий список у батьківський компонент
      this.props.mailList(unique_receivers);
    }
  };

  delReceiver = (e, id) => {
    e.preventDefault();
    // надсилаємо новий список у батьківський компонент
    this.props.mailList(this.state.receivers.filter((receiver) => receiver.id !== id));

    this.setState((prevState) => ({
      receivers: prevState.receivers.filter((receiver) => receiver.id !== id)
    }));
  };

  render() {
    const {employee_list, to_default, everyone, list, none, receivers, receiver_name} = this.state;
    
    return (
      <div className='shadow-lg p-3 bg-white rounded'>
        <div>Надіслати електронного листа про опублікування документу:</div>
        <small className='text-danger'>
          Система відсилає листи автору, відповідальному та контролючому, якщо не відмічений варіант
          "нікому".
        </small>
        <div>
          <input
            type='checkbox'
            id='to_default'
            checked={to_default}
            onChange={this.arrangeCheckBoxes}
          />
          <label className='ml-2 form-check-label' htmlFor='to_default'>
            Автору, відповідальному, контролюючому
          </label>
        </div>
        <div>
          <input
            type='checkbox'
            id='everyone'
            checked={everyone}
            onChange={this.arrangeCheckBoxes}
          />
          <label className='ml-2 form-check-label' htmlFor='everyone'>
            Всім працівникам
          </label>
        </div>
        <div>
          <input type='checkbox' id='list' checked={list} onChange={this.arrangeCheckBoxes} />
          <label className='ml-2 form-check-label' htmlFor='list'>
            Обрати список співробітників
          </label>
          <If condition={list}>
            <div className='d-flex align-items-center mt-3'>
              <select
                className='flex-grow-1 form-control'
                id='select_receiver'
                name='select_receiver'
                value={receiver_name}
                onChange={this.onChange}
              >
                <option key={0} data-key={0} value='0'>
                  ------------
                </option>
                {employee_list.map((employee) => {
                  if (employee.mail) {
                    return (
                      <option key={employee.id} data-key={employee.id} value={employee.name}>
                        {employee.name}
                      </option>
                    );
                  }
                })}
              </select>
              <button
                className={
                  receiver_name
                    ? 'btn btn-sm font-weight-bold ml-1 css_flash_button'
                    : 'btn btn-sm font-weight-bold ml-1 btn-outline-secondary'
                }
                onClick={this.addReceiver}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <small className='text-danger'>
              Якщо необхідного співробітника немає у списку, це означає, що у нього немає особистої
              електронної пошти, або вона не внесена в базу даних. Зверніться до адміністратора.
            </small>
            <If condition={receivers.length > 0}>
              <ul className='mt-1'>
                {receivers.map((receiver) => {
                  return (
                    <div key={receiver.id} className='d-flex align-items-start'>
                      <li>{receiver.name}</li>
                      <button
                        className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                        onClick={(e) => this.delReceiver(e, receiver.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  );
                })}
              </ul>
            </If>
          </If>
        </div>
        <div>
          <input type='checkbox' id='none' checked={none} onChange={this.arrangeCheckBoxes} />
          <label className='ml-2 form-check-label' htmlFor='none'>
            Нікому
          </label>
        </div>
      </div>
    );
  }

  static defaultProps = {
    mailMode: {},
    mailList: {}
  };
}

export default OrderMail;
