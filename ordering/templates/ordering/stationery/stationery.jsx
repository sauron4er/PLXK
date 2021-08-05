'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit, faCheckDouble, faBackward, faForward, faPrint} from '@fortawesome/free-solid-svg-icons';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {getIndex, notify} from 'templates/components/my_extras';
import SelectorWithFilter from 'templates/components/form_modules/selector_with_filter';
import TextInput from 'templates/components/form_modules/text_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import DxTable from 'templates/components/tables/dx_table';
import ReactToPrint from 'react-to-print';
import Modal from 'react-responsive-modal';
import SummaryPrint from 'ordering/templates/ordering/stationery/summary_print';
import { LoaderSmall } from "templates/components/loaders";

const months = [
  '',
  'січень',
  'лютий',
  'березень',
  'квітень',
  'травень',
  'червень',
  'липень',
  'серпень',
  'вересень',
  'жовтень',
  'листопад',
  'грудень'
];

class Stationery extends React.Component {
  state = {
    view_month: {year: 0, month: 0, month_name: ''},
    stationery_types: [],
    orders: [],
    chosen_stationery_type: 0,
    chosen_stationery_name: '',
    chosen_quantity: '',
    editable: true,
    view: 'order', //, summary
    summary: [],
    modal_open: false,
    clicked_row: {}
  };

  componentDidMount() {
    this.setState({view_month: this.getOrderDate()}, () => {
      this.getOrders();
    });
  }

  getOrders = () => {
    const {view_month} = this.state;

    axiosGetRequest('get_orders/' + view_month.month + '/' + view_month.year + '/')
      .then((response) => {
        this.setState({orders: response}, () => {
          this.setState({stationery_types: this.filterStationeryTypes()});
          const editable_month = this.getOrderDate();
          this.setState({editable: view_month.month === editable_month.month});
        });
      })
      .catch((error) => notify(error));
  };

  getOrderDate = () => {
    const today = new Date();
    let month = 0;

    month = today.getDate() > 10 ? today.getMonth() + 3 : today.getMonth() + 2; // Нумерація місяців тут починається з 0, а нам треба з 1
    month > 12 ? (month = month - 12) : null;

    const month_name = months[month];
    const year = today.getFullYear();

    return {month: month, month_name: month_name, year: year};
  };

  filterStationeryTypes = () => {
    const ordered_types = this.state.orders.map((order) => order.stationery_type_id);
    return window.stationery_types.filter((type) => !ordered_types.includes(type.id));
  };

  newOrder = () => {
    const {chosen_stationery_type, chosen_quantity, view_month} = this.state;
    let formData = new FormData();
    formData.append('stationery_type', chosen_stationery_type);
    formData.append('quantity', chosen_quantity);
    formData.append('month', view_month.month);
    formData.append('year', view_month.year);

    axiosPostRequest('new_order', formData)
      .then((response) => {
        this.setState({orders: response}, () => {
          this.setState({
            chosen_quantity: '',
            chosen_stationery_type: 0,
            chosen_stationery_name: '',
            stationery_types: this.filterStationeryTypes()
          });
        });
      })
      .catch((error) => notify(error));
  };

  editOrder = (index) => {
    const {orders, view_month} = this.state;
    let formData = new FormData();
    formData.append('order_id', orders[index].id);
    formData.append('quantity', orders[index].quantity);
    formData.append('month', view_month.month);
    formData.append('year', view_month.year);

    axiosPostRequest('edit_order', formData)
      .then((response) => {
        this.setState({orders: response}, () => {
          this.showSuccess(orders[index].id);
          this.setState({stationery_types: this.filterStationeryTypes()});
        });
      })
      .catch((error) => notify(error));
  };

  delOrder = (id) => {
    const {view_month} = this.state;
    let formData = new FormData();
    formData.append('order_id', id);
    formData.append('month', view_month.month);
    formData.append('year', view_month.year);

    axiosPostRequest('del_order', formData)
      .then((response) => {
        this.setState({orders: response}, () => {
          this.setState({stationery_types: this.filterStationeryTypes()});
        });
      })
      .catch((error) => notify(error));
  };

  showSuccess = (id) => {
    const orders = [...this.state.orders];
    const index = getIndex(id, orders);

    orders[index].edited = true;
    this.setState({orders});
  };

  orderQuantityChange = (e, index) => {
    const orders = [...this.state.orders];
    orders[index].quantity = e.target.value;
    this.setState({orders});
  };

  onStationeryTypeChange = (e) => {
    this.setState({
      chosen_stationery_type: e.id,
      chosen_stationery_name: e.name
    });
  };

  onQuantityChange = (e) => {
    this.setState({chosen_quantity: e.target.value});
  };

  changeMonth = (type) => {
    this.setState({orders: []}, () => {
      const view_month = {...this.state.view_month};
      if (type === 'backward') {
        view_month.month = view_month.month - 1;
        if (view_month.month === 0) {
          view_month.month = 12;
          view_month.year = view_month.year - 1;
        }
      } else {
        // forward
        view_month.month = view_month.month + 1;
        if (view_month.month === 13) {
          view_month.month = 1;
          view_month.year = view_month.year + 1;
        }
      }
      view_month.month_name = months[view_month.month];
      this.setState({view_month: view_month}, () => {
        this.getOrders();
      });
    });
  };

  getSummary = () => {
    const {view_month} = this.state;
    axiosGetRequest('get_summary/' + view_month.month + '/' + view_month.year + '/')
      .then((response) => {
        this.setState({
          summary: response,
          view: 'summary'
        });
      })
      .catch((error) => notify(error));
  };

  changeViewToOrder = () => {
    this.setState({view: 'order'});
  };

  onCloseModal = () => {
    this.setState({
      modal_open: false
    });
  };

  onRowClick = (row) => {
    this.setState({
      clicked_row: row,
      modal_open: true
    });
  };

  render() {
    const {
      view_month,
      stationery_types,
      orders,
      chosen_stationery_name,
      chosen_stationery_type,
      chosen_quantity,
      editable,
      modal_open,
      view,
      summary,
      clicked_row
    } = this.state;

    return (
      <>
        <Choose>
          <When condition={view === 'order'}>
            <div className='container'>
              <If condition={window.is_admin}>
                <button className='btn btn-sm btn-outline-secondary mt-1' onClick={this.getSummary}>
                  Переглянути зведену таблицю
                </button>
              </If>
              <h5 className='text-center my-3 font-weight-bold'> {department}</h5>

              <div className='d-flex border-bottom border-top p-1'>
                <button className='btn btn-sm btn-outline-secondary col-1' onClick={(e) => this.changeMonth('backward')}>
                  <FontAwesomeIcon icon={faBackward} />
                </button>
                <h5 className='col-10 text-center'>{`Замовлення канцелярії на ${view_month.month_name} ${view_month.year} р.`}</h5>
                <button className='btn btn-sm btn-outline-secondary col-1' onClick={(e) => this.changeMonth('forward')}>
                  <FontAwesomeIcon icon={faForward} />
                </button>
              </div>
              <hr />
              <If condition={orders}>
                <If condition={editable}>
                  <div className='font-weight-bold mb-1'>Додати:</div>
                  <div className='d-flex'>
                    <SelectorWithFilter
                      list={stationery_types}
                      fieldName='Назва'
                      valueField='name'
                      selectedName=''
                      disabled={false}
                      // value={{label: 0, value: ''}}
                      classes='col-lg-9'
                      value={{name: chosen_stationery_name, id: chosen_stationery_type}}
                      onChange={this.onStationeryTypeChange}
                    />

                    <TextInput
                      text={chosen_quantity}
                      fieldName='Кількість'
                      onChange={this.onQuantityChange}
                      maxLength={3}
                      type='default'
                      disabled={false}
                      className='col-lg-2'
                    />
                    <SubmitButton className='col-lg-1 btn-outline-primary' text='Додати' onClick={this.newOrder} />
                  </div>
                </If>
                <hr />

                <h6 className='font-weight-bold mb-1'>
                  Список замовленого на {view_month.month_name} {view_month.year} р.:
                </h6>

                <table className='table table-sm'>
                  <thead className='thead-inverse'>
                    <tr>
                      <th>Назва</th>
                      <th>Кількість</th>
                      <th></th>
                      <th>Одиниця виміру</th>
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each='order' of={orders} index='index'>
                      <tr key={order.id}>
                        <td className='col-md-6'>{order.name}</td>
                        <td className='col-md-2'>
                          <Choose>
                            <When condition={editable}>
                              <div className='input-group'>
                                <input
                                  className='form-control'
                                  name={`${order.id}_quantity`}
                                  value={order.quantity}
                                  type='number'
                                  onChange={(e) => this.orderQuantityChange(e, index)}
                                  maxLength={4}
                                />
                                <span className='input-group-btn'>
                                  <button className='btn btn-sm' onClick={(e) => this.editOrder(index)}>
                                    {order.edited ? (
                                      <FontAwesomeIcon className='text-success' icon={faCheckDouble} />
                                    ) : (
                                      <FontAwesomeIcon icon={faEdit} />
                                    )}
                                  </button>
                                </span>
                              </div>
                            </When>
                            <Otherwise>{order.quantity}</Otherwise>
                          </Choose>
                        </td>
                        <td className='col-md-1'></td>
                        <td className='col-md-2'>{order.measurement}</td>
                        <td className='col-md-1'>
                          <If condition={editable}>
                            <button type='submit' className='close' aria-label='Close' onClick={(e) => this.delOrder(order.id)}>
                              <span aria-hidden='true'>&times;</span>
                            </button>
                          </If>
                        </td>
                      </tr>
                    </For>
                  </tbody>
                </table>
              </If>
            </div>
          </When>
          <Otherwise>
            <button className='btn btn-sm btn-outline-secondary mt-1' onClick={this.changeViewToOrder}>
              Назад
            </button>

            <DxTable
              rows={summary.rows}
              columns={summary.header}
              colWidth={summary.widths}
              onRowClick={this.onRowClick}
              // height={main_div_height}
              filter
              summary
            />
            <Modal
              open={modal_open}
              onClose={this.onCloseModal}
              showCloseIcon={true}
              closeOnOverlayClick={true}
              styles={{modal: {marginTop: 100}}}
            >
              <SummaryPrint summary={clicked_row} month={view_month} header={summary.header} />
            </Modal>
          </Otherwise>
        </Choose>
      </>
    );
  }
}

export default Stationery;
