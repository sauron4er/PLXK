'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import PaginatedTable from 'templates/components/tables/paginated_table';
import permissionsStore from "boards/templates/boards/permissions/permissions_store";


const columns = [
  {name: 'category', title: 'Категорія'},
  {name: 'department', title: 'Підрозділ'},
  {name: 'name', title: 'Назва'},
  {name: 'files', title: 'Файли'},
  {name: 'date_next', title: 'Перегляд'},
];

const col_width = [
  {columnName: 'category', width: 150},
  {columnName: 'department', width: 150},
  // {columnName: 'name', width: 200},
  {columnName: 'files', width: 200},
  {columnName: 'date_next', width: 100},
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
    permissionsStore.permission = clicked_row;
    this.props.changeView()
  };

  render() {
    const {main_div_height} = this.state;

    return (
      <div className='row mt-2 ml-1' ref={this.getMainDivRef} style={{height: '88vh', width: '100%'}}>
        <PaginatedTable
          url={`get_permissions`}
          columns={columns}
          defaultSorting={[{columnName: 'date_next', direction: 'asc'}]}
          colWidth={col_width}
          onRowClick={this.onRowClick}
          height={main_div_height}
          filter
        />
      </div>
    );
  }

  static defaultProps = {
    changeView: () => {}
  };
}

export default view(PermissionsTable);
