'use strict';
import React from 'react';
import Modal from 'react-responsive-modal';
import Files from 'react-files';
import {ToastContainer, toast} from 'react-toastify'; // спливаючі повідомлення:
import 'react-toastify/dist/ReactToastify.min.css';
import Info from './info';
import NewFilesList from 'templates/components/files_uploader/new_files_list';
import Buttons from './buttons';
import NewResolutions from './doc_info_modules/modals/new_resolutions';
import NewAcquaints from './doc_info_modules/modals/new_acquaints';
import EditFiles from './doc_info_modules/modals/edit_files';
import PostSignedFiles from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/modals/post_signed_files';
import RefusalComment from './doc_info_modules/modals/refusal_comment';
import AnswerComment from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/modals/answer_comment';
import Path from './path';
import Flow from './flow';
import Acquaints from './doc_info_modules/acquaints';
import DocumentPrint from './document_print';
import './document.css';
import 'static/css/loader_style.css';
import 'static/css/files_uploader.css';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from './doc_info_modules/doc_info_store';
import NewDocument from '../new_doc_modules/new_document';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

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

  componentDidMount() {
    if (this.props.doc) this.getDoc(this.props.doc);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // при зміні ід документа (клік на інший документ) - запит інфи про документ з бд
    if (this.props.doc.id && this.props.doc.id !== prevProps.doc.id && this.props.doc.id !== 0) {
      docInfoStore.doc = this.props.doc;
      this.getDoc(this.props.doc);
    }
  }

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  // функція для отримання з бази докладної інфи про документ
  getDoc = (doc) => {
    this.setState({
      ready_for_render: false
    });

    axiosGetRequest('get_doc/' + doc.id + '/')
      .then((response) => {
        // Отримуємо інформацію щодо конкретних видів документів
        this.setState({
          info: response,
          ready_for_render: true
        });
        docInfoStore.info = response;

        // Якщо в історії документа автор хоч одного запису не є автором документа - документ не видаляється.
        for (let i = 0; i <= response.path.length - 1; i++) {
          if (response.path[i].emp_seat_id !== parseInt(localStorage.getItem('my_seat'))) {
            this.setState({deletable: false});
            break;
          } else {
            this.setState({deletable: true});
          }
        }
      })
      .catch((error) => notify(error));
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
    docInfoStore.signed_files.map((file) => {
      formData.append('signed_files', file);
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
    formData.append('path_to_answer', docInfoStore.comment_to_answer.id);
    formData.append('path_to_answer_author', docInfoStore.comment_to_answer.author_id);
    formData.append('phase_id', doc.phase_id ? doc.phase_id : 0);

    axiosPostRequest('mark/', formData)
      .then((response) => {
        if (response === 'not deletable') {
          this.notify('На документ відреагували, видалити неможливо, оновіть сторінку.');
        } else {
          // this.filesRemoveAll();
          // направляємо документ на видалення з черги, якщо це не коментар
          this.setState({
            new_path_id: response,
            show_resolutions_area: false,
            show_aqcuaints_area: false,
            new_files: [],
            updated_files: []
          });
          const doc_id = doc.id;
          const author_id = doc.author_seat_id;
          removeRow(doc_id, mark_id, author_id);
        }
      })
      .catch((error) => notify(error));
  };

  // опрацьовуємо нажаття кнопок реагування
  onButtonClick = (mark_id) => {
    // Якщо це пустий коментар, виводимо текст помилки
    if (mark_id === 4 && this.state.comment === '') {
      this.notify('Введіть текст коментарю.');

      // Якщо файл не прикріплено, виводимо текст помилки
    } else if (mark_id === 12 && this.state.new_files.length === 0) {
      this.notify('Оберіть файл.');

      // Кнопка "Резолюція" відкриває окремий модуль
    } else if ([10, 15, 18, 21, 22].includes(mark_id)) {
      this.openModal(mark_id);

      // Кнопка "Відмовити" відкриває модальне вікно з проханням внести коментар
    } else if (mark_id === 3 && this.state.comment === '') {
      this.openModal(mark_id);
    } else {
      this.postMark(mark_id);
    }
  };

  onAnswerClick = (path) => {
    docInfoStore.comment_to_answer = {
      id: path.id,
      text: path.comment,
      author: path.emp,
      author_id: path.emp_seat_id
    };
    this.openModal(21);
  };

  openModal = (mark_id) => {
    switch (mark_id) {
      case 3:
        this.setState({
          modal: <RefusalComment onSubmit={(comment) => this.handleComment(comment, 3)} onCloseModal={this.onCloseModal} />,
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
            <EditFiles
              onCloseModal={this.onCloseModal}
              onSubmit={this.handleFilesChange}
              files={this.state.info.old_files}
              // doc_id={this.props.doc.id}
              notify={this.notify}
              // new_path_id={this.state.new_path_id}
            />
          ),
          modal_open: true
        });
        break;
      case 21:
        this.setState({
          modal: (
            <AnswerComment
              // originalComment={}
              onSubmit={(comment) => this.handleComment(comment, 21)}
              onCloseModal={this.onCloseModal}
            />
          ),
          modal_open: true
        });
        break;
      case 22:
        this.setState({
          modal: <PostSignedFiles onCloseModal={this.onCloseModal} notify={this.notify} onSubmit={this.handleAddingSignedFiles} />,
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

  handleComment = (comment, mark) => {
    this.setState(
      {
        comment: comment
      },
      () => {
        this.postMark(mark);
        this.onCloseModal();
      }
    );
  };
  
  handleFilesChange = (files, comment) => {
    this.setState(
      {
        updated_files: files,
        comment: comment
      },
      () => {
        this.postMark(18);
        this.onCloseModal();
      }
    );
  };

  handleAddingSignedFiles = () => {
    this.postMark(22);
    this.onCloseModal();
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
    this.setState({modal_open: false});
  };

  addDoc = () => {
    window.location.reload();
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
            <Path path={this.state.info.path} onAnswerClick={this.onAnswerClick} />

            {/*Модальне вікно*/}
            <Modal open={this.state.modal_open} onClose={this.onCloseModal} showCloseIcon={false} closeOnOverlayClick={false}>
              <ToastContainer />
              {this.state.modal}
            </Modal>

            <If condition={docInfoStore.view === 'new_document'}>
              <NewDocument
                doc={{
                  id: docInfoStore.doc.id,
                  type: docInfoStore.doc.type,
                  type_id: docInfoStore.doc.type_id
                }}
                addDoc={this.addDoc}
                status={'change'}
                onCloseModal={() => (docInfoStore.view = 'info')}
              />
            </If>

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

  static defaultProps = {
    doc: [],
    directSubs: [],
    removeRow: () => {},
    closed: false
  };
}

export default view(Document);
