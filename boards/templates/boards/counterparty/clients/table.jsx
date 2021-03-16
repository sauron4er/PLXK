'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';

const columns = [
  {name: 'id', title: 'id'},
  {name: 'name', title: 'Назва'},
  {name: 'edrpou', title: 'ЄДРПОУ'},
  {name: 'country', title: 'Країна'},
];

const col_width = [
  {columnName: 'id', width: 50},
  {columnName: 'edrpou', width: 90},
  {columnName: 'country', width: 100},
];

class ClientsTable extends React.Component {

  render() {
    return (
      <DxTable
        rows={window.clients}
        columns={columns}
        defaultSorting={[{columnName: 'id', direction: 'desc'}]}
        colWidth={col_width}
        onRowClick={this.props.onRowClick}
        // height={this.props.mainDivHeight}
        filter
      />
    );
  }
  
  static defaultProps = {
    onRowClick: () => {},
  }
}

export default ClientsTable;
