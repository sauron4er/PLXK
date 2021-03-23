'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import PaginatedTable from 'templates/components/tables/paginated_table';

const columns = [
  {name: 'id', title: 'id'},
  {name: 'name', title: 'Назва'},
  {name: 'certificates', title: 'Сертифікати'},
  {name: 'edrpou', title: 'ЄДРПОУ'},
  {name: 'added', title: 'Додано'},
  {name: 'author', title: 'Відповідальний'},
  {name: 'status', title: ' '}
];

const col_width = [
  {columnName: 'id', width: 50},
  {columnName: 'added', width: 90},
  {columnName: 'edrpou', width: 90},
  {columnName: 'author', width: 180},
  {columnName: 'status', width: 30}
];

class ProvidersTable extends React.Component {
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
          url={'get_providers'}
          columns={columns}
          defaultSorting={[{columnName: 'id', direction: 'desc'}]}
          colWidth={col_width}
          onRowClick={this.props.onRowClick}
          height={main_div_height}
          filter
          coloredStatus
        />
      </div>
    );
  }
  
  static defaultProps = {
    onRowClick: () => {},
  }
}

export default ProvidersTable;
