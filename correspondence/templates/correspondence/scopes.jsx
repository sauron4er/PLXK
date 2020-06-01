'use strict';
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {view, store} from '@risingstack/react-easy-state';
import {axiosPostRequest} from 'templates/components/axios_requests';
import corrStore from './store';

const notify = (message) =>
  toast.error(message, {
    position: 'bottom-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });

class Scopes extends React.Component {
  state = {
    new_name: ''
  };

  onChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  isNameFilled = () => {
    if (this.state.new_name) {
      return true;
    } else {
      notify('Усі поля обов’язкові для заповнення');
      return false;
    }
  };

  postNewScope = (e) => {
    e.preventDefault();

    const {new_name} = this.state;
    if (this.isNameFilled()) {
      let formData = new FormData();
      formData.append('name', new_name);

      axiosPostRequest('new_scope/', formData)
        .then((response) => this.addScope(response))
        .catch((error) => notify(error));
    }
  };

  postDelScope = (e, id) => {
    e.preventDefault();

    let formData = new FormData();
    formData.append('id', id);
    formData.append('is_active', false);

    axiosPostRequest('del_scope/', formData)
      .then((response) => this.removeScope(response))
      .catch((error) => this.notify(error));
  };

  addScope = (id) => {
    const {new_name} = this.state;

    corrStore.scopes.push({
      id: id,
      name: new_name
    });
    this.setState({new_name: ''});
  };

  removeScope = (id) => {
    corrStore.scopes = corrStore.scopes.filter((scope) => scope.id !== id);
  };

  render() {
    const {new_name} = this.state;

    return (
      <>
        <hr />
        <div className='mb-1 font-weight-bold'>Нова сфера застосування:</div>
        <div className='d-flex w-100 align-items-center mb-2'>
          <label htmlFor='new_name'>Назва:</label>
          <input
            className='form-control form-control-sm mx-2'
            type='text'
            id='new_name'
            name='new_name'
            value={new_name}
            onChange={this.onChange}
          />

          <button
            type='button'
            className='btn btn-sm btn-outline-success align-self-stretch'
            onClick={this.postNewScope}
          >
            Додати
          </button>
        </div>

        <hr />
        <table className='table table-sm table-striped table-bordered'>
          <thead>
            <tr>
              <th className='text-center col-4'>
                <small>Назва</small>
              </th>
              <th className='text-center col-1'> </th>
            </tr>
          </thead>
          <tbody>
            <For each='scope' index='idx' of={corrStore.scopes}>
              <tr key={idx}>
                <td className='align-middle col-4'>{scope.name}</td>
                <td className='text-center align-middle small text-danger col-1'>
                  <button className='btn btn-sm py-0' onClick={(e) => this.postDelScope(e, scope.id)}>
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

export default view(Scopes);
