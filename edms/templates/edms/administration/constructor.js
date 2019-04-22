'use strict';
import React from 'react';
import axios from 'axios';
import DragNDrop from './dragndrop';
import Modules from './administration_modules';
import '../_else/loader_style.css';
import '../_else/my_styles.css';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class Constructor extends React.Component {
  state = {
    loading: true,
    step: 1,
    doc_type_name: '',
    chosen_modules: [],
    left_modules: [],
    chosen_phases: [],
    left_phases: []
  };

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  // Спливаюче повідомлення
  notify = (message) =>
    toast.error(message, {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  
  
  componentDidMount() {
    this.getModulesAndPhases();
    if (this.props.docType) {
      this.setState({
        doc_type_name: this.props.docType.description
      });
    }
  }

  getModulesAndPhases = () => {
    axios({
      // отримуємо з бази список документів
      method: 'get',
      url: 'get_modules_phases/' + this.props.docType.id + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        if (response.data) {
          this.setState({
            chosen_modules: response.data.chosen_modules,
            left_modules: response.data.left_modules,
            chosen_phases: response.data.chosen_phases,
            left_phases: response.data.left_phases,
            loading: false
          });
          return 0;
        }
      })
      .catch(function(error) {
        console.log('errorpost: ' + error);
      });
  };

  changeLists = (lists, id) => {
    if (id === 'modules') {
      this.setState({
        chosen_modules: lists.chosen,
        left_modules: lists.left
      });
    } else if (id === 'phases') {
      this.setState({
        chosen_phases: lists.chosen,
        left_phases: lists.left
      });
    }
  };

  nextStage = (e) => {
    e.preventDefault();
    switch (this.state.step) {
      case 1:
        if (this.state.doc_type_name === '') {
          this.notify('Введіть назву типу документа');
        } else {
          this.setState((prevState) => ({
            step: prevState.step + 1
          }));
        }
        break;
      case 2:
        if (this.state.chosen_modules.length === 0) {
          this.notify('Оберіть модулі');
        } else {
          this.setState((prevState) => ({
            step: prevState.step + 1
          }));
        }
        break;
      case 3:
        if (this.state.chosen_phases.length === 0) {
          this.notify('Оберіть фази');
        } else {
          this.setState((prevState) => ({
            step: prevState.step + 1
          }));
        }
        break;
      case 4:
        // Налаштування кожної фази. Повинні бути значення по дефолту до кожної фази, аби не робити дуже складні перевірки
        this.setState((prevState) => ({
            step: prevState.step + 1
          }));
        break;
      case 5:
        // Публікування типу документу в БД
        break;
    }
  };

  onClickBack = (e) => {
    e.preventDefault();
    if (this.state.step > 1) {
      this.setState((prevState) => ({
        step: prevState.step - 1
      }));
    } else {
      this.props.onClick(e); // Щоб збити DocTypeId до ''
    }
  };

  render() {
    const {
      loading,
      step,
      doc_type_name,
      left_modules,
      chosen_modules,
      left_phases,
      chosen_phases
    } = this.state;
    return (
      <Choose>
        <When condition={loading}>
          <div className='css_loader'>
            <div className='loader' id='loader-1'>
              {' '}
            </div>
          </div>
        </When>
        <Otherwise>
          <Choose>
            <When condition={step === 1}>
              <div className='font-weight-bold'>Назва:</div>
              <input
                className='form-control'
                id='doc_type_name'
                name='doc_type_name'
                value={doc_type_name}
                onChange={this.onChange}
              />
            </When>
            <When condition={step === 2}>
              <div>
                <small>Перетягніть у ліву колонку модулі, які будуть використовуватись.</small>
              </div>
              <div>
                <small>
                  Черговість використання модулів можна змінювати. Наприклад, модуль "Назва" логічно
                  використовувати одним з перших.
                </small>
              </div>
              <hr />
              <div className='font-weight-bold'>Модулі:</div>
              <DragNDrop
                chosen={chosen_modules}
                left={left_modules}
                changeLists={this.changeLists}
                id='modules'
              />
              {/*<Modules*/}
                {/*chosen={chosen_modules}*/}
                {/*left={left_modules}*/}
                {/*changeLists={this.changeLists}*/}
                {/*id='modules'*/}
              {/*/>*/}
            </When>
            <When condition={step === 3}>
              <div>
                <small>Перетягніть у ліву колонку фази, які будуть використовуватись.</small>
              </div>
              <div>
                <small>
                  Черговість використання фаз можна змінювати. Наприклад, логічно спочатку
                  відправити документ у фазу "Не заперечую" від безпосереднього керівника, а потім
                  на "Погоджую".
                </small>
              </div>
              <hr />
              <div className='font-weight-bold'>Фази:</div>
              <DragNDrop
                chosen={chosen_phases}
                left={left_phases}
                changeLists={this.changeLists}
                id='phases'
              />
            </When>
            <When condition={step === 4}>
              <div>Налаштування фаз</div>
            </When>
            <When condition={step === 5}>
              <div>Зовнішній вигляд документу для підтвердження</div>
            </When>
          </Choose>

          <div className='modal-footer mt-3'>
            <div className='mr-auto'>
              <button className='btn btn-outline-danger' onClick={this.onClickBack}>
                {step !== 1 ? 'Назад' : 'Вийти'}
              </button>
              <If condition={step === 1}>
                <div className='mr-auto'>
                  <small>Внесені вами зміни не будуть збережені.</small>
                </div>
              </If>
            </div>
            <div>
              <small>Крок {step} з 5.</small>
            </div>
            <button className='btn btn-outline-primary' onClick={this.nextStage}>
              {step !== 5 ? 'Далі' : 'Опублікувати'}
            </button>
          </div>

          {/*Вспливаюче повідомлення*/}
          <ToastContainer />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    docType: []
  };
}

export default Constructor;
