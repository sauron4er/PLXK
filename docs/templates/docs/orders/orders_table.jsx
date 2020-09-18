'use strict';
import React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import {view, store} from '@risingstack/react-easy-state';
import ordersStore from 'docs/templates/docs/orders/orders_store';
// import PaginatedTable from 'templates/components/tables/paginated_table';
import Order from './order';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

const columns = [
  // {name: 'id', title: 'id'},
  {name: 'code', title: '№'},
  {name: 'type_name', title: 'Тип'},
  {name: 'name', title: 'Назва'},
  {name: 'author_name', title: 'Автор'},
  {name: 'date_start', title: 'Діє з'},
  {name: 'date_canceled', title: 'Діє до'},
  {name: 'status', title: ''}
];

const col_width = [
  // {columnName: 'id', width: 30},
  {columnName: 'type_name', width: 110},
  {columnName: 'code', width: 60},
  {columnName: 'author_name', width: 200},
  {columnName: 'date_start', width: 80},
  {columnName: 'date_canceled', width: 80},
  {columnName: 'status', width: 30}
];

class OrdersTable extends React.Component {
  state = {
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 30});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };
  
  sendReminders = () => {
    axiosGetRequest('reminders/')
      .then((response) => {})
      .catch((error) => notify(error));
  };

  onRowClick = (clicked_row) => {
    ordersStore.order = clicked_row;
    ordersStore.view = 'order';
  };

  render() {
    const {main_div_height} = this.state;
    const {is_orders_admin, orders} = ordersStore;
    return (
      <div className='row mt-2' ref={this.getMainDivRef} style={{height: '90vh'}}>
        <If condition={is_orders_admin}>
          <button onClick={() => (ordersStore.view = 'order')} className='btn btn-sm btn-success'>
            Додати нормативний документ
          </button>
          <button onClick={() => this.sendReminders()} className='btn btn-sm btn-outline-success ml-auto'>
            Розіслати нагадування про виконання наказів
          </button>
        </If>
        <DxTable
          rows={orders}
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
        {/*<PaginatedTable*/}
        {/*  url={'get_orders'}*/}
        {/*  rows={orders_list}*/}
        {/*  columns={columns}*/}
        {/*  defaultSorting={[*/}
        {/*    {columnName: 'date_start', direction: 'desc'},*/}
        {/*    {columnName: 'code', direction: 'desc'}*/}
        {/*  ]}*/}
        {/*  colWidth={col_width}*/}
        {/*  onRowClick={this.onRowClick}*/}
        {/*  height={main_div_height}*/}
        {/*  redRow='is_canceled'*/}
        {/*  coloredStatus*/}
        {/*  filter*/}
        {/*/>*/}
      </div>
    );
  }
}

export default view(OrdersTable);
