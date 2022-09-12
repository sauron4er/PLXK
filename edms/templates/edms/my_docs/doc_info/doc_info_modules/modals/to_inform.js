'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {notify, uniqueArray} from 'templates/components/my_extras';
import {axiosGetRequest} from 'templates/components/axios_requests';
import MultiSelectorWithFilter from 'templates/components/form_modules/multi_selector_with_filter';

class ToInform extends React.Component {
  state = {
    emp_seats: [],
    recipients: [],
    emp_seat_id: '0',
    emp_seat: ''
  };

  componentDidMount() {
    axiosGetRequest(`get_emp_seats`)
      .then((response) => {
        this.setState({emp_seats: response});
      })
      .catch((error) => notify(error));
  }

  onChange = (e) => {
    this.setState({
      emp_seat_id: e.id,
      emp_seat: e.name
    });
    this.addRecipient(e.id, e.name);
  };

  addRecipient = (id, name) => {
    let recipients_list = [...this.state.recipients];
    recipients_list.push({
      emp_seat_id: id,
      emp_seat: name
    });
    const unique_seats = uniqueArray(recipients_list, 'emp_seat_id');
    this.setState({
      recipients: unique_seats,
      emp_seat_id: '',
      emp_seat: ''
    });
  };

  delRecipient = (index) => {
    let recipients = this.state.recipients;
    recipients.splice(index, 1);
    this.setState({recipients});
  };
  
  // заставляє батьківський компонент запостити позначку
  onClick = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state.recipients);
  };

  render() {
    const {recipients, emp_seats} = this.state;
    const {onCloseModal} = this.props;
    return (
      <div style={{minHeight: '400px', minWidth: '600px'}}>
        <div className='modal-header d-flex justify-content-between'>
          <h5 className='modal-title font-weight-bold'>Оберіть, кого повідомити про підписання договору</h5>
          <button className='btn btn-link' onClick={onCloseModal}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <Choose>
          <When condition={emp_seats.length > 0}>
            <div className='modal-body'>
              <MultiSelectorWithFilter
                fieldName='На прийняття в роботу'
                list={emp_seats}
                onChange={this.onChange}
                getOptionLabel={(option) => option.emp + ', ' + option.seat}
                getOptionValue={(option) => option.id}
                disabled={false}
              />

              <If condition={recipients.length > 0}>
                <ul className='mt-1'>
                  {recipients.map((recipient, index) => {
                    return (
                      <div key={index} className='d-flex align-items-start'>
                        <li>{recipient.emp_seat}</li>
                        <button
                          className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                          onClick={this.delRecipient.bind(undefined, index)}
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
      </div>
    );
  }

  static defaultProps = {
    onCloseModal: () => {},
    onSubmit: () => {},
    doc_id: 0,
  };
}

export default ToInform;