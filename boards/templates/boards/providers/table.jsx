'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';

const columns = [
  {name: 'id', title: 'id'},
  {name: 'name', title: 'Назва'},
  {name: 'certificates', title: 'Сертифікати'},
  {name: 'added_date', title: 'Додано'},
  {name: 'author', title: 'Відповідальний'},
  {name: 'status', title: ' '}
];

const col_width = [
  {columnName: 'id', width: 30},
  {columnName: 'added_date', width: 90},
  {columnName: 'author', width: 180},
  {columnName: 'status', width: 30}
];

class ProvidersTable extends React.Component {

  render() {
    return (
      <DxTable
        rows={window.providers}
        columns={columns}
        defaultSorting={[{columnName: 'number', direction: 'desc'}]}
        colWidth={col_width}
        onRowClick={this.props.onRowClick}
        // height={this.props.mainDivHeight}
        filter
        coloredStatus
      />
    );
  }
  
  static defaultProps = {
    onRowClick: () => {},
  }
}

export default ProvidersTable;
