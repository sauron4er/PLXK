'use strict';
import * as React from 'react';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

class EmployeePAM extends React.Component {
  state = {
    employee: {
      id: 0,
      pip: '',
      phone: '',
      mail: '',
    },
    phone_is_valid: true,
    mail_is_valid: true
  };

  componentDidMount() {
    this.setState({employee: this.props.employee});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.employee.id !== prevProps.employee.id) {
      this.setState({employee: {...this.props.employee}});
    }
  }

  onPhoneChange = (e) => {
    let employee = {...this.state.employee};
    employee.phone = e.target.value;
    this.setState({employee});
    if (e.target.validity.patternMismatch) {
      e.target.setCustomValidity('Номер телефону має складатися з 4 цифр');
      this.setState({phone_is_valid: false});
    } else {
      e.target.setCustomValidity('');
      this.setState({phone_is_valid: true});
    }
  };

  onMailChange = (e) => {
    let employee = {...this.state.employee};
    employee.mail = e.target.value;
    this.setState({employee});

    if (e.target.validity.typeMismatch) {
      e.target.setCustomValidity('Неправильно введена електронна пошта');
      this.setState({mail_is_valid: false});
    } else {
      e.target.setCustomValidity('');
      this.setState({mail_is_valid: true});
    }
  };

  saveChanges = () => {
    let formData = new FormData();
    formData.append('employee', JSON.stringify(this.state.employee));
    axiosPostRequest('change_pam', formData)
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  };

  render() {
    const {employee, phone_is_valid, mail_is_valid} = this.state;
    return (
      <>
        <h4 className='mt-4'>{employee.pip}</h4>

        <label className='mt-2' htmlFor='phone'>
          № телефону:
        </label>
        <input
          className='form-control'
          type='text'
          name='phone'
          id={'phone'}
          value={employee.phone}
          onChange={this.onPhoneChange}
          pattern='\d{4}'
          maxLength={4}
        />
        <label className='mt-2' htmlFor='mail'>
          e-mail:
        </label>
        <input className='form-control' name='mail' id={'mail'} type='email' value={employee.mail} onChange={this.onMailChange} />
        <button
          className='btn btn-outline-primary mt-3 float-right'
          onClick={this.saveChanges}
          disabled={!phone_is_valid || !mail_is_valid}
        >
          Зберегти зміни
        </button>
      </>
    );
  }

  static defaultProps = {
    employee: {
      id: 0,
      pip: '',
      phone: '',
      mail: ''
    }
  };
}

export default EmployeePAM;
