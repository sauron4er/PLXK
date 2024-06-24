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
import Counterparty from 'edms/templates/edms/my_docs/new_doc_modules/counterparty';
import PackagingType from './packaging_type';
import ChooseMainContract from 'edms/templates/edms/my_docs/new_doc_modules/choose_main_contract';
import ChooseCompany from 'edms/templates/edms/my_docs/new_doc_modules/choose_company';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {
  getTextByQueue,
  getDayByQueue,
  getIndexByProperty,
  isBlankOrZero,
  getToday,
  notify,
  getDatetimeByQueue
} from 'templates/components/my_extras';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import decreeArticlesStore from 'edms/templates/edms/my_docs/new_doc_modules/decree_articles/store';
import 'static/css/my_styles.css';
import CustomSelect from 'edms/templates/edms/my_docs/new_doc_modules/custom_select';
import ProductType from 'edms/templates/edms/my_docs/new_doc_modules/product_type';
import Scope from 'edms/templates/edms/my_docs/new_doc_modules/scope';
import Law from 'edms/templates/edms/my_docs/new_doc_modules/law';
import ClientRequirements from 'edms/templates/edms/my_docs/new_doc_modules/client_requirements/client_requirements';
import AutoRecipientsInfo from 'edms/templates/edms/my_docs/new_doc_modules/auto_recipients_info';
import DocumentLink from 'edms/templates/edms/my_docs/new_doc_modules/document_link';
import Registration from 'edms/templates/edms/my_docs/new_doc_modules/registration';
import DocTypeVersion from 'edms/templates/edms/my_docs/new_doc_modules/doc_type_version';
import EmployeesAll from 'edms/templates/edms/my_docs/new_doc_modules/employees_all';
import Datetime from 'edms/templates/edms/my_docs/new_doc_modules/datetime';
import FoyerRanges from 'edms/templates/edms/my_docs/new_doc_modules/foyer_ranges';
import CostRates from 'edms/templates/edms/my_docs/new_doc_modules/cost_rates/cost_rates';
import {areCostRatesValid} from 'edms/templates/edms/my_docs/new_doc_modules/cost_rates/validation';
import SubmitButton from 'templates/components/form_modules/submit_button';
import Deadline from 'edms/templates/edms/my_docs/new_doc_modules/deadline';
import ContractSubject from 'edms/templates/edms/my_docs/new_doc_modules/contract_subject';
import EmployeeSeat from 'edms/templates/edms/my_docs/new_doc_modules/employee_seat';
import DecreeArticles from 'edms/templates/edms/my_docs/new_doc_modules/decree_articles/decree_articles';
import {areArticlesValid} from 'edms/templates/edms/my_docs/new_doc_modules/decree_articles/validation';
import ClientRequirementsChoose from 'edms/templates/edms/my_docs/new_doc_modules/client_requirements_choose';
import NonEditable from 'edms/templates/edms/my_docs/new_doc_modules/non_editable';
import Integer from 'edms/templates/edms/my_docs/new_doc_modules/integer';
import Decimal from 'edms/templates/edms/my_docs/new_doc_modules/decimal';
import BagTest from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test';
import {areBagTestFieldsFilled} from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_validation';
import {addBagTestFiles} from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/add_bag_test_files';
import Boolean from "edms/templates/edms/my_docs/new_doc_modules/boolean";
import DepAndSeatChoose from "edms/templates/edms/my_docs/new_doc_modules/dep_and_seat_choose";
import Department from "edms/templates/edms/my_docs/new_doc_modules/department";
import Section from "edms/templates/edms/my_docs/new_doc_modules/section";

class NewDocument extends React.Component {
  state = {
    open: true,
    render_ready: false,
    type_modules: [],
    text: [],
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
    days: [],
    gate: 1,
    carry_out_items: [],
    main_field_queue: 0,
    post_request_sent: false
  };

  componentDidMount() {
    // Отримуємо з бд список модулів, які використовує даний тип документа:
    this.getDocTypeModules();
    // Якщо це чернетка чи шаблон, отримуємо з бд дані:
    this.getDocInfo();
    // Стираємо пункти наказу, які могли залишитись після редагування попереднього наказу
    decreeArticlesStore.decree_articles = [];
  }

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

  onChangeContract = (contract) => {
    newDocStore.new_document.contract_link = contract.id;
    newDocStore.new_document.contract_link_name = contract.name;
    // const selectedIndex = contract.target.options.selectedIndex;
    // newDocStore.new_document.contract_link = parseInt(contract.target.options[selectedIndex].getAttribute('data-key'));
    // newDocStore.new_document.contract_link_name = contract.target.options[selectedIndex].getAttribute('value');
  };

  onChangeCustomSelect = (event) => {
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

  onChangeDatetime = (event, type, queue) => {
    let {datetimes} = newDocStore.new_document;

    const queue_in_array = getIndexByProperty(datetimes, 'queue', parseInt(queue));
    if (queue_in_array === -1) {
      if (type === 'day') {
        datetimes.push({
          queue: parseInt(queue),
          day: event.target.value
        });
      } else {
        datetimes.push({
          queue: parseInt(queue),
          time: event.target.value
        });
      }
    } else {
      if (type === 'day') {
        datetimes[queue_in_array].day = event.target.value;
      } else {
        datetimes[queue_in_array].time = event.target.value;
      }
    }
    newDocStore.new_document.datetimes = datetimes;
  };

  getDocTypeModules = () => {
    const meta_type_id = this.props.status === 'template' ? 0 : this.props.doc.meta_type_id;
    axiosGetRequest('get_doc_type_modules/' + meta_type_id + '/' + this.props.doc.type_id + '/')
      .then((response) => {
        this.setState({
          type_modules: response.doc_type_modules,
          main_field_queue: response.main_field_queue
        });
        newDocStore.new_document.doc_type_id = response.doc_type_id;
        newDocStore.auto_recipients = response.auto_recipients;
      })
      .catch((error) => notify(error));
  };

  getDocInfo = () => {
    if (this.props.doc.id !== 0) {
      axiosGetRequest('get_doc/' + this.props.doc.id + '/')
        .then((response) => {
          this.setState({
            text: response.text_list || [],
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
            employee: response.author_seat_id || 0,
            employee_name: response.author || '',
            foyer_ranges: response.foyer_ranges || [],
            render_ready: true
          });
          newDocStore.new_document.datetimes = response?.datetimes || [];
          newDocStore.new_document.foyer_ranges = response?.datetimes || [];
          newDocStore.new_document.text = response?.text_list || [];
          newDocStore.new_document.integers = response?.integers || [];
          newDocStore.new_document.client = response?.client?.id;
          newDocStore.new_document.client_name = response?.client?.name;
          newDocStore.new_document.department = response?.department?.id;
          newDocStore.new_document.department_name = response?.department?.name;
          newDocStore.new_document.mockup_type = response?.mockup_type?.id || 0;
          newDocStore.new_document.mockup_type_name = response?.mockup_type?.name || '';
          newDocStore.new_document.mockup_product_type = response?.mockup_product_type?.id;
          newDocStore.new_document.mockup_product_type_name = response?.mockup_product_type?.name;
          newDocStore.new_document.contract_link = response?.contract_link?.id;
          newDocStore.new_document.contract_link_name = response?.contract_link?.name;
          newDocStore.new_document.company = response?.company;
          newDocStore.new_document.counterparty = response?.counterparty?.id;
          newDocStore.new_document.counterparty_name = response?.counterparty?.name;
          newDocStore.new_document.counterparty_input = response?.counterparty?.input;
          newDocStore.new_document.product_type = response?.sub_product?.product_id;
          newDocStore.new_document.product_type_name = response?.sub_product?.product;
          newDocStore.new_document.sub_product_type = response?.sub_product?.id;
          newDocStore.new_document.sub_product_type_name = response?.sub_product?.sub_product;
          newDocStore.new_document.counterparty_input = response?.counterparty?.input;
          newDocStore.new_document.scope = response?.scope?.id;
          newDocStore.new_document.scope_name = response?.scope?.name;
          newDocStore.new_document.law = response?.law?.id;
          newDocStore.new_document.law_name = response?.law?.name;
          newDocStore.new_document.client_requirements = response?.client_requirements;
          newDocStore.new_document.document_link = response?.document_link;
          newDocStore.new_document.document_link_name = response?.document_link_name;
          newDocStore.new_document.doc_type_version = response?.doc_type_version;
          newDocStore.new_document.doc_type_version_name = response?.doc_type_version_name;
          newDocStore.new_document.deadline = response?.deadline;
          newDocStore.new_document.contract_subject = response?.contract_subject;
          newDocStore.new_document.contract_subject_name = response?.contract_subject_name;
          newDocStore.new_document.contract_subject_input = response?.contract_subject_text;
        })
        .catch((error) => notify(error));
    } else this.setState({render_ready: true});
  };

  isDimensionsFieldFilled = (module) => {
    for (const i in newDocStore.new_document.dimensions) {
      if (newDocStore.new_document.dimensions.hasOwnProperty(i) && newDocStore.new_document.dimensions[i].queue === module.queue) {
        return !isBlankOrZero(newDocStore.new_document.dimensions[i].text);
      }
    }
    return false;
  };

  isTextFieldFilled = (module) => {
    for (const i in newDocStore.new_document.text) {
      if (newDocStore.new_document.text.hasOwnProperty(i) && newDocStore.new_document.text[i].queue === module.queue) {
        return !isBlankOrZero(newDocStore.new_document.text[i].text);
      }
    }
    return false;
  };

  isIntegerFieldFilled = (module) => {
    for (const i in newDocStore.new_document.integers) {
      if (newDocStore.new_document.integers.hasOwnProperty(i) && newDocStore.new_document.integers[i].queue === module.queue) {
        return !isBlankOrZero(newDocStore.new_document.integers[i].value);
      }
    }
    return false;
  };

  isFoyerDatetimesFilled = () => {
    let foyer_ranges = {...newDocStore.new_document.foyer_ranges};

    for (const i in foyer_ranges) {
      const time = {...foyer_ranges[i]};
      if (time.out === 'invalid' || time.in === 'invalid') {
        notify('Будь ласка, правильно заповніть всі поля входу/виходу');
        return false;
      }
      if (time.out !== '' && time.in !== '') {
        if ([1, 2].includes(newDocStore.new_document.doc_type_version) && time.in <= time.out) {
          // 1,2 - звільнююча
          notify('Час повернення не може бути меншим за час виходу.');
          return false;
        } else if ([3, 4].includes(newDocStore.new_document.doc_type_version) && time.in >= time.out) {
          // 3,4 - тимчасова, забув
          notify('Час виходу не може бути меншим за час входу.');
          return false;
        }
      }
    }
    return true;
  };

  // Перевіряє, чи всі необхідні поля заповнені
  requiredFieldsFilled = () => {
    for (const module of this.state.type_modules) {
      if (
        module.required &&
        !['choose_company'].includes(module.module) &&
        (module.doc_type_version === 0 || module.doc_type_version === newDocStore.new_document.doc_type_version)
      ) {
        if (module.module === 'cost_rates') {
          if (!areCostRatesValid()) {
            return false;
          }
        } else if (module.module === 'decree_articles') {
          if (!areArticlesValid()) {
            return false;
          }
        } else if (module.module === 'dimensions') {
          if (!this.isDimensionsFieldFilled(module)) {
            notify('Поле "' + module.field_name + '" необхідно заповнити (тільки цифри)');
            return false;
          }
        } else if (
          [
            'mockup_type',
            'mockup_product_type',
            'client',
            'packaging_type',
            'scope',
            'law',
            'doc_type_version',
            'employee',
            'employee_seat',
            'decimal'
          ].includes(module.module)
        ) {
          if (isBlankOrZero(newDocStore.new_document[module.module])) {
            notify('Поле "' + module.field_name + '" необхідно заповнити');
            return false;
          }
        } else if (module.module === 'product_type_sell') {
          if (isBlankOrZero(newDocStore.new_document.product_type)) {
            notify('Поле "Тип продукції" необхідно заповнити');
            return false;
          } else if (isBlankOrZero(newDocStore.new_document.sub_product_type)) {
            notify('Поле "Підтип продукції" необхідно заповнити');
            return false;
          }
        } else if (module.module === 'counterparty') {
          if (isBlankOrZero(newDocStore.new_document.counterparty) && isBlankOrZero(newDocStore.new_document.counterparty_input)) {
            notify('Поле "' + module.field_name + '" необхідно заповнити');
            return false;
          }
        } else if (module.module === 'client_requirements') {
          if (!newDocStore.areRequirementsFilled()) {
            notify('Необхідно заповнити всі обов’язкові поля Вимог клієнта');
            return false;
          }
        } else if (module.module === 'bag_test') {
          if (!areBagTestFieldsFilled()) {
            notify('Необхідно заповнити всі обов’язкові поля');
            return false;
          }
        } else if (module.module === 'department') {
          if (!newDocStore.new_document.department) {
            notify('Необхідно обрати відділ');
            return false;
          }
        } else if (module.module === 'dep_seat') {
          if (!newDocStore.new_document.dep_seat.seat) {
            notify('Необхідно обрати посаду');
            return false;
          }
        } else if ([16, 32].includes(module.module_id)) {
          // text, select
          if (!this.isTextFieldFilled(module)) {
            notify('Поле "' + module.field_name + '" необхідно заповнити');
            return false;
          }
        } else if (module.module === 'integer') {
          if (!this.isIntegerFieldFilled(module)) {
            notify('Поле "' + module.field_name + '" необхідно заповнити');
            return false;
          }
        } else if (module.module === 'day') {
          const days = this.state.days;

          let day_exists = false;
          for (const i in days) {
            if (days[i].queue === module.queue) {
              if (days[i].day && days[i]?.day !== '') {
                day_exists = true;
              }
            }
          }
          if (!day_exists) {
            notify('Поле "' + module.field_name + '" необхідно заповнити');
            return false;
          }
        } else if (module.module === 'datetime') {
          const datetimes = newDocStore.new_document.datetimes;

          let datetime_exists = false;
          for (const i in datetimes) {
            if (datetimes[i].queue === module.queue) {
              if (datetimes[i].day !== '' && datetimes[i].time !== '') {
                datetime_exists = true;
              }
            }
          }
          if (!datetime_exists) {
            notify('Поле "' + module.field_name + '" необхідно заповнити');
            return false;
          }
        } else if (module.module === 'foyer_ranges') {
          if (!this.isFoyerDatetimesFilled()) return false;
        } else if (module.module === 'contract_subject') {
          if (isBlankOrZero(newDocStore.new_document.contract_subject) && isBlankOrZero(newDocStore.new_document.contract_subject_input)) {
            notify('Необхідно обрати Предмет договору зі списку, або внести вручну');
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

          if (!!module.hide || [2, 29, 33, 48].includes(module.module_id)) {
            // Приховані модулі будуть використовуватися в наступних фазах
            // Модулі auto_approved, phases, non_editable не створюються у браузері
            // Модуль acquaint_list не обов'язковий
          } else if (
            [
              'mockup_type',
              'mockup_product_type',
              'dimensions',
              'client',
              'packaging_type',
              'contract_link',
              'employee',
              'decimal'
            ].includes(module.module)
          ) {
            doc_modules[module.module] = {
              queue: module.queue,
              value: newDocStore.new_document[module.module]
            };
          } else if ([16, 32].includes(module.module_id)) {
            // text, select
            doc_modules.text = newDocStore.new_document.text;
          } else if (module.module_id === 22) {
            // Погоджуючі (треба відправити хоча б пустий список)
            doc_modules.approval_list = this.state.approval_list;
          } else if (module.module === 'day') {
            doc_modules['days'] = this.state.days;
          } else if (module.module === 'datetime') {
            doc_modules['datetimes'] = newDocStore.new_document.datetimes;
          } else if (module.module === 'integer') {
            doc_modules['integers'] = newDocStore.new_document.integers;
          } else if (module.module === 'boolean') {
            doc_modules['booleans'] = newDocStore.new_document.booleans;
          } else if (module.module === 'choose_company') {
            doc_modules['choose_company'] = newDocStore.new_document.company;
          } else if (module.module === 'department') {
            doc_modules['department'] = newDocStore.new_document.department;
          } else if (module.module === 'dep_seat') {
            doc_modules['dep_seat'] = newDocStore.new_document.dep_seat.seat;
          } else if (module.module === 'counterparty') {
            doc_modules['counterparty'] = newDocStore.new_document.counterparty;
            doc_modules['counterparty_input'] = newDocStore.new_document.counterparty_input;
          } else if (module.module === 'product_type_sell') {
            doc_modules['sub_product_type'] = newDocStore.new_document.sub_product_type;
          } else if (
            ['scope', 'law', 'client_requirements', 'doc_type_version', 'cost_rates', 'deadline', 'employee_seat'].includes(module.module)
          ) {
            doc_modules[module.module] = newDocStore.new_document[module.module];
          } else if (module.module === 'foyer_ranges') {
            doc_modules[module.module] = this.getFoyerRanges();
          } else if (module.module === 'document_link') {
            doc_modules[module.module] = this.props.doc.document_link;
          } else if (module.module === 'registration') {
            doc_modules[module.module] = newDocStore.new_document.registration_number;
          } else if (module.module === 'decree_articles') {
            doc_modules[module.module] = decreeArticlesStore.decree_articles;
          } else if (module.module === 'contract_subject') {
            doc_modules[module.module] = {
              id: newDocStore.new_document.contract_subject,
              input: newDocStore.new_document.contract_subject_input
            };
          } else if (module.module === 'client_requirements_choose') {
            doc_modules[module.module] = newDocStore.new_document.choosed_client_requirement;
          } else if (module.module === 'bag_test') {
            doc_modules[module.module] = newDocStore.new_document.bag_test_fields;
          } else if (this.state[module.module].length !== 0 && this.state[module.module].id !== 0) {
            doc_modules[module.module] = this.state[module.module];
          }
        });

        let formData = new FormData();
        // інфа нового документу:
        formData.append('doc_type_version', newDocStore.new_document.doc_type_version);
        formData.append('doc_modules', JSON.stringify(doc_modules));
        formData.append('document_type', newDocStore.new_document.doc_type_id);
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

        formData = addBagTestFiles(formData);

        this.setState({
          post_request_sent: true
        });

        axiosPostRequest('post_doc', formData)
          .then((response) => {
            if (response === 'reg_number_taken') {
              notify('Цей реєстраційний номер вже використовується. Оберіть інший.');
              this.setState({post_request_sent: true});
            } else {
              // опублікування документу оновлює таблицю документів:
              this.props.addDoc(response, doc.type, this.getMainField(), getToday(), doc.type_id, type);
              newDocStore.clean_fields();

              // видаляємо чернетку:
              if (status === 'draft') this.delDoc();
              this.props.onCloseModal();
            }
          })
          .catch((error) => {
            this.setState({post_request_sent: true});
            notify('Не вдалося зберегти документ, зверніться до адміністратора');
          });
      }
    } catch (e) {
      notify(e);
    }
  };

  getFoyerRanges = () => {
    const {foyer_ranges} = newDocStore.new_document;
    let new_ranges = [];
    for (const i in foyer_ranges) {
      const r_out = foyer_ranges[i].out instanceof Date ? foyer_ranges[i].out.getTime() / 1000 : foyer_ranges[i].out;
      const r_in = foyer_ranges[i].in instanceof Date ? foyer_ranges[i].in.getTime() / 1000 : foyer_ranges[i].in;
      new_ranges.push({out: r_out, in: r_in});
    }
    return new_ranges;
  };

  getMainField = () => {
    for (const x in newDocStore.new_document.text) {
      if (newDocStore.new_document.text[x].queue === this.state.main_field_queue) {
        return newDocStore.new_document.text[x].text;
      }
    }
    if (this.state.type_modules[this.state.main_field_queue].module === 'client') {
      return newDocStore.new_document.client_name;
    }
    if (this.state.type_modules[this.state.main_field_queue].module === 'counterparty') {
      if (newDocStore.new_document.counterparty_name !== '') return newDocStore.new_document.counterparty_name;
      else return newDocStore.new_document.counterparty_input;
    }
    if (this.state.type_modules[this.state.main_field_queue].module === 'doc_type_version') {
      return newDocStore.new_document.doc_type_version_name;
    }
    if (this.state.type_modules[this.state.main_field_queue].module === 'cost_rates') {
      return newDocStore.new_document.cost_rates.product_name;
    }
    if (this.state.type_modules[this.state.main_field_queue].module === 'bag_test') {
      return newDocStore.new_document.client_name;
    }
    return 0;
  };

  delDoc = () => {
    if (this.props.doc.id !== 0) {
      // Якщо це не створення нового документу:
      this.props.removeDoc(this.props.doc.id);
    }

    this.props.onCloseModal();
  };

  onCloseModal = () => {
    this.setState({open: false});
    // Передаємо вверх інфу, що модальне вікно закрите
    this.props.onCloseModal();
    newDocStore.clean_fields();
  };

  render() {
    let {doc} = this.props;

    const {
      open,
      type_modules,
      render_ready,
      text,
      articles,
      recipient,
      recipient_chief,
      acquaint_list,
      approval_list,
      sign_list,
      files,
      days,
      gate,
      carry_out_items,
      post_request_sent
    } = this.state;

    const {doc_type_version} = newDocStore.new_document;

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
      <>
        <Modal open={open} onClose={this.onCloseModal} showCloseIcon={false} closeOnOverlayClick={false} styles={{modal: {marginTop: 70}}}>
          <div ref={(divElement) => (this.divElement = divElement)}>
            <If condition={type_modules.length > 0 && render_ready}>
              <div className='modal-header d-flex justify-content-between'>
                <h4 className='modal-title'>{doc.type}</h4>
                <button className='btn btn-link' onClick={() => this.onCloseModal()}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <small>Обов’язкові поля позначені зірочкою</small>

              <div className='modal-body p-2 row css_module_row'>
                <For each='module' index='index' of={type_modules}>
                  <If condition={!module.hide && (module.doc_type_version === 0 || module.doc_type_version === doc_type_version)}>
                    <div key={module.id} className={`px-1 mt-1 col-md-${module.columns}`}>
                      <div className={`css_new_doc_module`}>
                        <Choose>
                          <When condition={module.module === "text"}>
                            <Text module_info={module} rows={rows} />
                          </When>
                          <When condition={module.module === "day"}>
                            <Day module_info={module} day={getDayByQueue(days, index)} onChange={this.onChangeDay} />
                          </When>
                          <When condition={module.module === "datetime"}>
                            <Datetime
                              module_info={module}
                              datetime={getDatetimeByQueue(newDocStore.new_document.datetimes, index)}
                              onChange={this.onChangeDatetime}
                            />
                          </When>
                          <When condition={module.module === "recipient"}>
                            <Recipient onChange={this.onChange} recipient={recipient} module_info={module} />
                          </When>
                          <When condition={module.module === "recipient_chief"}>
                            <RecipientChief onChange={this.onChange} recipientChief={recipient_chief}
                                            module_info={module} />
                          </When>
                          <When condition={module.module === "files"}>
                            <FilesUpload onChange={this.onChange} files={files} module_info={module} />
                          </When>
                          <When condition={module.module === "acquaint_list"}>
                            <AcquaintList onChange={this.onChange} acquaintList={acquaint_list} module_info={module} />
                          </When>
                          <When condition={module.module === "approval_list"}>
                            <ApprovalList onChange={this.onChange} approvalList={approval_list} module_info={module} />
                          </When>
                          <When condition={module.module === "sign_list"}>
                            <SignList onChange={this.onChange} signList={sign_list} module_info={module} />
                          </When>
                          <When condition={module.module === "gate"}>
                            <Gate checkedGate={gate} onChange={this.onChange} module_info={module} />
                          </When>
                          <When condition={module.module === "carry_out_items"}>
                            <CarryOut carryOutItems={carry_out_items} onChange={this.onChange} module_info={module} />
                          </When>
                          <When condition={module.module === "mockup_type"}>
                            <MockupType module_info={module} />
                          </When>
                          <When condition={module.module === "mockup_product_type"}>
                            <MockupProductType module_info={module} />
                          </When>
                          <When condition={module.module === "client"}>
                            <Client module_info={module} docType={doc.type_id} />
                          </When>
                          <When condition={module.module === "counterparty"}>
                            <Counterparty module_info={module} />
                          </When>
                          <When condition={module.module === "dimensions"}>
                            <Text module_info={module} rows={rows} type="dimensions" />
                          </When>
                          <When condition={module.module === "packaging_type"}>
                            <PackagingType packaging_type={getTextByQueue(text, index)} module_info={module} />
                          </When>
                          <When condition={module.module === "contract_link"}>
                            <ChooseMainContract onChange={this.onChangeContract} module_info={module} />
                          </When>
                          <When condition={module.module === "choose_company"}>
                            <ChooseCompany module_info={module} />
                          </When>
                          <When condition={module.module === "select"}>
                            <CustomSelect module_info={module} />
                          </When>
                          <When condition={module.module === "product_type_sell"}>
                            <ProductType module_info={module} direction="sell" />
                          </When>
                          <When condition={module.module === "scope"}>
                            <Scope module_info={module} />
                          </When>
                          <When condition={module.module === "law"}>
                            <Law module_info={module} scope={newDocStore.new_document.scope} />
                          </When>
                          <When condition={module.module === "client_requirements"}>
                            <ClientRequirements module_info={module} />
                          </When>
                          <When condition={module.module === "document_link"}>
                            <DocumentLink moduleInfo={module} documentLink={doc.document_link}
                                          mainField={doc.main_field} />
                          </When>
                          <When condition={module.module === "registration"}>
                            <Registration moduleInfo={module} />
                          </When>
                          <When condition={module.module === "doc_type_version"}>
                            <DocTypeVersion module_info={module} />
                          </When>
                          <When condition={module.module === "employee"}>
                            <EmployeesAll module_info={module} />
                          </When>
                          <When condition={module.module === "foyer_ranges"}>
                            <FoyerRanges module_info={module} />
                          </When>
                          <When condition={module.module === "cost_rates"}>
                            <CostRates module_info={module} />
                          </When>
                          <When condition={module.module === "deadline"}>
                            <Deadline module_info={module} />
                          </When>
                          <When condition={module.module === "contract_subject"}>
                            <ContractSubject module_info={module} />
                          </When>
                          <When condition={module.module === "employee_seat"}>
                            <EmployeeSeat module_info={module} />
                          </When>
                          <When condition={module.module === "decree_articles"}>
                            <DecreeArticles module_info={module} />
                          </When>
                          <When condition={module.module === "non_editable"}>
                            <NonEditable module_info={module} />
                          </When>
                          <When condition={module.module === "integer"}>
                            <Integer module_info={module} />
                          </When>
                          <When condition={module.module === "decimal"}>
                            <Decimal module_info={module} />
                          </When>
                          <When condition={module.module === "boolean"}>
                            <Boolean module_info={module} />
                          </When>
                          <When condition={module.module === "department"}>
                            <Department />
                          </When>
                          <When condition={module.module === "dep_seat"}>
                            <DepAndSeatChoose />
                          </When>
                          <When
                            condition={
                              newDocStore.new_document.counterparty_type === "client" && module.module === "client_requirements_choose"
                            }
                          >
                            <ClientRequirementsChoose module_info={module}
                                                      counterparty={newDocStore.new_document.counterparty} />
                          </When>
                          <When condition={module.module === "bag_test"}>
                            <BagTest />
                          </When>
                          <When condition={module.module === "section"}>
                            <Section name={module.field_name} />
                          </When>
                          <Otherwise> </Otherwise>
                        </Choose>
                      </div>
                    </div>
                  </If>
                </For>
                <If condition={newDocStore.auto_recipients}>
                  <AutoRecipientsInfo />
                </If>
              </div>

              <div className='modal-footer'>
                <If condition={this.props.doc.id !== 0}>
                  <button className='float-sm-left btn btn-sm btn-outline-danger mb-1' onClick={() => this.delDoc()}>
                    Видалити
                  </button>
                </If>
                {/*<button className='float-sm-left btn btn-sm btn-outline-info mb-1' onClick={() => this.newDocument('draft')}>*/}
                {/*  В чернетки*/}
                {/*</button>*/}
                <button className='float-sm-left btn btn-sm btn-outline-info mb-1' onClick={() => this.newDocument('template')}>
                  Зберегти як шаблон
                </button>
                <SubmitButton
                  className='btn-info'
                  text='Підтвердити'
                  onClick={() => this.newDocument(this.props.status === 'change' ? 'change' : 'doc')}
                  // requestSent={post_request_sent}
                />
              </div>
            </If>
          </div>
          {/*Вспливаюче повідомлення*/}
          {/*<ToastContainer />*/}
        </Modal>
        <Modal
          open={newDocStore.additional_modal_opened}
          onClose={() => (newDocStore.additional_modal_opened = false)}
          classNames={{
            modal: 'css_additional_modal'
          }}
        >
          {newDocStore.additional_modal_content}
        </Modal>
      </>
    );
  }

  static defaultProps = {
    status: 'doc',
    text: [],
    doc: {
      id: 0,
      type: '',
      type_id: 0,
      meta_type_id: 0,
      document_link: 0,
      main_field: ''
    },
    onCloseModal: () => {}
  };
}

export default view(NewDocument);
