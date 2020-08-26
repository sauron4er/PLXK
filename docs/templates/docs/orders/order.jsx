'use strict';
import React from 'react';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Modal from 'react-responsive-modal';
import {Document, Page} from 'react-pdf';
import {getIndex, isBlankOrZero, notify} from 'templates/components/my_extras';
import OrderMail from 'docs/templates/docs/orders/order_mail';
import {Loader} from 'templates/components/loaders';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import ordersStore from 'docs/templates/docs/orders/orders_store';
import Selector from 'templates/components/form_modules/selector';
import TextInput from 'templates/components/form_modules/text_input';
import Files from 'templates/components/form_modules/files';
import DateInput from 'templates/components/form_modules/date_input';
import Articles from 'docs/templates/docs/orders/order_articles';

class Order extends React.Component {
  state = {
    mail_mode: 'to_default',
    mail_list: [],
    pdf_modal_open: false,
    pdf_view_address: '',
    pdf_num_pages: null,
    page_number: 1,
    loading: false,
    new_article_area: false
  };

  componentDidMount() {
    this.getOrder();
    this.setState({loading: true});
  }

  isAllFieldsFilled = () => {
    if (isBlankOrZero(ordersStore.order.type)) {
      notify('Заповніть поле "Тип документу"');
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
    // if (isBlankOrZero(contractsStore.contract.new_files) && isBlankOrZero(contractsStore.contract.old_files)) {
    if (isBlankOrZero(ordersStore.order.files)) {
      notify('Додайте файл документу');
      return false;
    }
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

  getOrder = () => {
    axiosGetRequest('get_order/' + ordersStore.order.id + '/')
      .then((response) => {
        if (ordersStore.order.id !== 0) ordersStore.order = response.order;
        ordersStore.deps = response.deps
        console.log(response.deps);
        this.setState({loading: false});
      })
      .catch((error) => notify(error));
  };

  postOrder = () => {
    if (this.isAllFieldsFilled() && this.areDatesInOrder()) {
      const {
        id,
        type,
        type_name,
        code,
        name,
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
      formData.append('doc_type', type);
      formData.append('type_name', type_name);
      formData.append('id', id);
      formData.append('code', code);
      formData.append('name', name);
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
      formData.append('mail_mode', mail_mode);
      formData.append('mail_list', JSON.stringify(mail_list));

      if (files && files.length > 0) files.map((file) => formData.append('files', file));
      if (cancels_files && cancels_files.length > 0) cancels_files.map((file) => formData.append('cancels_files', file));

      const url = ordersStore.order.id === 0 ? 'add_order/' : 'edit_order/';

      axiosPostRequest(url, formData)
        .then((response) => (ordersStore.order.id === 0 ? this.addOrder(response) : this.editOrder(response)))
        .catch((error) => notify(error));
    }
  };

  deactivateOrder = () => {
    axiosPostRequest('deactivate_order/' + ordersStore.order.id + '/')
      .then((response) => this.removeOrder(response))
      .catch((error) => notify(error));
  };

  addOrder = (id) => {
    ordersStore.order.id = id;
    ordersStore.orders.push(ordersStore.order);
    this.closeOrderView();
  };

  editOrder = (id) => {
    const index = getIndex(id, ordersStore.orders);
    ordersStore.orders[index] = ordersStore.order;
    this.closeOrderView();
  };

  removeOrder = (id) => {
    ordersStore.orders = ordersStore.orders.filter((order) => order.id !== id);
    this.closeOrderView();
  };

  closeOrderView = () => {
    ordersStore.clearOrder();
    ordersStore.view = 'table';
  };

  onSelectorChange = (e, field_id_name, field_name_name) => {
    const selectedIndex = e.target.options.selectedIndex;
    ordersStore.order[field_id_name] = e.target.options[selectedIndex].getAttribute('data-key');
    ordersStore.order[field_name_name] = e.target.options[selectedIndex].getAttribute('value');
  };

  onInputChange = (e, field_name) => {
    ordersStore.order[field_name] = e.target.value;
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

  getCanceledDocId = () => {
    return './' + ordersStore.order.cancels_id;
  };

  getCanceledByDocId = () => {
    return './' + ordersStore.order.canceled_by_id;
  };
  
  newArticle = () => {
  
  };

  // openPdf = (e, file) => {
  //   e.preventDefault();
  //
  //   this.setState({
  //     pdf_view_address: file,
  //     pdf_modal_open: true
  //   });
  // };
  //
  // pdfModalClose = () => {
  //   this.setState({pdf_modal_open: false});
  // };
  //
  // onDocumentLoadSuccess = ({numPages}) => {
  //   this.setState({pdf_num_pages: numPages});
  // };

  render() {
    const {id, canceled_by_code, canceled_by_id, cancels_id} = ordersStore.order;
    const {is_orders_admin, employees, types} = ordersStore;
    const {loading, pdf_modal_open, pdf_view_address, pdf_num_pages, page_number} = this.state;

    return (
      <Choose>
        <When condition={!loading}>
          <div className='shadow-lg p-3 mb-5 bg-white rounded'>
            <div className='row'>
              <div className='col-md-10'>
                <Selector
                  className='mr-2'
                  list={types}
                  selectedName={ordersStore.order.type_name}
                  fieldName={'Тип документа'}
                  onChange={(e) => this.onSelectorChange(e, 'type', 'type_name')}
                  disabled={!is_orders_admin}
                />
              </div>
              <div className='col-md-2'>
                <TextInput
                  text={ordersStore.order.code}
                  fieldName={'№'}
                  onChange={(e) => this.onInputChange(e, 'code')}
                  maxLength={100}
                  disabled={!is_orders_admin}
                />
              </div>
            </div>

            <hr />
            <TextInput
              text={ordersStore.order.name}
              fieldName={'Назва'}
              onChange={(e) => this.onInputChange(e, 'name')}
              maxLength={500}
              disabled={!is_orders_admin}
            />
            
            <hr/>
            {/*<Articles />*/}

            <hr />
            <Files
              oldFiles={ordersStore.order.files_old}
              newFiles={ordersStore.order.files}
              fieldName={'Файли'}
              onChange={(e) => this.onInputChange(e, 'files')}
              onDelete={(id) => this.onFilesDelete(id, 'files_old')}
              disabled={!is_orders_admin}
            />

            <hr />
            <Selector
              list={employees}
              selectedName={ordersStore.order.author_name}
              fieldName={'Автор'}
              onChange={(e) => this.onSelectorChange(e, 'author', 'author_name')}
              disabled={!is_orders_admin}
            />

            <hr />
            <Selector
              list={employees}
              selectedName={ordersStore.order.responsible_name}
              fieldName={'Відповідальний'}
              onChange={(e) => this.onSelectorChange(e, 'responsible', 'responsible_name')}
              disabled={!is_orders_admin}
            />

            <hr />
            <Selector
              list={employees}
              selectedName={ordersStore.order.supervisory_name}
              fieldName={'Контроль'}
              onChange={(e) => this.onSelectorChange(e, 'supervisory', 'supervisory_name')}
              disabled={!is_orders_admin}
            />

            <hr />
            <div className='row'>
              <div className='col-md-3'>
                <DateInput
                  date={ordersStore.order.date_start}
                  fieldName={'Діє з'}
                  onChange={(e) => this.onInputChange(e, 'date_start')}
                  disabled={!is_orders_admin}
                />
              </div>
              <div className='col-md-3'>
                <DateInput
                  date={ordersStore.order.date_canceled}
                  fieldName={'Діє до'}
                  onChange={(e) => this.onInputChange(e, 'date_canceled')}
                  disabled={!is_orders_admin}
                />
              </div>
            </div>

            <If condition={canceled_by_id && canceled_by_id !== '0'}>
              <hr />
              <div className='row'>
                <div className='col-12 d-flex mt-2'>
                  <label className='text-nowrap mr-1' htmlFor='canceled_by'>
                    Скасовано документом: {canceled_by_code}.
                  </label>
                  <div>
                    <a href={this.getCanceledByDocId()} target='_blank'>
                      Перейти до документу, що скасував дію даного
                    </a>
                  </div>
                </div>
              </div>
            </If>

            <hr />
            <Selector
              list={orders}
              selectedName={ordersStore.order.cancels_code}
              fieldName={'Скасовує дію документу'}
              onChange={(e) => this.onSelectorChange(e, 'cancels_id', 'cancels_code')}
              disabled={!is_orders_admin}
            />

            <If condition={cancels_id && cancels_id !== '0'}>
              <a className='col-lg-12 d-flex align-items-center' href={this.getCanceledDocId()} target='_blank'>
                Перейти до скасованого документу
              </a>
            </If>

            <If condition={!cancels_id || cancels_id === '0'}>
              <hr />
              <div className='row'>
                <div className='col-lg-6 d-flex align-items-center'>
                  <TextInput
                    text={ordersStore.order.cancels_code}
                    fieldName={'№ скасованих документів'}
                    onChange={(e) => this.onInputChange(e, 'cancels_code')}
                    maxLength={100}
                    disabled={!is_orders_admin}
                  />
                  <div className='col-lg-6 mt-3 mt-lg-0'>
                    <Files
                      oldFiles={ordersStore.order.cancels_files_old}
                      newFiles={ordersStore.order.cancels_files}
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

            <hr />
            <If condition={is_orders_admin}>
              <OrderMail />
            </If>

            <button className='btn btn-success my-2' onClick={this.postOrder}>
              Зберегти
            </button>
            <If condition={id && is_orders_admin}>
              <button className='float-sm-right btn btn-danger my-2' onClick={this.deactivateOrder}>
                Видалити
              </button>
            </If>

            {/*Вспливаюче повідомлення*/}
            <ToastContainer />
          </div>
          {/*<Modal open={pdf_modal_open} onClose={this.pdfModalClose} center>*/}
          {/*  <Document file={pdf_view_address} onLoadSuccess={this.onDocumentLoadSuccess}>*/}
          {/*    <Page pageNumber={page_number} />*/}
          {/*  </Document>*/}
          {/*  <p>*/}
          {/*    Page {page_number} of {pdf_num_pages}*/}
          {/*  </p>*/}
          {/*</Modal>*/}
        </When>
        <Otherwise>
          <Loader />
        </Otherwise>
      </Choose>
    );
  }
}

export default view(Order);
