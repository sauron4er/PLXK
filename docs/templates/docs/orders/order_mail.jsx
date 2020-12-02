'use strict';
import * as React from 'react';
import {uniqueArray} from 'templates/components/my_extras';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import 'static/css/my_styles.css';
import {view, store} from '@risingstack/react-easy-state';
import ordersStore from 'docs/templates/docs/orders/orders_store';
import Selector from 'templates/components/form_modules/selector';

class OrderMail extends React.Component {
  state = {
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

    ordersStore.order.mail_mode = event.target.id;
  };

  addReceiver = () => {
    if (this.state.receiver_name !== '') {
      let receivers = [...ordersStore.order.mail_list];
      receivers.push({
        id: this.state.receiver_id,
        name: this.state.receiver_name
      });
      const unique_receivers = uniqueArray(receivers);
      this.setState({
        receiver_id: '',
        receiver_name: ''
      });

      ordersStore.order.mail_list = [...unique_receivers];
    }
  };

  delReceiver = (id) => {
    // Необхідно проводити зміни через додаткову перемінну, бо  react-easy-state не помічає змін глибоко всередині перемінних, як тут.
    let mail_list = [...ordersStore.order.mail_list];
    mail_list = mail_list.filter((receiver) => receiver.id !== id)
    ordersStore.order.mail_list = [...mail_list];
  };

  render() {
    const {to_default, everyone, list, none, receiver_name} = this.state;
    const {employees, is_orders_admin} = ordersStore;
    const {mail_list} = ordersStore.order;

    return (
      <div className='shadow-lg p-3 bg-white rounded'>
        <div>Надіслати електронного листа про опублікування документу:</div>
        <small>
          Система відсилає листи автору, відповідальним та контролючому, якщо не відмічений варіант "нікому".
        </small>
        <div>
          <input type='checkbox' id='to_default' checked={to_default} onChange={this.arrangeCheckBoxes} />
          <label className='ml-2 form-check-label' htmlFor='to_default'>
            Автору, відповідальним, контролюючому
          </label>
        </div>
        <div>
          <input type='checkbox' id='everyone' checked={everyone} onChange={this.arrangeCheckBoxes} />
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
              <Selector
                list={employees}
                selectedName={receiver_name}
                fieldName={'Контроль'}
                onChange={this.onChange}
                disabled={!is_orders_admin}
              />
              <button
                className={
                  receiver_name
                    ? 'btn btn-sm font-weight-bold ml-1 css_flash_button'
                    : 'btn btn-sm font-weight-bold ml-1 btn-outline-secondary'
                }
                onClick={() => this.addReceiver()}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <small className='text-danger'>
              Якщо необхідного співробітника немає у списку, зверніться до адміністратора.
            </small>
            <If condition={mail_list.length > 0}>
              <ul className='mt-1'>
                {mail_list.map((receiver) => {
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
}

export default view(OrderMail);
