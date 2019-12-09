'use strict';
import React from 'react';
import Modal from 'react-responsive-modal';
import Files from 'react-files';
import {ToastContainer, toast} from 'react-toastify'; // спливаючі повідомлення:
import 'react-toastify/dist/ReactToastify.min.css';
import axios from 'axios';
import Info from './info';
import NewFilesList from '../components/new_files_list';
import Buttons from './buttons';
import NewResolutions from './doc_info_modules/modals/new_resolutions';
import NewAcquaints from './doc_info_modules/modals/new_acquaints';
import EditFiles from './doc_info_modules/modals/edit_files';
import RefusalComment from './doc_info_modules/modals/refusal_comment';
import Path from './path';
import Flow from './flow';
import Acquaints from './doc_info_modules/acquaints';
import DocumentPrint from '../doc_info/document_print';
import './document.css';
import '../_else/loader_style.css';
import '../_else/files_uploader.css';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class Document extends React.Component {
  state = {
    info: [],
    comment: '',
    resolutions: [],
    new_files: [],
    updated_files: [],
    deleted_files: [],
    old_files: [],
    new_path_id: '', // для повернення в компонент Resolutions і посту резолюцій
    deletable: true,
    clicked_button: '', // ід натиснутої кнопки (для модульного вікна коментарю)
    show_resolutions_area: false,
    show_aquaints_area: false,
    show_files_change_area: false,
    modal_open: false,
    comment_modal_open: false, // модальне вікно, яке просить користувача ввести коментар
    ready_for_render: true // при false рендериться loader
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    // при зміні ід документа (клік на інший документ) - запит інфи про документ з бд
    if (this.props.doc.id !== prevProps.doc.id && this.props.doc.id !== 0) {
      this.getDoc(this.props.doc);
    }
  }

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  // Спливаюче повідомлення
  notify = (message) =>
    toast.error(message, {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });

  // функція для отримання з бази докладної інфи про документ
  getDoc = (doc) => {
    this.setState({
      ready_for_render: false
    });

    axios({
      method: 'get',
      url: 'get_doc/' + doc.id + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        // Отримуємо інформацію щодо конкретних видів документів
        this.setState({
          info: response.data,
          ready_for_render: true
        });

        // Якщо в історії документа автор хоч одного запису не є автором документа - документ не видаляється.
        for (let i = 0; i <= response.data.path.length - 1; i++) {
          if (response.data.path[i].emp_seat_id !== parseInt(localStorage.getItem('my_seat'))) {
            this.setState({deletable: false});
            break;
          } else {
            this.setState({deletable: true});
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return 0;
  };

  // відправляємо позначку до бд
  postMark = (mark_id) => {
    const {new_files, updated_files, deleted_files, comment, resolutions, acquaints} = this.state;
    const {doc, removeRow} = this.props;

    let formData = new FormData();
    new_files.map((file) => {
      formData.append('new_files', file);
    });
    updated_files.map((file) => {
      formData.append('updated_files', file);
    });
    new_files.length > 0 ? formData.append('new_files', JSON.stringify(new_files)) : null;
    formData.append('updated_files', JSON.stringify(updated_files));
    deleted_files.length > 0 ? formData.append('deleted_files', JSON.stringify(deleted_files)) : null;
    formData.append('document', doc.id);
    formData.append('employee_seat', localStorage.getItem('my_seat'));
    formData.append('mark', mark_id);
    formData.append('comment', comment);
    formData.append('resolutions', JSON.stringify(resolutions));
    formData.append('acquaints', JSON.stringify(acquaints));
    formData.append('mark_demand_id', doc.mark_demand_id);
    formData.append('phase_id', doc.phase_id ? doc.phase_id : 0);

    axios({
      method: 'post',
      url: 'mark/',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then((response) => {
        if (response.data === 'not deletable') {
          this.notify('На документ відреагували, видалити неможливо, оновіть сторінку.');
        } else {
          // this.filesRemoveAll();
          // направляємо документ на видалення з черги, якщо це не коментар
          this.setState({
            new_path_id: response.data,
            show_resolutions_area: false,
            show_aqcuaints_area: false,
            new_files: [],
            updated_files: [],
          });
          const doc_id = doc.id;
          const author_id = doc.author_seat_id;
          removeRow(doc_id, mark_id, author_id);
        }
      })
      .catch((error) => {
        console.log('errorpost: ' + error);
      });
  };

  // опрацьовуємо нажаття кнопок реагування
  onButtonClick = (e, mark_id) => {
    e.preventDefault();

    // Якщо це пустий коментар, виводимо текст помилки
    if (mark_id === 4 && this.state.comment === '') {
      this.notify('Введіть текст коментарю.');

      // Якщо файл не прикріплено, виводимо текст помилки
    } else if (mark_id === 12 && this.state.new_files.length === 0) {
      this.notify('Оберіть файл.');

      // Кнопка "Резолюція" відкриває окремий модуль
    } else if ([10, 15, 18].includes(mark_id)) {
      this.openModal(mark_id);
      // this.setState((prevState) => ({
      //   show_aquaints_area: !prevState.show_aquaints_area
      // }));

      // Кнопка "Відмовити" відкриває модальне вікно з проханням внести коментар
    } else if (mark_id === 3 && this.state.comment === '') {
      this.openModal(mark_id);
    } else {
      this.postMark(mark_id);
    }
  };

  openModal = (mark_id) => {
    switch (mark_id) {
      case 3:
        this.setState({
          modal: (
            <RefusalComment onSubmit={this.handleRefusalComment} onCloseModal={this.onCloseModal} />
          ),
          modal_open: true
        });
        break;
      case 10:
        this.setState({
          modal: (
            <NewResolutions
              onCloseModal={this.onCloseModal}
              directSubs={this.props.directSubs}
              onSubmit={this.handleResolutions}
              doc_id={this.props.doc.id}
              // postMark={this.postMark}
              notify={this.notify}
              new_path_id={this.state.new_path_id}
            />
          ),
          modal_open: true
        });
        break;
      case 15:
        this.setState({
          modal: (
            <NewAcquaints
              onCloseModal={this.onCloseModal}
              onSubmit={this.handleAcquaints}
              doc_id={this.props.doc.id}
              // postMark={this.postMark}
              notify={this.notify}
              new_path_id={this.state.new_path_id}
            />
          ),
          modal_open: true
        });
        break;
      case 18:
        this.setState({
          modal: (
            // TODO відправляти у компонент лише документи, які можна коригувати (не "звичайні" файли, додані іншими користувачами)
            <EditFiles
              onCloseModal={this.onCloseModal}
              onSubmit={this.handleFilesChange}
              files={this.state.info.old_files}
              // doc_id={this.props.doc.id}
              // postMark={this.postMark}
              notify={this.notify}
              // new_path_id={this.state.new_path_id}
            />
          ),
          modal_open: true
        });
        break;
    }
  };

  handleResolutions = (resolutions) => {
    if (resolutions.length > 0) {
      this.setState(
        {
          resolutions: resolutions
        },
        () => {
          this.postMark(10);
          this.onCloseModal();
        }
      );
    } else {
      this.notify('Додайте резолюції');
    }
  };

  handleAcquaints = (acquaints) => {
    if (acquaints.length > 0) {
      this.setState(
        {
          acquaints: acquaints
        },
        () => {
          this.postMark(15);
          this.onCloseModal();
        }
      );
    } else {
      this.notify('Додайте резолюції');
    }
  };

  handleRefusalComment = (comment) => {
    this.setState(
      {
        comment: comment
      },
      () => {
        this.postMark(3);
        this.onCloseModal();
      }
    );
  };

  handleFilesChange = (files, comment) => {
    // Вимушений розбивати оновлені/додані і видалені файли на два масиви,
    // бо видалені не є типом File і опрацьовуються в axios не правильно.
    let updated_files = [];
    let deleted_files = [];
    
    for (const file of files) {
      if (file instanceof File) {
        updated_files.push(file)
      } else {
        if (file.status !== '') {
          deleted_files.push(file)
        }
      }
    }
    
    this.setState(
      {
        updated_files: updated_files,
        deleted_files: deleted_files,
        comment: comment
      },
      () => {
        this.postMark(18);
        this.onCloseModal();
      }
    );
  };

  onNewFiles = (new_files) => {
    this.setState({
      new_files
    });
  };

  onFilesError = (error, file) => {
    console.log('error code ' + error.code + ': ' + error.message);
  };

  filesRemoveOne = (e, file) => {
    this.refs.new_files.removeFile(file);
  };

  onCloseModal = () => {
    this.setState({
      modal_open: false
    });
  };

  render() {
    if (this.state.ready_for_render === true) {
      if (
        this.props.doc !== '' &&
        this.props.doc.id !== 0
        // && parseInt(localStorage.getItem('my_seat')) === this.props.doc.emp_seat_id
      ) {
        return (
          <div className='css_main'>
            <div className='d-flex justify-content-between mr-2'>
              <div>
                <small>Посилання: http://plhk.com.ua/edms/my_docs/{this.props.doc.id}</small>
                <div>Обраний документ: </div>
              </div>
              <div>
                <DocumentPrint doc={this.props.doc} info={this.state.info} />
              </div>
            </div>

            {/*Початкова інфа про документ:*/}
            <div className='css_border bg-light p-2 mt-2 mr-1'>
              <Info doc={this.props.doc} info={this.state.info} />
            </div>
            <If condition={this.props.closed === false}>
              <div className='mt-3'>Відреагувати:</div>
              <div className='css_border bg-light p-2 mt-1 mr-1'>
                <Buttons
                  doc={this.props.doc}
                  isChief={this.props.directSubs.length > 0}
                  deletable={this.state.deletable}
                  onClick={this.onButtonClick}
                />
                <div>
                  <label htmlFor='comment'>Текст коментарю:</label>
                  <textarea
                    name='comment'
                    className='form-control'
                    rows='3'
                    id='comment'
                    onChange={this.onChange}
                    value={this.state.comment}
                  />
                </div>
                <hr />
                <Files
                  ref='new_files'
                  className='btn btn-sm btn-outline-secondary'
                  // className='files-dropzone-list'
                  onChange={this.onNewFiles}
                  onError={this.onFilesError}
                  multiple
                  maxFiles={10}
                  maxFileSize={10000000}
                  minFileSize={0}
                  clickable
                >
                  Обрати файл(и)
                </Files>
                <If condition={this.state.new_files.length > 0}>
                  <NewFilesList files={this.state.new_files} fileRemove={this.filesRemoveOne} />
                </If>
              </div>
            </If>

            {/*У кого документ на черзі*/}
            <If condition={this.state.info.flow}>
              <Flow flow={this.state.info.flow} />
            </If>

            {/*У кого документ на ознайомленні*/}
            <If condition={this.state.info.acquaints}>
              <Acquaints acquaints={this.state.info.acquaints} />
            </If>

            {/*Історія документа*/}
            <Path path={this.state.info.path} />

            {/*Модальне вікно*/}
            <Modal open={this.state.modal_open} onClose={this.onCloseModal} showCloseIcon={false} closeOnOverlayClick={false} >
              <ToastContainer />
              {this.state.modal}
            </Modal>

            {/*Вспливаюче повідомлення*/}
            <ToastContainer />
          </div>
        );
      } else if (this.props.doc.id === 0) {
        //  // повідомлення при додаванні позначки
        return <div className='font-italic'>{this.props.doc.type}</div>;
      } else {
        // якщо не вибрано жоден документ
        return <div> </div>;
      }
    } else {
      return (
        <div className='css_loader'>
          <div className='loader' id='loader-1'>
            {' '}
          </div>
        </div>
      );
    }
  }
}

export default Document;
