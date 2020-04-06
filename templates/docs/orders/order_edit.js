'use strict';
import React from 'react';
import FilesUpload from 'templates/components/files_upload';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Modal from 'react-responsive-modal';
import {Document, Page} from 'react-pdf';
import {getItemById} from 'templates/components/my_extras';
import OrderMail from 'templates/docs/orders/order_mail';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

const required_fields = {
  type_id: 'Тип документу',
  code: '№',
  name: 'Назва',
  files: 'Файли',
  author_id: 'Автор',
  responsible_id: 'Відповідальний',
  supervisory_id: 'Контролююча особа',
  date_start: 'Діє з'
};

class Order extends React.Component {
  state = {
    order: {
      type_id: 0,
      type_name: '',
      code: '',
      name: '',
      files: [],
      old_files: [],
      author_id: '0',
      author_name: '',
      responsible_id: '0',
      responsible_name: '',
      supervisory_id: '0',
      supervisory_name: '',
      date_start: '',
      date_canceled: '',
      canceled_by_code: '',
      canceled_by_id: '0',
      cancels_code: '',
      cancels_files: '',
      cancels_id: '0',
      id: 0
    },
    old_files_to_delete: [],
    edit_mode: this.props.editMode, // При false редагувати документ не можна
    employee_list: window.employee_list ? window.employee_list : [],
    types_list: window.types_list ? window.types_list : [],
    mail_mode: 'to_default',
    mail_list: [],
    pdf_modal_open: false,
    pdf_view_address: '',
    pdf_num_pages: null,
    page_number: 1,
    data_received: false
  };

  componentDidMount() {
    // при зміні ід документа (клік на інший документ) - запит інфи про документ з бд
    if (this.props.id) {
      this.getOrder(this.props.id);
    } else {
      this.setState({
        data_received: true
      });
    }
  }

  getOrder = (id) => {
    axios({
      method: 'get',
      url: 'get_order/' + id + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        // console.log(response.data);
        // Отримуємо інформацію щодо конкретних видів документів
        this.setState({
          order: response.data,
          data_received: true
        });
      })
      .catch((error) => {
        console.log(error);
      });
    // return 0;
  };

  testForBlankOrZero = (item) => {
    return item == null || item === 0 || item === '0' || item.length === 0;
  };

  isAllFieldsFilled = () => {
    const {order} = this.state;
    const keys = Object.keys(order);
    for (const key of keys) {
      if (required_fields.hasOwnProperty(key)) {
        if (this.testForBlankOrZero(order[key])) {
          if (key === 'files') {
            const old_files = this.state.order.old_files.filter(
              (file) => file.is_added_or_cancelled
            );
            if (!old_files.length) {
              this.notify('Заповніть, будь ласка поле "' + required_fields[key] + '"');
              return false;
            }
          } else {
            this.notify('Заповніть, будь ласка поле "' + required_fields[key] + '"');
            return false;
          }
        }
      }
    }
    return true;
  };

  postOrder = (e) => {
    e.preventDefault();

    if (this.isAllFieldsFilled()) {
      try {
        const {
          id,
          type_id,
          type_name,
          code,
          name,
          author_id,
          responsible_id,
          supervisory_id,
          date_start,
          date_canceled,
          canceled_by_id,
          cancels_id,
          cancels_code,
          files,
          old_files,
          cancels_files
        } = this.state.order;
        const {old_files_to_delete, mail_mode, mail_list} = this.state;

        let formData = new FormData();
        formData.append('doc_type', type_id);
        formData.append('type_name', type_name);
        formData.append('id', id);
        formData.append('code', code);
        formData.append('name', name);
        formData.append('author', author_id);
        formData.append('responsible', responsible_id);
        formData.append('supervisory', supervisory_id);
        formData.append('date_start', date_start);
        formData.append('date_canceled', date_canceled);
        formData.append('cancels', cancels_id !== '0' ? cancels_id : '');
        formData.append('canceled_by_id', canceled_by_id !== '0' ? canceled_by_id : '');
        formData.append('cancels_code', cancels_code);
        formData.append('old_files', JSON.stringify(old_files));
        formData.append('old_files_to_delete', JSON.stringify(old_files_to_delete));
        formData.append('mail_mode', mail_mode);
        formData.append('mail_list', JSON.stringify(mail_list));

        if (files && files.length > 0) {
          files.map((file) => {
            formData.append('files', file);
          });
        }

        if (cancels_files && cancels_files.length > 0) {
          cancels_files.map((file) => {
            formData.append('cancels_files', file);
          });
        }

        axios({
          method: 'post',
          url: id === 0 ? 'new_order/' : 'edit_order/',
          data: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .then((response) => {
            // location.reload();
            this.props.close('add', this.state.order, response.data);
          })
          .catch((error) => {
            console.log('error: ' + error);
          });

        // this.props.close(this.state.order);
      } catch (e) {
        this.notify(e);
      }
    }
  };

  deactivateOrder = (e) => {
    e.preventDefault();

    try {
      const {id} = this.state.order;

      let formData = new FormData();
      formData.append('id', id);

      axios({
        method: 'post',
        url: 'deactivate_order/',
        data: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then((response) => {
          // location.reload();
          this.props.close('deactivate', this.state.order, id);
        })
        .catch((error) => {
          console.log('error: ' + error);
        });
    } catch (e) {
      this.notify(e);
    }
  };

  onNameChange = (event) => {
    const {order} = this.state;
    order.name = event.target.value;

    this.setState({
      order
    });
  };

  onCodeChange = (event) => {
    const {order} = this.state;
    order.code = event.target.value;

    this.setState({
      order
    });
  };

  onAuthorChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    const {order} = this.state;
    order.author_id = event.target.options[selectedIndex].getAttribute('data-key');
    order.author_name = event.target.options[selectedIndex].getAttribute('value');
    this.setState({
      order
    });
  };

  onResponsibleChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    const {order} = this.state;
    order.responsible_id = event.target.options[selectedIndex].getAttribute('data-key');
    order.responsible_name = event.target.options[selectedIndex].getAttribute('value');

    this.setState({
      order
    });
  };

  onSupervisoryChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    const {order} = this.state;
    order.supervisory_id = event.target.options[selectedIndex].getAttribute('data-key');
    order.supervisory_name = event.target.options[selectedIndex].getAttribute('value');

    this.setState({
      order
    });
  };

  onTypeChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    const {order} = this.state;
    order.type_id = event.target.options[selectedIndex].getAttribute('data-key');
    order.type_name = event.target.options[selectedIndex].getAttribute('value');

    this.setState({
      order
    });
  };

  onFilesChange = (event) => {
    const {order} = this.state;
    order.files = event.target.value;

    this.setState({
      order
    });
  };

  onCancelsFilesChange = (event) => {
    const {order} = this.state;
    order.cancels_files = event.target.value;

    this.setState({
      order
    });
  };

  onDateStartChange = (event) => {
    const {order} = this.state;
    order.date_start = event.target.value;

    this.setState({
      order
    });
  };

  onDateCanceledChange = (event) => {
    const {order} = this.state;
    order.date_canceled = event.target.value;

    this.setState({
      order
    });
  };

  onCanceledByChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    const {order} = this.state;
    order.canceled_by_id = event.target.options[selectedIndex].getAttribute('data-key');
    order.canceled_by_code = event.target.options[selectedIndex].getAttribute('value');

    this.setState({
      order
    });
  };

  onCancelsChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    const {order} = this.state;
    order.cancels_id = event.target.options[selectedIndex].getAttribute('data-key');
    order.cancels_code = event.target.options[selectedIndex].getAttribute('value');

    this.setState({
      order
    });
  };

  onCancelsCodeChange = (event) => {
    const {order} = this.state;
    order.cancels_code = event.target.value;

    this.setState({
      order
    });
  };

  getCanceledDocId = () => {
    return './' + this.state.order.cancels_id;
  };

  getCanceledByDocId = () => {
    return './' + this.state.order.canceled_by_id;
  };

  deleteFile = (e, id) => {
    e.preventDefault();
    let {order, old_files_to_delete} = this.state;
    const old_files = order.old_files.filter((file) => file.id !== id);
    order.old_files = old_files;
    old_files_to_delete.push(id);
    this.setState({order, old_files_to_delete});
  };

  addedFilesList = () => {
    return (
      <For each='file' index='id' of={this.state.order.old_files}>
        <If condition={file.is_added_or_cancelled}>
          <div key={file.id}>
            <a href={'../../media/' + file.file} target='_blank'>
              {file.name}{' '}
            </a>
            <If condition={this.state.edit_mode}>
              <button
                className='btn btn-sm btn-link text-danger '
                onClick={(e) => this.deleteFile(e, file.id)}
              >
                <span aria-hidden='true'>&times;</span>
              </button>
            </If>
          </div>
        </If>
      </For>
    );
  };

  canceledFilesList = () => {
    return (
      <For each='file' index='id' of={this.state.order.old_files}>
        <If condition={!file.is_added_or_cancelled}>
          <div key={file.id}>
            <a href={'../../media/' + file.file} download={file.name}>
              {file.name}{' '}
            </a>
            <button
              className='btn btn-sm btn-link text-danger '
              onClick={(e) => this.deleteFile(e, file.id)}
            >
              <span aria-hidden='true'>&times;</span>
            </button>
          </div>
        </If>
      </For>
    );
  };

  changeMailMode = (mail_mode) => {
    this.setState({
      mail_mode
    });
  };

  changeMailList = (mail_list) => {
    this.setState({
      mail_list
    });
  };

  getNoMailWarning = (field_id) => {
    const employee = getItemById(this.state.order[field_id], window.employee_list);
    if (!employee.mail && this.state.order[field_id] !== '0') {
      return (
        <small className='text-danger'>
          За даним співробітником не закріплена електронна пошта. Особисто йому лист-повідомлення
          про публікацію документа відправлено не буде. Зверніться до адміністратора
        </small>
      );
    } else return null;
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

  openPdf = (e, file) => {
    e.preventDefault();

    this.setState({
      pdf_view_address: file,
      pdf_modal_open: true
    });
  };

  pdfModalClose = () => {
    this.setState({
      pdf_modal_open: false
    });
  };

  onDocumentLoadSuccess = ({numPages}) => {
    this.setState({
      pdf_num_pages: numPages
    });
  };

  render() {
    const {
      id,
      name,
      code,
      author_name,
      files,
      old_files,
      cancels_files,
      old_cancels_files,
      responsible_name,
      supervisory_name,
      date_start,
      date_canceled,
      canceled_by_code,
      canceled_by_id,
      cancels_code,
      cancels_id,
      type_name
    } = this.state.order;
    const {
      edit_mode,
      employee_list,
      types_list,
      data_received,
      pdf_modal_open,
      pdf_view_address,
      pdf_num_pages,
      page_number
    } = this.state;

    if (data_received) {
      return (
        <>
          <div className='shadow-lg p-3 mb-5 bg-white rounded'>
            <h3 className='d-flex'>
              <select
                className='form-control mr-1'
                id='type'
                name='type'
                value={type_name}
                onChange={this.onTypeChange}
                disabled={!edit_mode}
              >
                <option key={0} data-key={0} value='0'>
                  ------------
                </option>
                {types_list.map((type) => {
                  return (
                    <option key={type.id} data-key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  );
                })}
              </select>
              <span>№</span>
              <input
                className='w-25 ml-1'
                onChange={this.onCodeChange}
                value={code}
                readOnly={!edit_mode}
              />
            </h3>
            <hr />
            <div className='d-flex align-items-center mt-1'>
              <label className='flex-grow-1 text-nowrap mr-1' htmlFor={'name'}>
                Назва:
              </label>
              <textarea
                className='form-control'
                name='name'
                id={'name'}
                value={name}
                onChange={this.onNameChange}
                maxLength={500}
                readOnly={!edit_mode}
              />
            </div>
            <hr />

            <div>Файли: </div>
            {this.addedFilesList()}

            <FilesUpload
              onChange={this.onFilesChange}
              oldFiles={old_files}
              files={files}
              fieldName={''}
              editable={edit_mode}
            />
            <hr />

            <div className='row align-items-center mt-1 mr-lg-1'>
              <label className='col-lg-1' htmlFor='author'>
                Автор:
              </label>
              <select
                className='col-lg-11 form-control mx-3 mx-lg-0'
                id='author'
                name='author'
                value={author_name}
                onChange={this.onAuthorChange}
                disabled={!edit_mode}
              >
                <option key={0} data-key={0} value='0'>
                  ------------
                </option>
                {employee_list.map((emp) => {
                  return (
                    <option key={emp.id} data-key={emp.id} value={emp.name}>
                      {emp.name}
                    </option>
                  );
                })}
              </select>
            </div>
            {this.getNoMailWarning('author_id')}
            <hr />

            <div className='row mt-1 mr-lg-1'>
              <label className='col-lg-2' htmlFor='responsible'>
                Відповідальний:
              </label>
              <select
                className='col-lg-10 form-control mx-3 mx-lg-0'
                id='responsible'
                name='responsible'
                value={responsible_name}
                onChange={this.onResponsibleChange}
                disabled={!edit_mode}
              >
                <option key={0} data-key={0} value='0'>
                  ------------
                </option>
                {employee_list.map((emp) => {
                  return (
                    <option key={emp.id} data-key={emp.id} value={emp.name}>
                      {emp.name}
                    </option>
                  );
                })}
              </select>
            </div>
            {this.getNoMailWarning('responsible_id')}
            <hr />

            <div className='row mt-1 mr-lg-1'>
              <label className='col-lg-2' htmlFor='supervisory'>
                Контроль:
              </label>
              <select
                className='col-lg-10 form-control mx-3 mx-lg-0'
                id='supervisory'
                name='supervisory'
                value={supervisory_name}
                onChange={this.onSupervisoryChange}
                disabled={!edit_mode}
              >
                <option key={0} data-key={0} value='0'>
                  ------------
                </option>
                {employee_list.map((emp) => {
                  return (
                    <option key={emp.id} data-key={emp.id} value={emp.name}>
                      {emp.name}
                    </option>
                  );
                })}
              </select>
            </div>
            {this.getNoMailWarning('supervisory_id')}
            <hr />

            <div className='row mt-2'>
              <div className='col-sm-6 d-flex align-items-center mt-1'>
                <label className='flex-grow-1 text-nowrap mr-1' htmlFor='date_start'>
                  Діє з:
                </label>
                <input
                  className='form-control'
                  id='date_start'
                  name='date_start'
                  type='date'
                  value={date_start}
                  onChange={this.onDateStartChange}
                  disabled={!edit_mode}
                />
              </div>
              <div className='col-sm-6 d-flex align-items-center mt-1'>
                <label className='flex-grow-1 text-nowrap mr-1' htmlFor='date_canceled'>
                  Діє до:
                </label>
                <input
                  className='form-control'
                  id='date_canceled'
                  name='date_canceled'
                  type='date'
                  value={date_canceled}
                  onChange={this.onDateCanceledChange}
                  disabled={!edit_mode}
                />
              </div>
            </div>
            <If condition={canceled_by_id && canceled_by_id !== '0'}>
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

            <div className='row mt-1 mr-lg-1'>
              <label className='col-lg-4' htmlFor='cancels'>
                Скасовує дію документу:
              </label>
              <select
                className='col-lg-8 form-control mx-3 mx-lg-0'
                id='cancels'
                name='cancels'
                value={cancels_code}
                onChange={this.onCancelsChange}
                disabled={!edit_mode}
              >
                <option key={0} data-key={0} value='0'>
                  ------------
                </option>
                {window.orders_list.map((order) => {
                  if (order.id !== id) {
                    return (
                      <option key={order.id} data-key={order.id} value={order.code}>
                        {order.code + ' "' + order.name + '"'}
                      </option>
                    );
                  }
                })}
              </select>

              <If condition={cancels_id && cancels_id !== '0'}>
                <div>
                  <a
                    className='col-lg-12 d-flex align-items-center'
                    href={this.getCanceledDocId()}
                    target='_blank'
                  >
                    Перейти до скасованого документу
                  </a>
                </div>
              </If>
            </div>

            <If condition={!cancels_id || cancels_id === '0'}>
              <hr />
              <div className='row'>
                <div className='col-lg-6 d-flex align-items-center'>
                  <label className='flex-grow-1 text-nowrap mr-1' htmlFor='cancels_code'>
                    № скасованих документів:
                  </label>
                  <input
                    className='form-control'
                    id='cancels_code'
                    name='cancels_code'
                    value={cancels_code}
                    onChange={this.onCancelsCodeChange}
                    disabled={!edit_mode}
                  />
                </div>
                <div className='col-lg-6 mt-3 mt-lg-0'>
                  Файли скасованих документів:
                  {this.canceledFilesList()}
                  <FilesUpload
                    onChange={this.onCancelsFilesChange}
                    oldFiles={old_cancels_files}
                    files={cancels_files}
                    fieldName={''}
                    editable={edit_mode}
                  />
                </div>
              </div>
              <If condition={edit_mode}>
                <small className='text-danger'>
                  Ці поля заповнюються в разі відсутності скасованого документу в системі.
                </small>
              </If>
              <hr />
            </If>
            <hr />

            <If condition={edit_mode}>
              <OrderMail mailMode={this.changeMailMode} mailList={this.changeMailList} />
            </If>

            <button className='btn btn-success my-2' onClick={this.postOrder}>
              Зберегти
            </button>
            <If condition={id}>
              <button className='float-sm-right btn btn-danger my-2' onClick={this.deactivateOrder}>
                Видалити
              </button>
            </If>

            {/*Вспливаюче повідомлення*/}
            <ToastContainer />
          </div>
          <Modal open={pdf_modal_open} onClose={this.pdfModalClose} center>
            <Document file={pdf_view_address} onLoadSuccess={this.onDocumentLoadSuccess}>
              <Page pageNumber={page_number} />
            </Document>
            <p>
              Page {page_number} of {pdf_num_pages}
            </p>
          </Modal>
        </>
      );
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
    id: 0,
    editMode: false,
    changeRow: {}
  };
}

export default Order;
