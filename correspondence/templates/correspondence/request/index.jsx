'use strict';
import React from 'react';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import axios from 'axios';
import { view, store } from '@risingstack/react-easy-state';
import corrStore from "../store";
import Client from "./client";
import Answer from "./answer";

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

class Request extends React.Component {
  state = {

  };

  addRequest = (e) => {
    // isAllFieldsFilled(request)
    console.log(corrStore.request.answer);
    this.props.close(e, 'table');
  };

  delRequest = (e) => {
    this.props.close(e, 'table');
  };

  changeRequestKey = (key, value) => {
    this.setState({
      [key]: value,
    })
  };

  render() {
    const {} = this.state;

    return (
      <div>
        <button className='btn btn-outline-success' onClick={(e) => this.props.close(e, 'table')}>
          Назад
        </button>
        <div className='modal-body'>
          <Client/>
          <div>Лист-запит (файл eml)</div>
          <Answer/>
          <div>Файли відповіді</div>
          <div>Законодавство (декілька!)</div>
          <div>Дата запиту</div>
          <div>Термін виконання</div>
          <div>Відповідальний</div>
          <div>Відповідальний за надання відповіді</div>
        </div>
        <div className='modal-footer'>
          <button className='btn btn-outline-danger' onClick={this.test}>
            test
          </button>
          <button className='btn btn-outline-danger' onClick={this.delRequest}>
            Видалити
          </button>
          <button className='btn btn-outline-success' onClick={this.addRequest}>
            Зберегти
          </button>
        </div>

        {/*Вспливаюче повідомлення*/}
        <ToastContainer />
      </div>
    );
  }

  static defaultProps = {
    request: {},
    close: () => {}
  };
}

export default view(Request);
