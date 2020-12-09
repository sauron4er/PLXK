'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {view, store} from '@risingstack/react-easy-state';
import FilesUpload from 'templates/components/files_uploader/files_upload';
import LawScopes from './law_scopes';
import {axiosPostRequest} from 'templates/components/axios_requests';
import corrStore from '../store';
import {getItemById, uniqueArray} from 'templates/components/my_extras';

const notify = (message) =>
  toast.error(message, {
    position: 'bottom-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });

class Laws extends React.Component {
  state = {
    new_name: '',
    new_url: '',
    files: []
  };

  onChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  addSelectedScope = () => {
    // Додає до запису сферу, якщо автор забув натиснути "+"
    if (corrStore.law.scope_id) {
      const selected_scope = getItemById(corrStore.law.scope_id, corrStore.scopes);
      corrStore.law.scopes.push(selected_scope);
      corrStore.law.scopes = uniqueArray(corrStore.law.scopes);
    }
  };

  isNameAndUrlFilled = () => {
    const {new_name, new_url} = this.state;
    if (new_name && new_url && corrStore.law.scopes) {
      return true;
    } else {
      notify('Поля "Назва", "Посилання" та "Сфера застосування" обов’язкові для заповнення');
      return false;
    }
  };

  postNewLaw = () => {
    this.addSelectedScope();

    const {new_name, new_url, files} = this.state;
    if (this.isNameAndUrlFilled()) {
      let formData = new FormData();
      formData.append('name', new_name);
      formData.append('url', new_url);
      formData.append('scopes', JSON.stringify(corrStore.law.scopes));

      if (files?.length) {
        files.map((file) => {
          formData.append('files', file);
        });
      }

      axiosPostRequest('new_law/', formData)
        .then((response) => this.addLaw(response))
        .catch((error) => notify(error));
    }
  };

  postDelLaw = (e, id) => {
    e.preventDefault();

    let formData = new FormData();
    formData.append('id', id);
    formData.append('is_active', false);

    axiosPostRequest('del_law/', formData)
      .then((response) => this.removeLaw(response))
      .catch((error) => this.notify(error));
  };

  addLaw = (id) => {
    const {new_name, new_url, files} = this.state;

    corrStore.laws.push({
      id: id,
      name: new_name,
      url: new_url,
      scopes: corrStore.law.scopes,
      files: files
    });
    this.setState({
      new_name: '',
      new_url: '',
      files: []
    });
    corrStore.law.scopes = [];
  };

  removeLaw = (id) => {
    corrStore.laws = corrStore.laws.filter((law) => law.id !== id);
  };

  arrangeLawFiles = (files) => {
    return (
      <For each='file' index='idx' of={files}>
        <div key={idx} className={files.length > 1 ? 'mb-2' : null}>
          <a href={'../../media/' + file.file} target='_blank'>
            {file.name}{' '}
          </a>
        </div>
      </For>
    );
  };

  arrangeLawScopes = (scopes) => {
    return (
      <ul><For each='scope' index='idx' of={scopes}>
        <li key={idx} className={scopes.length > 1 ? 'mb-2' : null}>
          {scope.name}
        </li>
      </For></ul>
    );
  };

  onFilesChange = (event) => {
    this.setState({
      files: event.target.value
    });
  };

  render() {
    const {new_name, new_url, files} = this.state;

    return (
      <>
        <hr />
        <div className='mb-1 font-weight-bold'>Новий закон:</div>
        <div className='d-flex w-100 align-items-center mb-2'>
          <div className='w-100'>
            <div className='d-flex mb-2'>
              <label htmlFor='new_name'>Назва:</label>
              <input
                className='form-control form-control-sm mx-2'
                type='text'
                id='new_name'
                name='new_name'
                value={new_name}
                onChange={this.onChange}
              />
            </div>
            <div className='d-flex mb-2'>
              <label htmlFor='new_url'>Посилання:</label>
              <input
                className='form-control form-control-sm mx-2'
                type='text'
                id='new_url'
                name='new_url'
                value={new_url}
                onChange={this.onChange}
              />
            </div>

            <LawScopes />

            <div className='d-flex mb-2'>
              <FilesUpload onChange={this.onFilesChange} files={files} fieldName={'Файли'} />
            </div>
          </div>
          <button
            type='button'
            className='btn btn-sm btn-outline-info align-self-stretch'
            onClick={() => this.postNewLaw()}
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
              <th className='text-center col-4'>
                <small>Посилання</small>
              </th>
              <th className='text-center col-4'>
                <small>Сфери застосування</small>
              </th>
              <th className='text-center col-3'>
                <small>Файли</small>
              </th>
              <th className='text-center col-1'> </th>
            </tr>
          </thead>
          <tbody>
            <For each='law' index='idx' of={corrStore.laws}>
              <tr key={idx}>
                <td className='align-middle col-4'>{law.name}</td>
                <td className='align-middle col-4'>
                  <a href={law.url} target='_blank'>
                    {law.url}
                  </a>
                </td>
                <td className='align-middle col-4'>{this.arrangeLawScopes(law.scopes)}</td>
                <td className='align-middle col-3 p-0'>{this.arrangeLawFiles(law.files)}</td>
                <td className='text-center align-middle small text-danger col-1'>
                  <button className='btn btn-sm py-0' onClick={(e) => this.postDelLaw(e, law.id)}>
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

export default view(Laws);
