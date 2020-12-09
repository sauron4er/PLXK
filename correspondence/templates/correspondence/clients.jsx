'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from './store';
import {axiosPostRequest} from 'templates/components/axios_requests';


const notify = (message) =>
  toast.error(message, {
    position: 'bottom-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });

class Clients extends React.Component {
  state = {
    new_name: '',
    country: ''
  };

  onChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  isAllFieldsFilled = () => {
    const {new_name, country} = this.state;
    if (new_name?.length && country?.length) {
      return true;
    } else {
      notify('Усі поля обов’язкові для заповнення');
      return false;
    }
  };

  postNewClient = (e) => {
    e.preventDefault();
    const {new_name, country} = this.state;
    if (this.isAllFieldsFilled()) {
      let formData = new FormData();
      formData.append('name', new_name);
      formData.append('country', country);

      axiosPostRequest('new_client/', formData)
        .then((response) => this.addClient(response))
        .catch((error) => notify(error));
    }
  };

  postDelClient = (e, id) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append('id', id);
    formData.append('is_active', false);

    axiosPostRequest('del_client/', formData)
      .then((response) => this.removeClient(response))
      .catch((error) => this.notify(error));
  };

  addClient = (id) => {
    console.log(id);
    const {new_name, country} = this.state;
    corrStore.clients.push({
      id: id,
      name: new_name,
      country: country
    });
    this.setState({
      new_name: '',
      country: ''
    });
  };

  removeClient = (id) => {
    corrStore.clients = corrStore.clients.filter((client) => client.id !== id);
  };

  render() {
    const {new_name, country} = this.state;

    return (
      <>
        <hr />
        <div className='font-weight-bold mb-1'>Новий клієнт:</div>
        <div className='d-flex w-100 align-items-center mb-2'>
          <label htmlFor='new_name'>Назва:</label>
          <input
            className='form-control form-control-sm mx-2'
            type='text'
            name='new_name'
            value={new_name}
            onChange={this.onChange}
          />
          <label htmlFor='country'>Країна:</label>
          <input
            className='form-control form-control-sm mx-2'
            type='text'
            name='country'
            value={country}
            onChange={this.onChange}
          />
          <button
            type='button'
            className='btn btn-sm btn-outline-info'
            onClick={this.postNewClient}
          >
            Додати
          </button>
        </div>
        <hr />
        <table className='table table-sm table-striped table-bordered'>
          <thead>
            <tr>
              <th className='text-center col-11'>
                <small>Назва</small>
              </th>
              <th className='text-center col-11'>
                <small>Країна</small>
              </th>
              <th className='text-center col-1'> </th>
            </tr>
          </thead>
          <tbody>
            <For each='client' index='idx' of={corrStore.clients}>
              <tr key={idx}>
                <td className='align-middle col-8'>{client.name}</td>
                <td className='align-middle col-3'>{client.country}</td>
                <td className='text-center align-middle small text-danger col-1'>
                  <button
                    className='btn btn-sm py-0'
                    onClick={(e) => this.postDelClient(e, client.id)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </td>
              </tr>
            </For>
          </tbody>
        </table>
        {/*Вспливаюче повідомлення*/}
        <ToastContainer />
      </>
    );
  }
}

export default view(Clients);
