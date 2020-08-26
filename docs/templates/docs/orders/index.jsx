'use strict';
import React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import {view, store} from '@risingstack/react-easy-state';
import ordersStore from 'docs/templates/docs/orders/orders_store';
// import PaginatedTable from 'templates/components/tables/paginated_table';
import Order from './order';

const columns = [
  // {name: 'id', title: 'id'},
  {name: 'code', title: '№'},
  {name: 'doc_type', title: 'Тип'},
  {name: 'name', title: 'Назва'},
  {name: 'author__last_name', title: 'Автор'},
  {name: 'date_start', title: 'Діє з'},
  {name: 'date_canceled', title: 'Діє до'},
  {name: 'status', title: ''}
];

const col_width = [
  // {columnName: 'id', width: 30},
  {columnName: 'doc_type', width: 110},
  {columnName: 'code', width: 60},
  {columnName: 'author__last_name', width: 200},
  {columnName: 'date_start', width: 80},
  {columnName: 'date_canceled', width: 80},
  {columnName: 'status', width: 30}
];

class Orders extends React.Component {
  state = {
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    ordersStore.employees = window.employees;
    ordersStore.types = window.types;
    ordersStore.is_orders_admin = window.is_orders_admin;
    ordersStore.orders = window.orders;
    this.setState({main_div_height: this.mainDivRef.clientHeight - 30});

    // Визначаємо, чи відкриваємо просто список документів, чи це посилання на конкретний документ:
    const arr = window.location.href.split('/');
    const last_href_piece = parseInt(arr[arr.length - 1]);
    const is_link = !isNaN(last_href_piece);

    if (is_link) {
      let row = [];
      for (let i = 0; i < window.orders.length; i++) {
        if (window.orders[i].id === last_href_piece) {
          row = window.orders[i];
        }
      }
      ordersStore.order = row;
      ordersStore.view = 'order';
    }
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (clicked_row) => {
    ordersStore.order = clicked_row;
    ordersStore.view = 'order';
  };

  onOrderClose = () => {
    ordersStore.clearOrder();
    ordersStore.view = 'table';
  };

  render() {
    const {main_div_height} = this.state;
    const {is_orders_admin, orders, view} = ordersStore;
    return (
      <Choose>
        <When condition={view === 'table'}>
          <div className='row mt-2' ref={this.getMainDivRef} style={{height: '90vh'}}>
            <If condition={is_orders_admin}>
              <button onClick={() => ordersStore.view = 'order'} className='btn btn-sm btn-success'>
                Додати нормативний документ
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
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-success my-2' onClick={() => this.onOrderClose()}>
            Назад
          </button>
          <br />
          <Order />
        </Otherwise>
      </Choose>
    );
  }
}

export default view(Orders);
