'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from './store';
import DxTable from 'templates/components/tables/dx_table';

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

class CorrTable extends React.Component {
  state = {
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({
      main_div_height: this.mainDivRef.clientHeight,
    });
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  newRequest = (e) => {
    e.preventDefault();
    corrStore.corr_type = this.props.corrType;
    this.props.showRequest(0);
  };

  onRowClick = (row) => {
    corrStore.corr_type = this.props.corrType;
    this.props.showRequest(row.id);
  };
  
  filterCorrespondence = () => {
    return corrStore.correspondence.filter((corr) => this.props.corrType === corr.type);
  };

  render() {
    const {main_div_height} = this.state;
    const {corrType} = this.props;
    
    return (
      <div ref={this.getMainDivRef}>
        <button className='btn btn-outline-success' onClick={this.newRequest}>
          {corrType === 1 ? 'Додати запит' : 'Додати рекламацію'}
        </button>
        <DxTable
          rows={this.filterCorrespondence()}
          columns={columns}
          colWidth={col_width}
          onRowClick={this.onRowClick}
          height={main_div_height}
          filter
          coloredStatus
        />
      </div>
    );
  }

  static defaultProps = {
    showRequest: () => {},
    corrType: 1
  };
}

export default view(CorrTable);
