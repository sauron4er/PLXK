'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import DxTable from '../../components/dx_table';
import axios from 'axios';
import Order from './order_edit';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

const columns = [
  {name: 'id', title: 'id'},
  {name: 'type_name', title: 'Тип'},
  {name: 'code', title: '№'},
  {name: 'name', title: 'Назва'},
  {name: 'author_name', title: 'Автор'},
  {name: 'date_start', title: 'Діє з'},
  {name: 'date_canceled', title: 'Діє до'}
];

const col_width = [
  {columnName: 'id', width: 30},
  {columnName: 'code', width: 50},
  {columnName: 'type_name', width: 110},
  {columnName: 'author_name', width: 200},
  {columnName: 'date_start', width: 80},
  {columnName: 'date_canceled', width: 100}
];

class Orders extends React.Component {
  state = {
    is_orders_admin: window.is_orders_admin,
    table_view: true, // true - таблиця наказів, false - перегляд, редагування чи додання наказу
    orders_list: [],
    row: {},
    open_doc_id: 0,
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({
      orders_list: window.orders_list,
      main_div_height: this.mainDivRef.clientHeight - 30
    });

    // Визначаємо, чи відкриваємо просто список документів, чи це посилання на конкретний документ:
    const arr = window.location.href.split('/');
    const last_href_piece = parseInt(arr[arr.length - 1]);
    const is_link = !isNaN(last_href_piece);

    if (is_link) {
      let row = [];
      for (let i = 0; i < window.orders_list.length; i++) {
        if (window.orders_list[i].id === last_href_piece) {
          row = window.orders_list[i];
        }
      }
      this.setState({
        table_view: false,
        row: row
      });
    }
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (clicked_row) => {
    this.setState({
      row: clicked_row,
      table_view: false
    });
  };

  onGoBack = (e) => {
    e.preventDefault();
    this.setState({
      table_view: true,
      row: {}
    });
  };

  onChangesPosted = (mode, order, id) => {
    if (mode === 'add') {
      order.id = id;
      let {orders_list} = this.state;
      orders_list.push(order);
      this.setState(
        {
          orders_list
        },
        () => {
          this.setState({
            table_view: true,
            row: {}
          });
        }
      );
    } else if (mode === 'deactivate') {
      let {orders_list} = this.state;
      const new_list = orders_list.filter(order => order.id !== id);
      this.setState({
        orders_list: new_list,
        table_view: true,
        row: {}
      });
    } else {
      this.setState({
        table_view: true,
        row: {}
      });
    }
  };

  onAddOrder = () => {
    this.setState({
      table_view: false
    });
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

  render() {
    const {is_orders_admin, orders_list, main_div_height, open_modal, row, table_view} = this.state;
    return (
      <Choose>
        <When condition={table_view}>
          <div className='row mt-2' ref={this.getMainDivRef} style={{height: '90vh'}}>
            <If condition={is_orders_admin}>
              <button onClick={this.onAddOrder} className='btn btn-sm btn-success'>
                Додати нормативний документ
              </button>
            </If>
            <DxTable
              rows={orders_list}
              columns={columns}
              defaultSorting={[{columnName: 'date_start', direction: 'desc'}, {columnName: 'code', direction: 'desc'}]}
              colWidth={col_width}
              onRowClick={this.onRowClick}
              height={main_div_height}
              redRow='is_canceled'
              filter
            />
          </div>
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-success my-2' onClick={this.onGoBack}>
            Назад
          </button>
          <br />
          <Order id={row.id} editMode={is_orders_admin} close={this.onChangesPosted} />
        </Otherwise>
      </Choose>
    );
  }
}

ReactDOM.render(<Orders />, document.getElementById('orders'));
