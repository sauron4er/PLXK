'use strict';
import React from 'react';
import querystring from 'querystring';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import FilesUpload from 'templates/components/files_uploader/files_upload';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from './store';
import axios from 'axios';
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

class Laws extends React.Component {
  state = {
    laws: this.props.laws,
    new_name: '',
    new_url: '',
    files: []
  };

  onChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  postNewLaw = (e) => {
    e.preventDefault();
    const {new_name, new_url, files} = this.state;
    if (new_name && new_url) {
      let formData = new FormData();
      formData.append('name', new_name);
      formData.append('url', new_url);
      if (files?.length > 0) {
        files.map((file) => {
          formData.append('files', file);
        });
      }
      axios({
        method: 'post',
        url: 'new_law/',
        data: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then((response) => {
          this.addLaw(response.data);
        })
        .catch((error) => {
          console.log('error: ' + error);
        });
    } else {
      notify('Поля "Назва" та "Посилання" обов’язкові для заповнення');
    }
  };

  postDelLaw = (e, id) => {
    e.preventDefault();
    axios({
      method: 'post',
      url: 'del_law/',
      data: querystring.stringify({
        id: id,
        is_active: false
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        this.removeLaw(response.data);
      })
      .catch((error) => {
        console.log('error: ' + error);
      });
  };

  addLaw = (id) => {
    const {laws, new_name, new_url, files} = this.state;
    const new_law = {
      id: id,
      name: new_name,
      url: new_url,
      files: files
    };
    laws.push(new_law);
    this.setState({
      laws: laws,
      new_name: '',
      new_url: '',
      files: []
    });
    this.props.changeList('laws', laws);
  };

  removeLaw = (id) => {
    const {laws} = this.state;
    const new_laws = laws.filter((law) => law.id !== id);
    this.setState({laws: new_laws});
    this.props.changeList('laws', new_laws);
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

  onFilesChange = (event) => {
    this.setState({
      files: event.target.value
    });
  };

  render() {
    const {laws, new_name, new_url, files} = this.state;

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
            <div className='d-flex mb-2'>
              <FilesUpload onChange={this.onFilesChange} files={files} fieldName={'Файли'} />
            </div>
          </div>
          <button
            type='button'
            className='btn btn-sm btn-outline-success align-self-stretch'
            onClick={this.postNewLaw}
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

  static defaultProps = {
    laws: [],
    changeList: () => {}
  };
}

export default Laws;
