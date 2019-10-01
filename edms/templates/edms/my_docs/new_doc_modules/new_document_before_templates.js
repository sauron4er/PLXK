'use strict';
import React from 'react';
import Modal from 'react-awesome-modal';
import 'react-drag-list/assets/index.css';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import Name from './name';
import Preamble from './preamble';
import Text from './text';
import Recipient from './recipient';
import RecipientChief from './recipient_chief';
import Articles from './articles';
import FilesUpload from './files';
import AcquaintList from './acquaint_list';
import ApprovalList from './approval_list';
import SignList from './sign_list';
import Day from './day';
import Gate from './gate';
import CarryOut from './carry_out';

class NewDocument extends React.Component {
  state = {
    open: true,
    render_ready: false,
    type_modules: [],
    text: [],

    name: '',
    preamble: '',
    articles: [],
    recipient: {
      name: '------------',
      id: 0
    },
    recipient_chief: {
      name: '------------',
      id: 0
    },
    acquaint_list: [],
    approval_list: [],
    sign_list: [],
    old_files: [],
    files: [],
    day: '',
    gate: 1,
    carry_out_items: []
  };

  onChange = (event) => {
    if (event.target.name === 'recipient_chief') {
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        recipient_chief: {
          name: event.target.options[selectedIndex].getAttribute('value'),
          id: parseInt(event.target.options[selectedIndex].getAttribute('data-key'))
        }
      });
    } else if (event.target.name === 'recipient') {
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        recipient: {
          name: event.target.options[selectedIndex].getAttribute('value'),
          id: parseInt(event.target.options[selectedIndex].getAttribute('data-key'))
        }
      });
    } else if (event.target.name === 'gate_radio') {
      this.setState({gate: event.target.value});
    } else if (event.target.name === 'text') {
      let {text} = this.state;
      let text_box_id = event.target.id.substring(5); // видаляємо 'text-' з ід інпуту
      text[text_box_id] = event.target.value;
      this.setState({text});
    } else {
      this.setState({[event.target.name]: event.target.value});
    }
  };

  componentDidMount() {
    // Отримуємо з бд список модулів, які використовує даний тип документа:
    axios({
      method: 'get',
      url: 'get_doc_type_modules/' + this.props.docTypeId + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        this.setState({
          type_modules: response.data
        });
      })
      .catch((error) => {
        console.log('errorpost: ' + error);
      });

    // Якщо це чернетка чи шаблон, отримуємо з бд дані:
    if (this.props.doc.docId !== 0) {
      axios({
        method: 'get',
        url: 'get_doc/' + this.props.docId + '/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then((response) => {
          this.setState({
            name: response.data.name || '',
            preamble: response.data.preamble || '',
            text: response.data.text || '',
            articles: response.data.articles || [],
            recipient: response.data.recipient || {
              name: '------',
              seat: '------',
              id: 0
            },
            recipient_chief: response.data.recipient_chief || {
              name: '------',
              seat: '------',
              id: 0
            },
            acquaint_list: response.data.acquaint_list || [],
            approval_list: response.data.approval_list || [],
            sign_list: response.data.sign_list || [],
            old_files: response.data.old_files || [],
            day: response.data.day || '',
            gate: response.data.gate || '1',
            carry_out_items: response.data.carry_out_items || [],
            render_ready: true
          });
        })
        .catch((error) => {
          console.log('errorpost: ' + error);
        });
    } else {
      this.setState({
        render_ready: true
      });
    }
  }

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

  // Перевіряє, чи всі необхідні поля заповнені
  requiredFieldsFilled = () => {
    for (const module of this.state.type_modules) {
      if (
        module.required &&
        (this.state[module.module].length === 0 || this.state[module.module].id === 0)
      ) {
        this.notify('Поле "' + module.field_name + '" необхідно заповнити');
        return false;
      }
    }
    return true;
  };

  newDocument = (e, type) => {
    e.preventDefault();
    try {
      const {type_modules, old_files} = this.state;
      const {docTypeId, docId, docType} = this.props;

      if (type === 'template' || this.requiredFieldsFilled()) {
        // Створюємо список для відправки у бд:
        let doc_modules = {};
        type_modules.map((module) => {
          if (this.state[module.module].length !== 0 && this.state[module.module].id !== 0) {
            doc_modules[module.module] = this.state[module.module];
          }
        });

        let formData = new FormData();
        // інфа нового документу:
        formData.append('doc_modules', JSON.stringify(doc_modules));
        formData.append('document_type', docTypeId);
        formData.append('old_id', docId);
        formData.append('employee_seat', localStorage.getItem('my_seat'));
        formData.append('old_files', JSON.stringify(old_files));
        formData.append('status', type); // Документ, шаблон чи чернетка

        if (this.state.files.length > 0) {
          this.state.files.map((file) => {
            formData.append('file', file);
          });
        }

        axios({
          method: 'post',
          url: '',
          data: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .then((response) => {
            const today = new Date();
            // опублікування документу оновлює таблицю документів:
            if (type === 'post') {
              this.props.addDoc(
                response.data,
                docType,
                today.getDate() +
                  '.' +
                  (today.getMonth() < 9 ? '0' + (today.getMonth() + 1) : today.getMonth() + 1) +
                  '.' +
                  today.getFullYear(),
                docTypeId
              );
              // збереження чорновика оновлює таблицю, якщо ми на сторінці чорновиків. Інакше таблиця оновлюється сама.
            } else if (docId !== 0 && type === 'draft') {
              this.props.addDraft(
                response.data,
                docType,
                today.getDate() +
                  '.' +
                  (today.getMonth() < 10 ? '0' + (today.getMonth() + 1) : today.getMonth() + 1) +
                  '.' +
                  today.getFullYear(),
                docTypeId
              );
              this.props.delDraft(docId);
              // збереження шаблона оновлює таблицю, якщо ми на сторінці шаблонів. Інакше таблиця оновлюється сама.
            } else if (docId !== 0 && type === 'template') {
              this.props.addTemplate(
                response.data,
                docType,
                today.getDate() +
                  '.' +
                  (today.getMonth() < 10 ? '0' + (today.getMonth() + 1) : today.getMonth() + 1) +
                  '.' +
                  today.getFullYear(),
                docTypeId
              );
              this.props.delTemplate(docId);
            }
          })
          .catch((error) => {
            console.log('error: ' + error);
          });
        // this.props.onCloseModal();
      }
    } catch (e) {
      this.notify(e);
    }
  };

  delDraft = (e) => {
    e.preventDefault();

    axios({
      method: 'post',
      url: 'del_draft/' + this.props.docId + '/',
      data: '',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        this.props.delDraft(this.props.docId);
      })
      .catch(function(error) {
        console.log('errorpost: ' + error);
      });
    this.props.onCloseModal();
  };

  onCloseModal = (e) => {
    e.preventDefault();
    this.setState({
      open: false
    });
    // Передаємо вверх інфу, що модальне вікно закрите
    this.props.onCloseModal();
  };

  render() {
    const {docType, docTypeId} = this.props;
    const {
      open,
      type_modules,
      render_ready,
      name,
      preamble,
      text,
      articles,
      recipient,
      recipient_chief,
      acquaint_list,
      approval_list,
      sign_list,
      old_files,
      files,
      day,
      gate,
      carry_out_items
    } = this.state;

    // Визначаємо, наскільки великим буде текстове поле:
    let rows = 1;
    switch (docTypeId) {
      case 2:
        rows = 2;
        break;
      case 3:
        rows = 10;
        break;
      default:
        rows = 1;
    }

    return (
      <Modal visible={open} width='45%' effect='fadeInUp'>
        <If condition={type_modules.length > 0 && render_ready}>
          <div className='css_modal_scroll'>
            <div className='modal-header d-flex justify-content-between'>
              <h4 className='modal-title'>{docType}</h4>
              <button className='btn btn-link' onClick={this.onCloseModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className='modal-body'>
              <For each='module' of={type_modules}>
                <Choose>
                  <When condition={module.module === 'name'}>
                    <Name onChange={this.onChange} name={name} fieldName={module.field_name} />
                  </When>
                  <When condition={module.module === 'preamble'}>
                    <Preamble
                      onChange={this.onChange}
                      preamble={preamble}
                      fieldName={module.field_name}
                    />
                  </When>
                  <When condition={module.module === 'text'}>
                    <Text
                      onChange={this.onChange}
                      text={text[module.queue]}
                      fieldName={module.field_name}
                      id={module.id}
                      rows={rows}
                      queue={module.queue}
                    />
                  </When>
                  <When condition={module.module === 'recipient'}>
                    <Recipient
                      onChange={this.onChange}
                      recipient={recipient}
                      fieldName={module.field_name}
                    />
                  </When>
                  <When condition={module.module === 'recipient_chief'}>
                    <RecipientChief
                      onChange={this.onChange}
                      recipientChief={recipient_chief}
                      fieldName={module.field_name}
                    />
                  </When>
                  <When condition={module.module === 'articles'}>
                    <Articles
                      onChange={this.onChange}
                      articles={articles}
                      modules={type_modules}
                      fieldName={module.field_name}
                    />
                  </When>
                  <When condition={module.module === 'files'}>
                    <FilesUpload
                      onChange={this.onChange}
                      oldFiles={old_files}
                      files={files}
                      fieldName={module.field_name}
                    />
                  </When>
                  <When condition={module.module === 'acquaint_list'}>
                    <AcquaintList
                      onChange={this.onChange}
                      acquaintList={acquaint_list}
                      fieldName={module.field_name}
                    />
                  </When>
                  <When condition={module.module === 'approval_list'}>
                    <ApprovalList
                      onChange={this.onChange}
                      approvalList={approval_list}
                      fieldName={module.field_name}
                      additionalInfo={module.additional_info}
                    />
                  </When>
                  <When condition={module.module === 'sign_list'}>
                    <SignList
                      onChange={this.onChange}
                      signList={sign_list}
                      fieldName={module.field_name}
                      additionalInfo={module.additional_info}
                    />
                  </When>
                  <When condition={module.module === 'day'}>
                    <Day day={day} onChange={this.onChange} fieldName={module.field_name} />
                  </When>
                  <When condition={module.module === 'gate'}>
                    <Gate
                      checkedGate={gate}
                      onChange={this.onChange}
                      fieldName={module.field_name}
                    />
                  </When>
                  <When condition={module.module === 'carry_out_items'}>
                    <CarryOut
                      carryOutItems={carry_out_items}
                      onChange={this.onChange}
                      fieldName={module.field_name}
                    />
                  </When>
                  <Otherwise> </Otherwise>
                </Choose>
              </For>
            </div>

            <div className='modal-footer'>
              <If condition={this.props.docId !== 0}>
                <button
                  className='float-sm-left btn btn-sm btn-outline-danger mb-1'
                  onClick={this.delDraft}
                >
                  Видалити
                </button>
              </If>
              <button
                className='float-sm-left btn btn-sm btn-outline-info mb-1'
                onClick={(e) => this.newDocument(e, 'draft')}
              >
                В чернетки
              </button>
              <button
                className='float-sm-left btn btn-sm btn-outline-info mb-1'
                onClick={(e) => this.newDocument(e, 'template')}
              >
                Зберегти як шаблон
              </button>
              <button
                className='float-sm-left btn btn-outline-success mb-1'
                onClick={(e) => this.newDocument(e, 'doc')}
              >
                Підтвердити
              </button>
            </div>
          </div>
        </If>
        {/*Вспливаюче повідомлення*/}
        <ToastContainer />
      </Modal>
    );
  }

  static defaultProps = {
    docId: 0,
    docTypeId: 0,
    docType: ''
  };
}

export default NewDocument;
