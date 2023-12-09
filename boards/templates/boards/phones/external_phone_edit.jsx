'use strict';
import * as React from 'react';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

class ExternalPhoneEdit extends React.Component {
  state = {
    phone: {
      id: 0,
      owner: '',
      number: '',
    },
  };

  componentDidMount() {
    this.setState({phone: this.props.phone});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.phone.id !== prevProps.phone.id) {
      this.setState({phone: {...this.props.phone}});
    }
  }

  onNumberChange = (e) => {
    let phone = {...this.state.phone};
    phone.number = e.target.value;
    this.setState({phone});
  };

  saveChanges = () => {
    let formData = new FormData();
    formData.append('phone', JSON.stringify(this.state.phone));
    axiosPostRequest('edit_external_phone', formData)
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  };

  render() {
    const {phone} = this.state;
    return (
      <>
        <h4 className='mt-4'>{phone.owner}</h4>

        <label className='mt-2' htmlFor='number'>
          № телефону:
        </label>
        <input
          className='form-control'
          type='text'
          name='number'
          id={'number'}
          value={phone.number}
          onChange={this.onNumberChange}
        />
        <button
          className='btn btn-outline-primary mt-3 float-right'
          onClick={this.saveChanges}
        >
          Зберегти зміни
        </button>
      </>
    );
  }

  static defaultProps = {
    phone: {
      id: 0,
      owner: '',
      number: ''
    }
  };
}

export default ExternalPhoneEdit;
