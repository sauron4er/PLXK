'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import contractsStore from 'docs/templates/docs/contracts/contracts_store';
import PaginatedTable from 'templates/components/tables/paginated_table';


const columns = [
  {name: 'category', title: 'Категорія'},
  {name: 'department', title: 'Підрозділ'},
  {name: 'name', title: 'Назва'},
  {name: 'date_last', title: 'Попередній перегляд'},
  {name: 'date_next', title: 'Наступний перегляд'},
  {name: 'files', title: 'Файли'},
];

const col_width = [
  {columnName: 'category', width: 150},
  {columnName: 'department', width: 150},
  // {columnName: 'name', width: 200},
  {columnName: 'date_last', width: 80},
  {columnName: 'date_next', width: 80},
  {columnName: 'files', width: 100}
];

class PermissionsTable extends React.Component {
  state = {
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 50});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (clicked_row) => {
    contractsStore.contract = clicked_row;
    contractsStore.contract_view = true;
  };

  render() {
    const {main_div_height} = this.state;

    return (
      <div className='row mt-2 ml-1' ref={this.getMainDivRef} style={{height: '88vh', width: '100%'}}>
        <PaginatedTable
          url={`get_permissions`}
          columns={columns}
          defaultSorting={[{columnName: 'date_next', direction: 'desc'}]}
          colWidth={col_width}
          onRowClick={this.onRowClick}
          height={main_div_height}
          redRow='is_canceled'
          coloredStatus
          filter
        />
      </div>
    );
  }
}

export default view(PermissionsTable);
