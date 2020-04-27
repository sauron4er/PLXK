'use strict';
import React from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import querystring from 'querystring';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class Clients extends React.Component {
  state = {
    clients: this.props.clients,
    new_name: ''
  };

  onChange = (e) => {
    this.setState({new_name: e.target.value});
  };

  newClient = (e) => {
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
          const new_client = {
            id: response.data,
            name: new_name
          } ;
          this.props.newClient(new_client)

        })
        .catch((error) => {
          console.log('error: ' + error);
        });
    }
  };

  delClient = (e, id) => {
    e.preventDefault();
    axios({
        method: 'post',
        url: 'del_client/',
        data: querystring.stringify({
          id: id,
          is_active: false,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then((response) => {
          this.props.delClient(id)

        })
        .catch((error) => {
          console.log('error: ' + error);
        });
  };

  render() {
    const {clients, new_name} = this.state;

    return (
      <>
        <div className='d-flex w-100 align-items-center mb-2'>
          <div className='flex-grow-1'>Новий клієнт:</div>
          <input
            className='form-control form-control-sm mr-2'
            type='text'
            name='name'
            value={new_name}
            onChange={this.onChange}
          />
          <button type='button' className='btn btn-sm btn-outline-success' onClick={this.newClient}>
            Додати
          </button>
        </div>
        <table className='table table-sm table-striped table-bordered'>
          <thead>
            <tr>
              <th className='text-center col-10'>
                <small>Назва</small>
              </th>
              <th className='text-center col-2'> </th>
            </tr>
          </thead>
          <tbody>
            <For each='client' index='idx' of={clients}>
              <tr>
                <td className='align-middle col-10'>{client.name}</td>
                <td className='text-center align-middle small text-danger col-2'>
                  <button className='btn btn-sm py-0' onClick={e => this.delClient(e, client.id)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </td>
              </tr>
            </For>
          </tbody>
        </table>
      </>
    );
  }

  static defaultProps = {
    clients: [],
    newClient: () => {},
    delClient: () => {},
  };
}

export default Clients;
