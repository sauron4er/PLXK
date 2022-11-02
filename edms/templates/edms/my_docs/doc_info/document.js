'use strict';
import * as React from 'react';
import Modal from 'react-responsive-modal';
import Files from 'react-files';
import {ToastContainer, toast} from 'react-toastify'; // спливні повідомлення:
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
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import ApprovalWithComment from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/modals/approval_with_comment';
import ApprovalDelegation from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/modals/approval_delegation';
import {Loader} from 'templates/components/loaders';
import RegistrationModal from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/modals/registration';
import NewSigners from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/modals/new_signers';
import ToInform from './doc_info_modules/modals/to_inform';
import EditDecreeArticles from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/modals/edit_decree_articles';
import decreeArticlesStore from "edms/templates/edms/my_docs/new_doc_modules/decree_articles/store";

class Document extends React.Component {
  state = {
    info: [],
    comment: '',
    resolutions: [],
    acquaints: [],
    approvals: [],
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
    if (this.props.doc_id) this.getDoc(this.props.doc_id);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.doc_id && this.props.doc_id !== prevProps.doc_id && this.props.doc_id !== 0) {
      this.getDoc(this.props.doc_id);
      docInfoStore.button_clicked = false;
    }
  }

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  // функція для отримання з бази докладної інфи про документ
  getDoc = (doc_id) => {
    this.setState({ready_for_render: false});

    let formData = new FormData();
    formData.append('employee_seat', localStorage.getItem('my_seat'));

    axiosPostRequest('get_doc/' + doc_id + '/', formData)
      .then((response) => {
        // Отримуємо інформацію щодо конкретних видів документів
        this.setState({
          info: response,
          ready_for_render: true
        });
        docInfoStore.info = response;
        decreeArticlesStore.decree_articles = response?.decree_articles;

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
    const {info, new_files, comment, resolutions, acquaints, approvals} = this.state;
    const {doc_id, removeRow, opened_in_modal} = this.props;
    let all_good = true;

    let formData = new FormData();
    new_files.map((file) => {
      formData.append('new_files', file);
    });
    docInfoStore.signed_files.map((file) => {
      formData.append('signed_files', file);
    });
    docInfoStore.changed_files.new_files.map((file) => {
      formData.append('change__new_files', file);
    });
    if (docInfoStore.changed_files.deleted_files.length > 0)
      formData.append('change__deleted_files', JSON.stringify(docInfoStore.changed_files.deleted_files));
    if (docInfoStore.changed_files.updated_files.length > 0) {
      // Відправляємо окремо масив файлів і окремо масив з інформацією про ці файли
      // Це потрібно тому що при передачі файлів на django губиться вся інформація про цей файл: ід, індекс тощо
      formData.append('change__updated_files_info', JSON.stringify(docInfoStore.changed_files.updated_files_info));
      docInfoStore.changed_files.updated_files.map((file) => {
        formData.append('change__updated_files', file);
      });
    }

    new_files.length > 0 ? formData.append('new_files', JSON.stringify(new_files)) : null;
    formData.append('document', doc_id);
    formData.append('employee_seat', localStorage.getItem('my_seat'));
    formData.append('mark', mark_id);
    formData.append('comment', comment);
    formData.append('resolutions', JSON.stringify(resolutions));
    formData.append('acquaints', JSON.stringify(acquaints));
    formData.append('approvals', JSON.stringify(approvals));
    formData.append('mark_demand_id', info.mark_demand_id ? info.mark_demand_id : '');
    formData.append('path_to_answer', docInfoStore.comment_to_answer.id);
    formData.append('path_to_answer_author', docInfoStore.comment_to_answer.author_id);
    formData.append('phase_id', info.phase_id ? info.phase_id : 0);
    formData.append('delegation_receiver_id', docInfoStore.delegation_receiver_id);
    formData.append('user_is_super_manager', info.user_is_super_manager);
    formData.append('registration_number', docInfoStore.info.registration_number);
    formData.append('doc_type_version', docInfoStore.info.doc_type_version.id);
    formData.append('deleted_approval_id', docInfoStore.deleted_approval_id);
    formData.append('employees_to_inform', JSON.stringify(docInfoStore.employees_to_inform));
    formData.append('deadline', JSON.stringify(docInfoStore?.info?.deadline?.deadline));
    formData.append('decree_articles', JSON.stringify(decreeArticlesStore?.decree_articles));

    axiosPostRequest('mark/', formData)
      .then((response) => {
        if (opened_in_modal) location.reload();

        if (response === 'not deletable') {
          notify('На документ відреагували, видалити неможливо, оновіть сторінку.');
        } else if (response === 'reg_unique_fail') {
          notify('Цей реєстраційний номер вже використовується. Оберіть інший.');
          all_good = false;
        } else {
          // направляємо документ на видалення з черги, якщо це не коментар
          this.setState({
            new_path_id: response,
            show_resolutions_area: false,
            show_aqcuaints_area: false,
            new_files: [],
            updated_files: [],
            comment: ''
          });
          docInfoStore.clearChangedFiles();
          const responsible_id = info.responsible_seat_id;
          removeRow(doc_id, mark_id, responsible_id);
        }
        if (all_good) this.onCloseModal();
      })
      .catch((error) => notify(error));
  };

  // опрацьовуємо нажаття кнопок реагування
  onButtonClick = (mark_id) => {
    // Якщо це пустий коментар, виводимо текст помилки
    if (mark_id === 4 && this.state.comment === '') {
      notify('Введіть текст коментарю.');
      docInfoStore.button_clicked = false;

      // Якщо файл не прикріплено, виводимо текст помилки
    } else if (mark_id === 12 && this.state.new_files.length === 0) {
      notify('Оберіть файл.');
      docInfoStore.button_clicked = false;

      // Відкриваємо модуль
    } else if ([10, 15, 18, 21, 22, 28, 31].includes(mark_id)) {
      this.openModal(mark_id);

      // Кнопка "Відмовити" відкриває модальне вікно з проханням внести коментар
    } else if ([3, 5].includes(mark_id) && this.state.comment === '') {
      this.openModal(mark_id);
    } else if (mark_id === 17 && this.state.comment !== '') {
      // Віза з коментарем: признак відмови при натисканні візи
      this.openModal(mark_id);
    } else if ([25, 27].includes(mark_id)) {
      // Вікно делегування чи реєстрації
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
      case 5:
        this.setState({
          modal: <RefusalComment onSubmit={(comment) => this.handleComment(comment, mark_id)} onCloseModal={this.onCloseModal} />,
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
              doc_id={this.props.doc_id}
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
              doc_id={this.props.doc_id}
              new_path_id={this.state.new_path_id}
            />
          ),
          modal_open: true
        });
        break;
      case 17:
        this.setState({
          modal: <ApprovalWithComment onCloseModal={this.onCloseModal} onSubmit={(mark) => this.handleSimpleModalSubmit(mark)} />,
          modal_open: true
        });
        break;
      case 18:
        if (this.state.info.meta_type_id === 14) {
          this.setState({
            modal: (
              <EditDecreeArticles
                onCloseModal={this.onCloseModal}
                onSubmit={this.handleDecreeArticlesChange}
              />
            ),
            modal_open: true
          });
        } else {
          this.setState({
            modal: <EditFiles onCloseModal={this.onCloseModal} onSubmit={this.handleFilesChange} files={this.state.info.old_files} />,
            modal_open: true
          });
        }
        break;
      case 21:
        this.setState({
          modal: <AnswerComment onSubmit={(comment) => this.handleComment(comment, 21)} onCloseModal={this.onCloseModal} />,
          modal_open: true
        });
        break;
      case 22:
        this.setState({
          modal: <PostSignedFiles onCloseModal={this.onCloseModal} onSubmit={() => this.handleSimpleModalSubmit(22)} />,
          modal_open: true
        });
        break;
      case 25:
        this.setState({
          modal: (
            <ApprovalDelegation
              directSubs={this.props.directSubs}
              onCloseModal={this.onCloseModal}
              onSubmit={() => this.handleSimpleModalSubmit(25)}
            />
          ),
          modal_open: true
        });
        break;
      case 27:
        this.setState({
          modal: <RegistrationModal onCloseModal={this.onCloseModal} onSubmit={() => this.handleSimpleModalSubmit(27)} />,
          modal_open: true
        });
        break;
      case 28:
        this.setState({
          modal: (
            <NewSigners
              onCloseModal={this.onCloseModal}
              onSubmit={this.handleApprovals}
              doc_id={this.props.doc_id}
              new_path_id={this.state.new_path_id}
            />
          ),
          modal_open: true
        });
        break;
      case 31:
        this.setState({
          modal: <ToInform onCloseModal={this.onCloseModal} onSubmit={this.handleToInform} doc_id={this.props.doc_id} />,
          modal_open: true
        });
        break;
    }
  };

  handleResolutions = (resolutions) => {
    if (resolutions.length > 0) {
      this.setState({resolutions: resolutions}, () => {
        this.postMark(10);
        this.onCloseModal();
      });
    } else {
      notify('Додайте резолюції');
    }
  };

  handleAcquaints = (acquaints) => {
    if (acquaints.length > 0) {
      this.setState({acquaints: acquaints}, () => {
        this.postMark(15);
        this.onCloseModal();
      });
    } else {
      notify('Додайте отримувачів');
    }
  };

  handleApprovals = (approvals) => {
    if (approvals.length > 0) {
      this.setState({approvals: approvals}, () => {
        this.postMark(28);
        this.onCloseModal();
      });
    } else {
      notify('Додайте отримувачів');
    }
  };

  handleToInform = (recipients) => {
    if (recipients.length > 0) {
      docInfoStore.employees_to_inform = recipients;
      this.postMark(31);
      this.onCloseModal();
    } else {
      notify('Додайте отримувачів');
    }
  };

  handleComment = (comment, mark) => {
    this.setState({comment: comment}, () => {
      this.postMark(mark);
      this.onCloseModal();
    });
  };

  handleFilesChange = (comment) => {
    this.setState({comment: comment}, () => {
      this.postMark(18);
      this.onCloseModal();
    });
  };

  handleDecreeArticlesChange = (comment) => {
    this.setState({comment: comment}, () => {
      this.postMark(18);
      this.onCloseModal();
    });
  };

  handleSimpleModalSubmit = (mark) => {
    this.postMark(mark);
  };

  onNewFiles = (new_files) => {
    this.setState({new_files});
  };

  onFilesError = (error, file) => {
    console.log('error code ' + error.code + ': ' + error.message);
  };

  filesRemoveOne = (e, file) => {
    this.refs.new_files.removeFile(file);
  };

  onCloseModal = () => {
    this.setState({modal_open: false});
    docInfoStore.button_clicked = false;
  };

  addDoc = () => {
    window.location.reload();
  };

  render() {
    const {doc_id, archived, directSubs} = this.props;
    const {ready_for_render} = this.state;
    const {info, deletable, comment, new_files, modal_open, modal} = this.state;

    if (doc_id !== 0) {
    } else if (doc_id === 0) {
      //  // повідомлення при додаванні позначки
      return <div className='font-italic'>{docInfoStore.answer}</div>;
    } else {
      // якщо не вибрано жоден документ
      return <div> </div>;
    }

    return (
      <Choose>
        <When condition={ready_for_render}>
          <Choose>
            <When condition={doc_id === 0}>
              <div className='font-italic'>{docInfoStore.answer}</div>
            </When>
            <When condition={doc_id !== 0}>
              <Choose>
                <When condition={info.access_granted}>
                  <div className='css_main'>
                    <div className='d-flex justify-content-between mr-2'>
                      <div>
                        <small>Посилання: http://plhk.com.ua/edms/my_docs/{doc_id}</small>
                        <div>Обраний документ:</div>
                      </div>
                      <div>
                        <DocumentPrint info={info} />
                      </div>
                    </div>

                    {/*Початкова інфа про документ:*/}
                    <div className='css_border bg-light p-2 mt-2 mr-1'>
                      <Info info={info} postMark={this.postMark} />
                    </div>

                    <If condition={!info.closed}>
                      <div className='mt-3'>Відреагувати:</div>
                      <div className='css_border bg-light p-2 mt-1 mr-1'>
                        <Buttons
                          info={info}
                          archived={archived}
                          isChief={directSubs.length > 0}
                          deletable={deletable}
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
                            value={comment}
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
                        <If condition={new_files.length > 0}>
                          <NewFilesList files={new_files} fileRemove={this.filesRemoveOne} />
                        </If>
                      </div>
                    </If>

                    {/*У кого документ на черзі*/}
                    <If condition={info.flow}>
                      <Flow flow={info.flow} />
                    </If>

                    {/*У кого документ на ознайомленні*/}
                    <If condition={info.acquaints}>
                      <Acquaints acquaints={info.acquaints} />
                    </If>

                    {/*Історія документа*/}
                    <Path path={info.path} onAnswerClick={this.onAnswerClick} />

                    {/*Модальне вікно*/}
                    <Modal
                      open={modal_open}
                      onClose={this.onCloseModal}
                      showCloseIcon={false}
                      closeOnOverlayClick={false}
                      styles={{modal: {marginTop: 100}}}
                    >
                      <ToastContainer />
                      {modal}
                    </Modal>

                    <If condition={docInfoStore.view === 'new_document'}>
                      <NewDocument
                        doc={{
                          id: docInfoStore.info.id,
                          type: docInfoStore.info.type,
                          type_id: docInfoStore.info.type_id
                        }}
                        addDoc={this.addDoc}
                        status={'change'}
                        onCloseModal={() => (docInfoStore.view = 'info')}
                      />
                    </If>

                    <If condition={docInfoStore.view === 'new_contract'}>
                      <NewDocument
                        doc={{
                          id: 0,
                          type: 'Договір',
                          type_id: 0,
                          meta_type_id: 5, // Таблиця візування договору
                          document_link: info.id,
                          main_field: info.main_field
                        }}
                        addDoc={this.addDoc}
                        status={'doc'}
                        onCloseModal={() => (docInfoStore.view = 'info')}
                      />
                    </If>

                    {/*Вспливаюче повідомлення*/}
                    <ToastContainer />
                  </div>
                </When>
                <Otherwise>
                  <div>Документ № {doc_id}</div>
                  <div>
                    У вас немає доступу до цього документа. Зверніться до його автора, щоб він відправив вам цей документ на ознайомлення
                  </div>
                </Otherwise>
              </Choose>
            </When>
            <Otherwise>
              <div> </div>
            </Otherwise>
          </Choose>
        </When>
        <Otherwise>
          <Loader />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    doc: [],
    doc_id: 0,
    directSubs: [],
    removeRow: () => {},
    archived: false,
    opened_in_modal: false
  };
}

export default view(Document);
