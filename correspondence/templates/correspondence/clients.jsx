'use strict';
import React from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import querystring from 'querystring';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

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
    clients: this.props.clients,
    new_name: ''
  };

  onChange = (e) => {
    this.setState({new_name: e.target.value});
  };

  postNewClient = (e) => {
    e.preventDefault();
    const {new_name} = this.state;
    if (new_name) {
      axios({
        method: 'post',
        url: 'new_client/',
        data: querystring.stringify({
          name: new_name
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then((response) => {
          this.addClient(response.data);
        })
        .catch((error) => {
          console.log('error: ' + error);
        });
    } else {
      notify('Поле "Назва" обов’язкове для заповнення')
    }
  };

  postDelClient = (e, id) => {
    e.preventDefault();
    axios({
      method: 'post',
      url: 'del_client/',
      data: querystring.stringify({
        id: id,
        is_active: false
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        this.removeClient(response.data)
      })
      .catch((error) => {
        console.log('error: ' + error);
      });
  };
  
  addClient = (id) => {
    const {clients, new_name} = this.state;
    const new_client = {
      id: id,
      name: new_name
    };
    clients.push(new_client);
    this.setState({
      clients: clients,
      new_name: ''
    });
    this.props.changeList('clients', clients);
  };
  
  removeClient = (id) => {
    const {clients} = this.state;
    const new_clients = clients.filter(client => client.id !== id);
    this.setState({clients: new_clients});
    this.props.changeList('clients', new_clients);
  };

  render() {
    const {clients, new_name} = this.state;

    return (
      <>
        <hr/>
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
          <button
            type='button'
            className='btn btn-sm btn-outline-success'
            onClick={this.postNewClient}
          >
            Додати
          </button>
        </div>
        <hr/>
        <table className='table table-sm table-striped table-bordered'>
          <thead>
            <tr>
              <th className='text-center col-11'>
                <small>Назва</small>
              </th>
              <th className='text-center col-1'> </th>
            </tr>
          </thead>
          <tbody>
            <For each='client' index='idx' of={clients}>
              <tr>
                <td className='align-middle col-11'>{client.name}</td>
                <td className='text-center align-middle small text-danger col-1'>
                  <button className='btn btn-sm py-0' onClick={(e) => this.postDelClient(e, client.id)}>
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

  static defaultProps = {
    clients: [],
    changeList: () => {},
  };
}

export default Clients;
