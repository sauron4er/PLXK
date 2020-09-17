'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import ordersStore from 'docs/templates/docs/orders/orders_store';
import Order from './order';
import OrdersTable from 'docs/templates/docs/orders/orders_table';
import OrdersCalendar from 'docs/templates/docs/orders/orders_calendar';

class Orders extends React.Component {

  componentDidMount() {
    ordersStore.employees = window.employees;
    ordersStore.emp_seats = window.emp_seats;
    ordersStore.types = window.types;
    ordersStore.is_orders_admin = window.is_orders_admin;
    ordersStore.orders = window.orders;

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

  changeView = (name) => {
    ordersStore.view = name;
  };

  getButtonStyle = (name) => {
    if (name === ordersStore.view) return 'btn btn-sm btn-secondary mr-1 active';
    return 'btn btn-sm btn-secondary mr-1';
  };

  render() {
    const {view} = ordersStore;
    return (
      <>
        <div className='btn-group mb-2' role='group' aria-label='orders_index'>
          <button type='button' className={this.getButtonStyle('table')} onClick={() => this.changeView('table')}>
            Загальний список
          </button>
          <button type='button' className={this.getButtonStyle('calendar')} onClick={() => this.changeView('calendar')}>
            Календар виконання наказів
          </button>
        </div>

        <Choose>
          <When condition={view === 'table'}>
            <OrdersTable />
          </When>
          <When condition={view === 'order'}>
            <Order />
          </When>
          <When condition={view === 'calendar'}>
            <OrdersCalendar />
          </When>
        </Choose>
      </>
    );
  }
}

export default view(Orders);
