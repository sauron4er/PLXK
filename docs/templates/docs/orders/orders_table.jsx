'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import {view, store} from '@risingstack/react-easy-state';
import ordersStore from 'docs/templates/docs/orders/orders_store';
import PaginatedTable from 'templates/components/tables/paginated_table';
import Order from './order';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

const columns = [
  // {name: 'id', title: 'id'},
  {name: 'code', title: '№'},
  {name: 'doc_type__name', title: 'Тип'},
  {name: 'name', title: 'Назва'},
  {name: 'author__last_name', title: 'Автор'},
  {name: 'date_start', title: 'Діє з'},
  {name: 'date_canceled', title: 'Діє до'},
  {name: 'status', title: ''}
];

const col_width = [
  // {columnName: 'id', width: 30},
  {columnName: 'doc_type__name', width: 110},
  {columnName: 'code', width: 60},
  {columnName: 'author__last_name', width: 200},
  {columnName: 'date_start', width: 80},
  {columnName: 'date_canceled', width: 80},
  {columnName: 'status', width: 30}
];

class OrdersTable extends React.Component {
  state = {
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    reminders_sent: false
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 105});
    ordersStore.clearOrder();
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  sendReminders = () => {
    axiosGetRequest('reminders/')
      .then((response) => {
        this.setState({reminders_sent: true});
      })
      .catch((error) => notify(error));
  };

  onRowClick = (clicked_row) => {
    ordersStore.order = clicked_row;
    ordersStore.view = 'order';
  };

  render() {
    const {main_div_height, reminders_sent} = this.state;
    const {is_orders_admin, orders} = ordersStore;
    return (
      <div>
        <If condition={is_orders_admin}>
          <div className='d-flex'>
            <button onClick={() => (ordersStore.view = 'order')} className='btn btn-sm btn-info'>
              Додати нормативний документ
            </button>
            <button onClick={() => this.sendReminders()} className='btn btn-sm btn-outline-info ml-auto' disabled={reminders_sent}>
              {reminders_sent ? 'Нагадування розіслано' : 'Розіслати нагадування про виконання наказів'}
            </button>
          </div>
        </If>

        <div className='row mt-2' ref={this.getMainDivRef} style={{height: '90vh'}}>
          <PaginatedTable
            url={'get_orders'}
            columns={columns}
            defaultSorting={[
              {columnName: 'date_start', direction: 'desc'},
              {columnName: 'code', direction: 'desc'}
            ]}
            colWidth={col_width}
            onRowClick={this.onRowClick}
            height={main_div_height}
            redRow='is_canceled'
            coloredStatus
            filter
          />
        </div>
      </div>
    );
  }
}

export default view(OrdersTable);
