'use strict';
import React from 'react';
// import {view, store} from '@risingstack/react-easy-state';
// import corrStore from './store';
import DxTable from 'templates/components/dx_table';

const columns = [
  {name: 'id', title: 'id'},
  {name: 'product_name', title: 'Продукт'},
  {name: 'client_name', title: 'Клієнт'},
  {name: 'responsible_name', title: 'Відповідальний'},
  {name: 'request_date', title: 'Дата отримання'},
  {name: 'request_term', title: 'Термін'},
  {name: 'status', title: ''},
];

const col_width = [
  {columnName: 'id', width: 30},
  {columnName: 'product_name', width: 50},
  {columnName: 'responsible_name', width: 200},
  {columnName: 'request_date', width: 100},
  {columnName: 'request_term', width: 100},
  {columnName: 'status', width: 30},
];

class Tables extends React.Component {
  state = {
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({
      main_div_height: this.mainDivRef.clientHeight
    });
  }
  
  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (row) => {
  
  };

  render() {
    const {main_div_height} = this.state;
    return (
      <div ref={this.getMainDivRef}>
      asd
        {/*<DxTable*/}
        {/*  rows={corrStore.requests}*/}
        {/*  columns={columns}*/}
        {/*  colWidth={col_width}*/}
        {/*  onRowClick={this.onRowClick}*/}
        {/*  height={main_div_height}*/}
        {/*  filter*/}
        {/*  coloredStatus*/}
        {/*/>*/}
      </div>
    );
  }

  static defaultProps = {
    showRequest: () => {}
  };
}

export default view(Tables);
