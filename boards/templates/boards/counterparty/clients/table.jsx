'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import PaginatedTable from 'templates/components/tables/paginated_table';
import ordersStore from 'docs/templates/docs/orders/orders_store';

const columns = [
  // {name: 'id', title: 'id'},
  {name: 'name', title: 'Назва'},
  {name: 'product__name', title: 'Продукція'},
  {name: 'country', title: 'Країна'},
  {name: 'edrpou', title: 'ЄДРПОУ'}
];

const col_width = [
  // {columnName: 'id', width: 50},
  {columnName: 'product__name', width: 100},
  {columnName: 'edrpou', width: 80},
  {columnName: 'country', width: 100}
];

class ClientsTable extends React.Component {
  state = {
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
  };
  
  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 100});
  }
  
   // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };
  
  render() {
    const {main_div_height} = this.state;
    return (
      <div ref={this.getMainDivRef}>
        <PaginatedTable
          url={'get_clients_list'}
          columns={columns}
          defaultSorting={[{columnName: 'id', direction: 'desc'}]}
          colWidth={col_width}
          onRowClick={this.props.onRowClick}
          height={main_div_height}
          filter
        />
      </div>
    );
  }

  static defaultProps = {
    onRowClick: () => {}
  };
}

export default ClientsTable;
