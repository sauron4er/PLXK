'use strict';
import React from 'react';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import Client from './client';
import Answer from './answer';
import RequestFile from './request_file';
import AnswerFiles from './answer_files';
import RequestDate from './request_date';

const notify = (message) =>
  toast.error(message, {
    position: 'bottom-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });

class Request extends React.Component {
  state = {};

  postNewRequest = (e) => {
    // isAllFieldsFilled(request)
    console.log(corrStore.request.answer);
    this.addRequest();
  };

  postDelRequest = (e) => {
    this.removeRequest();
  };

  addRequest = () => {};

  removeRequest = () => {};

  render() {
    const {} = this.state;

    return (
      <div className='shadow-lg p-3 mb-5 bg-white rounded'>
        <div className='modal-header d-flex'>
          <button className='btn btn-outline-success' onClick={(e) => this.props.close(e, 'table')}>
            Назад
          </button>
          <h5 className='ml-auto'>Додання запиту</h5>
        </div>

        <div className='modal-body'>
          <Client />
          <hr />
          <RequestFile />
          <hr />
          <Answer />
          <hr />
          <AnswerFiles />
          <hr />
          <div>Законодавство (декілька!)</div>
          <hr />
          <RequestDate />
          <hr />
          <div>Термін виконання</div>
          <hr />
          <div>Відповідальний</div>
          <hr />
          <div>Відповідальний за надання відповіді</div>
        </div>
        <div className='modal-footer'>
          <button className='btn btn-outline-danger' onClick={this.test}>
            test
          </button>
          <button className='btn btn-outline-danger' onClick={this.postDelRequest}>
            Видалити
          </button>
          <button className='btn btn-outline-success' onClick={this.postNewRequest}>
            Зберегти
          </button>
        </div>

        {/*Вспливаюче повідомлення*/}
        <ToastContainer />
      </div>
    );
  }

  static defaultProps = {
    close: () => {}
  };
}

export default view(Request);
