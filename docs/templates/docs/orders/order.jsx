'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {faCircle, faCheckCircle} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {getIndex, isBlankOrZero, notify} from 'templates/components/my_extras';
import OrderMail from 'docs/templates/docs/orders/order_mail';
import {Loader} from 'templates/components/loaders';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import ordersStore from 'docs/templates/docs/orders/orders_store';
import Selector from 'templates/components/form_modules/selectors/selector';
import TextInput from 'templates/components/form_modules/text_input';
import Files from 'templates/components/form_modules/files';
import DateInput from 'templates/components/form_modules/date_input';
import Articles from 'templates/components/form_modules/articles/articles';
import SubmitButton from 'templates/components/form_modules/submit_button';
import SelectorWithFilter from 'templates/components/form_modules/selectors/selector_with_filter';
import Document from 'edms/templates/edms/my_docs/doc_info/document';
import Modal from 'react-responsive-modal';
import PrintOrder from 'docs/templates/docs/orders/print_order';
import CompanyChoose from 'templates/components/form_modules/company_choose';

class Order extends React.Component {
  state = {
    loading: false,
    error404: false,
    request_sent: false,
    edms_doc_opened: false,
    company: 'ТДВ'
  };

  componentDidMount() {
    if (ordersStore.order.id !== 0) {
      // Якщо 0 - то це створення нового наказу
      this.getOrder();
      this.setState({loading: true});
    }
  }

  isAllFieldsFilled = () => {
    if (isBlankOrZero(ordersStore.order.type)) {
      notify('Заповніть поле "Тип документа"');
      return false;
    }
    if (isBlankOrZero(ordersStore.order.code)) {
      notify('Заповніть поле "№');
      return false;
    }
    if (isBlankOrZero(ordersStore.order.name)) {
      notify('Заповніть поле "Назва"');
      return false;
    }
    if (isBlankOrZero(ordersStore.order.articles)) {
      notify('Внесіть інформацію про пункти наказу');
      return false;
    }
    // if (isBlankOrZero(ordersStore.order.files) && isBlankOrZero(ordersStore.order.files_old)) {
    //   notify('Додайте файл документу');
    //   return false;
    // }
    if (isBlankOrZero(ordersStore.order.author)) {
      notify('Оберіть автора документу');
      return false;
    }
    if (isBlankOrZero(ordersStore.order.supervisory)) {
      notify('Оберіть контролюючу особу документу');
      return false;
    }
    if (isBlankOrZero(ordersStore.order.date_start)) {
      notify('Оберіть дату початку дії документу');
      return false;
    }
    return true;
  };

  areDatesInOrder = () => {
    if (ordersStore.order.date_canceled && ordersStore.order.date_canceled < ordersStore.order.date_start) {
      notify('Дата скасування документу не може бути меншою ніж дата початку його дії');
      return false;
    }
    return true;
  };

  deleteBlankArticle = () => {
    const articles = [...ordersStore.order.articles];

    for (const i in articles) {
      if (articles[i].text === '' && articles[i].deadline === '' && articles[i].responsibles.length === 0) {
        articles.splice(i, 1);
        ordersStore.order.articles = [...articles];
      }
    }
  };

  getOrder = () => {
    axiosGetRequest('get_order/' + ordersStore.order.id + '/')
      .then((response) => {
        ordersStore.order = response.order;
        ordersStore.order.mail_mode = 'to_default';
        this.setState({loading: false});
      })
      .catch((error) => {
        this.setState({error404: true});
      });
  };

  postOrder = () => {
    this.deleteBlankArticle();
    if (this.isAllFieldsFilled() && this.areDatesInOrder()) {
      const {
        id,
        company,
        type,
        type_name,
        code,
        name,
        preamble,
        author,
        responsible,
        supervisory,
        date_start,
        date_canceled,
        canceled_by_id,
        cancels_id,
        cancels_code,
        files,
        files_old,
        cancels_files,
        cancels_files_old,
        articles,
        mail_mode,
        mail_list
      } = ordersStore.order;

      let formData = new FormData();
      formData.append('company', company);
      formData.append('doc_type', type);
      formData.append('type_name', type_name);
      formData.append('id', id);
      formData.append('code', code);
      formData.append('name', name);
      formData.append('preamble', preamble);
      formData.append('author', author);
      formData.append('articles', JSON.stringify(articles));
      formData.append('responsible', responsible);
      formData.append('supervisory', supervisory);
      formData.append('date_start', date_start);
      formData.append('date_canceled', date_canceled);
      formData.append('cancels', cancels_id !== '0' ? cancels_id : '');
      formData.append('canceled_by_id', canceled_by_id !== '0' ? canceled_by_id : '');
      formData.append('cancels_code', cancels_code);
      formData.append('files_old', JSON.stringify(files_old));
      formData.append('cancels_files_old', JSON.stringify(cancels_files_old));
      formData.append('mail_mode', ordersStore.is_orders_admin ? mail_mode : 'none');
      formData.append('mail_list', JSON.stringify(mail_list));

      if (files && files.length > 0) files.map((file) => formData.append('files', file));
      if (cancels_files && cancels_files.length > 0) cancels_files.map((file) => formData.append('cancels_files', file));

      const url = ordersStore.order.id === 0 ? 'add_order/' : 'edit_order/';

      this.setState({request_sent: true});

      axiosPostRequest(url, formData)
        .then((response) => {
          this.postResponsibleFiles(articles);
          ordersStore.order.id === 0 ? this.addOrder(response) : this.editOrder(response);
          this.setState({request_sent: false});
        })
        .catch((error) => {
          this.setState({request_sent: false});
          notify(error);
        });
    }
  };

  postResponsibleFiles = (articles) => {
    articles.map((article) => {
      article.responsibles.map((resp) => {
        if (resp?.files?.length > 0) {
          let formData = new FormData();
          formData.append('responsible_id', resp.responsible_id);
          resp.files.map((file) => formData.append('files', file));
          axiosPostRequest('post_responsible_file', formData)
            .then((response) => {})
            .catch((error) => notify(error));
        }
      });
    });
  };

  deactivateOrder = () => {
    let formData = new FormData();
    formData.append('id', ordersStore.order.id);
    axiosPostRequest('deactivate_order', formData)
      .then((response) => this.removeOrder(ordersStore.order.id))
      .catch((error) => notify(error));
  };

  isOrderDone = (articles) => {
    ordersStore.order.done = articles.every((article) => article.done === true);
    ordersStore.order.status = ordersStore.order.done ? 'ok' : 'in progress';
  };

  addOrder = (response) => {
    ordersStore.order.id = response.new_id;
    ordersStore.order.done = response.done;
    ordersStore.orders.push(ordersStore.order);
    this.closeOrderView();
  };

  editOrder = (response) => {
    ordersStore.order.done = response.done;
    response.done ? (ordersStore.order.status = 'ok') : (ordersStore.order.status = 'in progress');
    const index = getIndex(ordersStore.order.id, ordersStore.orders);
    ordersStore.orders[index] = ordersStore.order;
    this.closeOrderView();
  };

  removeOrder = (id) => {
    ordersStore.orders = ordersStore.orders.filter((order) => order.id !== id);
    this.closeOrderView();
  };

  closeOrderView = () => {
    ordersStore.view = 'table';
  };

  onSelectorChange = (e, id, name) => {
    // const selectedIndex = e.target.options.selectedIndex;
    // ordersStore.order[field_id_name] = e.target.options[selectedIndex].getAttribute('data-key');
    // ordersStore.order[field_name_name] = e.target.options[selectedIndex].getAttribute('value');
    ordersStore.order[id] = e.id;
    ordersStore.order[name] = e.name;
  };

  onInputChange = (e, field_name) => {
    ordersStore.order[field_name] = e.target.value;
  };

  onCompanyChange = (company) => {
    this.setState({company: company});
  };

  onArticlesChange = (articles) => {
    ordersStore.order.articles = [...articles];
    this.isOrderDone(articles);
  };

  onFilesDelete = (id, files_field) => {
    // Необхідно проводити зміни через додаткову перемінну, бо  react-easy-state не помічає змін глибоко всередині перемінних, як тут.
    let files = [...ordersStore.order[files_field]];
    for (const i in files) {
      if (files[i].id === id) {
        files[i].status = 'delete';
        break;
      }
    }
    ordersStore.order[files_field] = [...files];
  };

  onCancelsChange = () => {
    ordersStore.order.cancels_other_doc = !ordersStore.order.cancels_other_doc;
  };

  getCanceledDocId = () => {
    return './' + ordersStore.order.cancels_id;
  };

  getCanceledByDocId = () => {
    return './' + ordersStore.order.canceled_by_id;
  };

  openPDFModal = () => {
    this.setState({pdf_modal_open: true});
  };

  closePDFModal = () => {
    this.setState({pdf_modal_open: false});
  };

  onSignSeatChange = (e) => {
    this.setState({sign_seat: e.target.value});
  };

  onSignEmployeeChange = (e) => {
    this.setState({sign_employee: e.target.value});
  };

  onHrefClick = () => {
    navigator.clipboard.writeText(`http://plhk.com.ua/docs/orders/${ordersStore.order.id}`)
    alert('Посилання на наказ скопійовано.')
  }

  render() {
    const {is_orders_admin, employees, emp_seats, types, order} = ordersStore;
    const {loading, error404, request_sent, edms_doc_opened, company} = this.state;

    return (
      <Choose>
        <When condition={error404}>
          <div className='row'>Наказу під таким номером не існує.</div>
        </When>
        <When condition={!loading}>
          <button className='btn btn-info css_sticky_back_button' onClick={() => this.closeOrderView()}>
            Назад
          </button>

          <div className='shadow-lg p-3 mb-5 bg-white rounded'>
            <div className='d-flex flex-row'>
              {order.done ? (
                <h1 className='text-success mr-2 align-self-end'>
                  <FontAwesomeIcon icon={faCheckCircle} />
                </h1>
              ) : (
                <h1 className='text-danger mr-2 align-self-end'>
                  <FontAwesomeIcon icon={faCircle} />
                </h1>
              )}

              <SelectorWithFilter
                classes='flex-fill'
                fieldName='Тип документа'
                list={types}
                onChange={(e) => this.onSelectorChange(e, 'type', 'type_name')}
                value={{name: order.type_name, id: order.type}}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                disabled={false}
              />

              <div className='ml-2'>
                <TextInput
                  text={order.code}
                  fieldName={'№'}
                  onChange={(e) => this.onInputChange(e, 'code')}
                  maxLength={100}
                  disabled={!is_orders_admin}
                />
              </div>

              {/*<PrintOrder openPDFModal={this.openPDFModal} />*/}
            </div>

            <small onClick={this.onHrefClick}>Посилання: http://plhk.com.ua/docs/orders/{order.id}</small>

            <hr />
            <CompanyChoose fieldName='Підприємство' onChange={this.onCompanyChange} company={company} id='company' />

            <hr />
            <TextInput
              text={order.name}
              fieldName={'Назва'}
              onChange={(e) => this.onInputChange(e, 'name')}
              maxLength={500}
              disabled={!is_orders_admin}
            />

            <hr />
            <TextInput
              text={order.preamble}
              fieldName={'Преамбула'}
              onChange={(e) => this.onInputChange(e, 'preamble')}
              maxLength={5000}
              disabled={!is_orders_admin}
            />

            <Articles disabled={!is_orders_admin} articles={order.articles} changeArticles={this.onArticlesChange} emp_seats={emp_seats} />

            <If condition={order?.files_old?.length || is_orders_admin}>
              <hr />
              <Files
                oldFiles={order.files_old}
                newFiles={order.files}
                fieldName={'Файли'}
                onChange={(e) => this.onInputChange(e, 'files')}
                onDelete={(id) => this.onFilesDelete(id, 'files_old')}
                disabled={!is_orders_admin}
              />
            </If>

            <hr />
            <SelectorWithFilter
              fieldName='Автор'
              list={employees}
              onChange={(e) => this.onSelectorChange(e, 'author', 'author_name')}
              value={{name: order.author_name, id: order.author}}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              disabled={false}
            />

            <If condition={order.responsible_name !== ''}>
              <hr />
              <SelectorWithFilter
                fieldName='Відповідальний'
                list={employees}
                onChange={(e) => this.onSelectorChange(e, 'responsible', 'responsible_name')}
                value={{name: order.responsible_name, id: order.responsible}}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                disabled={false}
              />
            </If>
            <hr />
            <SelectorWithFilter
              fieldName='Контроль'
              list={employees}
              onChange={(e) => this.onSelectorChange(e, 'supervisory', 'supervisory_name')}
              value={{name: order.supervisory_name, id: order.supervisory}}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              disabled={false}
            />
            <hr />
            <div className='row'>
              <div className='col-md-3'>
                <DateInput
                  date={order.date_start}
                  fieldName={'Діє з'}
                  onChange={(e) => this.onInputChange(e, 'date_start')}
                  disabled={!is_orders_admin}
                />
              </div>
              <div className='col-md-3'>
                <DateInput
                  date={order.date_canceled}
                  fieldName={'Діє до'}
                  onChange={(e) => this.onInputChange(e, 'date_canceled')}
                  disabled={!is_orders_admin}
                />
              </div>
            </div>
            <If condition={order.canceled_by_id && order.canceled_by_id !== '0'}>
              <hr />
              <div className='row'>
                <div className='col-12 d-flex mt-2'>
                  <label className='text-nowrap mr-1' htmlFor='canceled_by'>
                    Скасовано документом: {order.canceled_by_code}.
                  </label>
                  <div>
                    <a href={this.getCanceledByDocId()} target='_blank'>
                      Перейти до документу, що скасував дію даного
                    </a>
                  </div>
                </div>
              </div>
            </If>
            <If condition={order.edms_doc_id}>
              <hr />
              <div>Документ в системі електронного документообігу: № {order.edms_doc_id}</div>
              <button className='btn btn-outline-info' onClick={() => this.setState({edms_doc_opened: true})}>
                Показати
              </button>
            </If>
            <hr />
            <div className='d-flex'>
              <input id='cancels' onChange={this.onCancelsChange} type='checkbox' checked={order.cancels_other_doc} disabled={true} />
              {/*TODO Щоб розблокувати цю опцію при пажинованій сторінці, треба вивести її в окремий компонент, який буде отримувати */}
              {/*TODO  з серверу список наказів для обрання. Бо при пажинації того списку фактично у нас нема.*/}
              <label htmlFor='cancels' className='ml-1'>
                Скасовує дію іншого документу
              </label>
            </div>
            <If condition={order.cancels_other_doc}>
              <Selector
                list={orders}
                selectedName={order.cancels_code}
                fieldName={'Скасовує дію документу'}
                onChange={(e) => this.onSelectorChange(e, 'cancels_id', 'cancels_code')}
                disabled={!is_orders_admin}
              />

              <If condition={order?.cancels_id !== '0'}>
                <a className='col-lg-12 d-flex align-items-center' href={this.getCanceledDocId()} target='_blank'>
                  Перейти до скасованого документу
                </a>
              </If>

              <If condition={!order.cancels_id || order.cancels_id === '0'}>
                <hr />
                <div className='row'>
                  <div className='col-lg-6 d-flex align-items-center'>
                    <TextInput
                      text={order.cancels_code}
                      fieldName={'№ скасованих документів'}
                      onChange={(e) => this.onInputChange(e, 'cancels_code')}
                      maxLength={100}
                      disabled={!is_orders_admin}
                    />
                    <div className='col-lg-6 mt-3 mt-lg-0'>
                      <Files
                        oldFiles={order.cancels_files_old}
                        newFiles={order.cancels_files}
                        fieldName={'Файли скасованих документів'}
                        onChange={(e) => this.onInputChange(e, 'cancels_files')}
                        onDelete={(id) => this.onFilesDelete(id, 'cancels_files_old')}
                        disabled={!is_orders_admin}
                      />
                    </div>
                  </div>
                </div>
                <If condition={is_orders_admin}>
                  <small className='text-danger'>Ці поля заповнюються в разі відсутності скасованого документу в системі.</small>
                </If>
              </If>
            </If>

            <If condition={is_orders_admin}>
              <hr />
              <div className='d-flex flex-row'>
                <TextInput
                  text={order.sign_seat}
                  fieldName={'Посада підписуючого наказ'}
                  onChange={(e) => this.onInputChange(e, 'sign_seat')}
                  maxLength={100}
                  disabled={!is_orders_admin}
                />

                <TextInput
                  className='mx-2'
                  text={order.sign_employee}
                  fieldName={'П.І.Б. підписуючого наказ'}
                  onChange={(e) => this.onInputChange(e, 'sign_employee')}
                  maxLength={100}
                  disabled={!is_orders_admin}
                />

                <PrintOrder openPDFModal={this.openPDFModal} disabled={!order.sign_seat || !order.sign_employee} />
              </div>
            </If>

            <hr />
            <If condition={is_orders_admin}>
              <OrderMail />
            </If>
            <SubmitButton className='btn-info' text='Зберегти' onClick={this.postOrder} requestSent={request_sent} />
            <If condition={order.id && is_orders_admin}>
              <SubmitButton className='float-sm-right btn-danger' text='Видалити' onClick={this.deactivateOrder} />
            </If>
            <Modal
              open={edms_doc_opened}
              onClose={() => this.setState({edms_doc_opened: false})}
              showCloseIcon={true}
              closeOnOverlayClick={true}
              styles={{modal: {marginTop: 75}}}
            >
              <Document doc_id={order.edms_doc_id} closed={true} />
            </Modal>
            {/*Вспливаюче повідомлення*/}
            <ToastContainer />
          </div>
        </When>
        <Otherwise>
          <Loader />
        </Otherwise>
      </Choose>
    );
  }
}

export default view(Order);
