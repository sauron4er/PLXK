'use strict';
import * as React from 'react';
import Modal from 'react-responsive-modal';
import 'react-drag-list/assets/index.css';
import {ToastContainer, toast} from 'react-toastify';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import Text from './text';
import RecipientChief from './recipient_chief';
import FilesUpload from 'templates/components/files_uploader/files_upload';
import AcquaintList from './acquaint_list';
import ApprovalList from './approval_list';
import SignList from './sign_list';
import Day from './day';
import Gate from './gate';
import CarryOut from './carry_out';
import MockupType from './mockup_type';
import MockupProductType from './mockup_product_type';
import Client from './client';
import PackagingType from './packaging_type';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {getTextByQueue, getDayByQueue, getIndexByProperty, isBlankOrZero, getToday, notify} from 'templates/components/my_extras';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import 'static/css/my_styles.css';
import ChooseMainContract from 'edms/templates/edms/my_docs/new_doc_modules/choose_main_contract';

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
    contract: {
      name: '---',
      id: 0
    },
    acquaint_list: [],
    approval_list: [],
    sign_list: [],
    old_files: [],
    files: [],
    days: [],
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
    } else {
      this.setState({[event.target.name]: event.target.value});
    }
  };

  onChangeContract = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    this.setState({
      contract: {
        name: event.target.options[selectedIndex].getAttribute('value'),
        id: parseInt(event.target.options[selectedIndex].getAttribute('data-key'))
      }
    });
  };

  onChangeText = (event) => {
    let {text} = this.state;
    let text_box_id = event.target.id.substring(5); // видаляємо 'text-' з ід інпуту
    const queue = getIndexByProperty(text, 'queue', parseInt(text_box_id));
    if (queue === -1) {
      text.push({
        queue: parseInt(text_box_id),
        text: event.target.value
      });
    } else {
      text[queue].text = event.target.value;
    }
    this.setState({text});
  };

  onChangeDay = (event) => {
    let {days} = this.state;
    let day_id = event.target.id.substring(4); // видаляємо 'day-' з ід інпуту
    const queue = getIndexByProperty(days, 'queue', parseInt(day_id));
    if (queue === -1) {
      days.push({
        queue: parseInt(day_id),
        day: event.target.value
      });
    } else {
      days[queue].day = event.target.value;
    }
    this.setState({days});
  };

  componentDidMount() {
    // Отримуємо з бд список модулів, які використовує даний тип документа:
    axiosGetRequest('get_doc_type_modules/' + this.props.doc.type_id + '/')
      .then((response) => {
        this.setState({
          type_modules: response
        });
      })
      .catch((error) => notify(error));

    // Якщо це чернетка чи шаблон, отримуємо з бд дані:
    if (this.props.doc.id !== 0) {
      axiosGetRequest('get_doc/' + this.props.doc.id + '/')
        .then((response) => {
          this.setState({
            name: response.name || '',
            preamble: response.preamble || '',
            text: response.text_list || [],
            articles: response.articles || [],
            recipient: response.recipient || {
              name: '------',
              seat: '------',
              id: 0
            },
            recipient_chief: response.recipient_chief || {
              name: '------',
              seat: '------',
              id: 0
            },
            acquaint_list: response.acquaint_list || [],
            approval_list: response.approval_list || [],
            sign_list: response.sign_list || [],
            old_files: response.old_files || [],
            days: response.days || [],
            gate: response.gate || '1',
            carry_out_items: response.carry_out_items || [],
            client: response.client || [],
            mockup_type: response.mockup_type || [],
            mockup_product_type: response.mockup_product_type || [],
            contract_link: response.contract_link || {
              name: '---',
              id: 0
            },
            render_ready: true
          });
          newDocStore.new_document.client = response?.client.id;
          newDocStore.new_document.client_name = response?.client.name;
          newDocStore.new_document.mockup_type = response?.mockup_type.id;
          newDocStore.new_document.mockup_type_name = response?.mockup_type.name;
          newDocStore.new_document.mockup_product_type = response?.mockup_product_type.id;
          newDocStore.new_document.mockup_product_type_name = response?.mockup_product_type.name;
        })
        .catch((error) => notify(error));
    } else this.setState({render_ready: true});
  }

  isDimensionsFieldFilled = (module) => {
    for (const i in newDocStore.new_document.dimensions) {
      if (newDocStore.new_document.dimensions.hasOwnProperty(i) && newDocStore.new_document.dimensions[i].queue === module.queue) {
        return !isBlankOrZero(newDocStore.new_document.dimensions[i].text);
      }
    }
    return false;
  };

  // Перевіряє, чи всі необхідні поля заповнені
  requiredFieldsFilled = () => {
    for (const module of this.state.type_modules) {
      if (module.required) {
        if (module.module === 'dimensions') {
          if (!this.isDimensionsFieldFilled(module)) {
            notify('Поле "' + module.field_name + '" необхідно заповнити (тільки цифри)');
            return false;
          }
        } else if (['mockup_type', 'mockup_product_type', 'client', 'packaging_type'].includes(module.module)) {
          if (isBlankOrZero(newDocStore.new_document[module.module])) {
            notify('Поле "' + module.field_name + '" необхідно заповнити');
            return false;
          }
        } else if (module.module === 'text') {
          const texts = this.state.text;

          let text_exists = false;
          for (const i in texts) {
            if (texts[i].queue === module.queue) {
              if (texts[i].text !== '') {
                text_exists = true;
              }
            }
          }
          if (!text_exists) {
            notify('Поле "' + module.field_name + '" необхідно заповнити');
            return false;
          }
        } else if (module.module === 'day') {
          const days = this.state.days;

          let day_exists = false;
          for (const i in days) {
            if (days[i].queue === module.queue) {
              if (days[i].text !== '') {
                day_exists = true;
              }
            }
          }
          if (!day_exists) {
            notify('Поле "' + module.field_name + '" необхідно заповнити');
            return false;
          }
        } else {
          if (this.state[module.module].length === 0 || this.state[module.module].id === 0) {
            notify('Поле "' + module.field_name + '" необхідно заповнити');
            return false;
          }
        }
      }
    }
    return true;
  };

  newDocument = (type) => {
    try {
      const {type_modules, old_files} = this.state;
      const {doc, status} = this.props;

      if (type === 'template' || this.requiredFieldsFilled()) {
        // Створюємо список для відправки у бд:
        let doc_modules = {};

        type_modules.map((module) => {
          if (['mockup_type', 'mockup_product_type', 'dimensions', 'client', 'packaging_type'].includes(module.module)) {
            doc_modules[module.module] = {
              queue: module.queue,
              value: newDocStore.new_document[module.module]
            };
          } else if (module.module_id === 29) {
            // Модуль auto_approved не показується в документі
          } else if (module.module === 'day') {
            doc_modules['days'] = this.state.days;
          } else if (this.state[module.module].length !== 0 && this.state[module.module].id !== 0) {
            doc_modules[module.module] = this.state[module.module];
          }
        });

        let formData = new FormData();
        // інфа нового документу:
        formData.append('doc_modules', JSON.stringify(doc_modules));
        formData.append('document_type', doc.type_id);
        formData.append('old_id', doc.id);
        formData.append('employee_seat', localStorage.getItem('my_seat'));
        formData.append('path_to_answer', '0');

        if (status === 'change') formData.append('old_files', JSON.stringify([]));
        else formData.append('old_files', JSON.stringify(old_files));

        formData.append('status', type); // Документ, шаблон чи чернетка
        formData.append('old_status', status); // Попередній статус - шаблон чи чернетка

        if (this.state.files.length > 0) {
          this.state.files.map((file) => {
            formData.append('file', file);
          });
        }

        // TODO Чому новий документ не додається в таблоицю?

        axiosPostRequest('', formData)
          .then((response) => {
            // опублікування документу оновлює таблицю документів:
            this.props.addDoc(response, doc.type, getToday(), doc.type_id, type);

            // видаляємо чернетку:
            if (status === 'draft') this.delDoc();
          })
          .catch((error) => notify(error));

        this.props.onCloseModal();
      }
    } catch (e) {
      notify(e);
    }
  };

  delDoc = () => {
    if (this.props.doc.id !== 0) {
      // Якщо це не створення нового документу:
      this.props.removeDoc(this.props.doc.id);
      // axiosPostRequest('del_doc/' + this.props.doc.id + '/')
      //   .then((response) => {
      //     this.props.removeDoc(this.props.doc.id);
      //   })
      //   .catch((error) => notify(error));
    }

    this.props.onCloseModal();
  };

  onCloseModal = () => {
    this.setState({open: false});
    // Передаємо вверх інфу, що модальне вікно закрите
    this.props.onCloseModal();
  };

  render() {
    let {doc} = this.props;

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
      days,
      gate,
      carry_out_items,
      contract
    } = this.state;

    // Визначаємо, наскільки великим буде текстове поле:
    let rows = 1;
    switch (doc.type_id) {
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
      <Modal open={open} onClose={this.onCloseModal} showCloseIcon={false} closeOnOverlayClick={false} styles={{modal: {marginTop: 50}}}>
        <div ref={(divElement) => (this.divElement = divElement)}>
          <If condition={type_modules.length > 0 && render_ready}>
            <div className='modal-header d-flex justify-content-between'>
              <h4 className='modal-title'>{doc.type}</h4>
              <button className='btn btn-link' onClick={() => this.onCloseModal()}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className='modal-body p-0'>
              <For each='module' index='index' of={type_modules}>
                <div key={module.id} className='css_new_doc_module mt-1'>
                  <Choose>
                    <When condition={module.module === 'name'}>
                      <Name onChange={this.onChange} name={name} fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'preamble'}>
                      <Preamble onChange={this.onChange} preamble={preamble} fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'text'}>
                      <Text
                        onChange={this.onChangeText}
                        text={getTextByQueue(text, index)}
                        fieldName={module.field_name}
                        id={module.id}
                        rows={rows}
                        queue={module.queue}
                      />
                    </When>
                    <When condition={module.module === 'day'}>
                      <Day
                        // day={day}
                        day={getDayByQueue(days, index)}
                        onChange={this.onChangeDay}
                        fieldName={module.field_name}
                        queue={module.queue}
                      />
                    </When>
                    <When condition={module.module === 'recipient'}>
                      <Recipient onChange={this.onChange} recipient={recipient} fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'recipient_chief'}>
                      <RecipientChief onChange={this.onChange} recipientChief={recipient_chief} fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'articles'}>
                      <Articles onChange={this.onChange} articles={articles} modules={type_modules} fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'files'}>
                      <FilesUpload onChange={this.onChange} files={files} fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'acquaint_list'}>
                      <AcquaintList onChange={this.onChange} acquaintList={acquaint_list} fieldName={module.field_name} />
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
                    <When condition={module.module === 'gate'}>
                      <Gate checkedGate={gate} onChange={this.onChange} fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'carry_out_items'}>
                      <CarryOut carryOutItems={carry_out_items} onChange={this.onChange} fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'mockup_type'}>
                      <MockupType fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'mockup_product_type'}>
                      <MockupProductType fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'client'}>
                      <Client fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'dimensions'}>
                      <Text
                        onChange={this.onChange}
                        text={getTextByQueue(text, index)}
                        fieldName={module.field_name}
                        id={module.id}
                        rows={rows}
                        queue={module.queue}
                        type='dimensions'
                      />
                    </When>
                    <When condition={module.module === 'packaging_type'}>
                      <PackagingType packaging_type={getTextByQueue(text, index)} fieldName={module.field_name} />
                    </When>
                    <When condition={module.module === 'contract_link'}>
                      <ChooseMainContract onChange={this.onChangeContract} contract={contract} fieldName={module.field_name} />
                    </When>
                    <Otherwise> </Otherwise>
                  </Choose>
                </div>
              </For>
            </div>

            <div className='modal-footer'>
              <If condition={this.props.doc.id !== 0}>
                <button className='float-sm-left btn btn-sm btn-outline-danger mb-1' onClick={() => this.delDoc()}>
                  Видалити
                </button>
              </If>
              <button className='float-sm-left btn btn-sm btn-outline-info mb-1' onClick={() => this.newDocument('draft')}>
                В чернетки
              </button>
              <button className='float-sm-left btn btn-sm btn-outline-info mb-1' onClick={() => this.newDocument('template')}>
                Зберегти як шаблон
              </button>
              <button
                className='float-sm-left btn btn-success mb-1'
                onClick={() => this.newDocument(this.props.status === 'change' ? 'change' : 'doc')}
              >
                Підтвердити
              </button>
            </div>
          </If>
        </div>
        {/*Вспливаюче повідомлення*/}
        <ToastContainer />
      </Modal>
    );
  }

  static defaultProps = {
    status: 'doc',
    text: [],
    doc: {
      id: 0,
      type: '',
      type_id: 0
    },
    onCloseModal: () => {}
  };
}

export default view(NewDocument);
