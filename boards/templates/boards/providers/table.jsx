'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import {view, store} from '@risingstack/react-easy-state';
import contractsStore from 'docs/templates/docs/contracts/contracts_store';

const columns = [
  // {name: 'id', title: 'id'},
  {name: 'number', title: 'Номер'},
  {name: 'subject', title: 'Предмет'},
  {name: 'counterparty', title: 'Контрагент'},
  {name: 'date_start', title: 'Діє з'},
  {name: 'date_end', title: 'Діє до'},
  {name: 'files', title: 'Файли'},
  // {name: 'department', title: 'Відділ'},
  {name: 'responsible_name', title: 'Відповідальний'},
  {name: 'autoActuality', title: ' '}
];

const col_width = [
  // {columnName: 'id', width: 30},
  {columnName: 'number', width: 100},
  {columnName: 'date_start', width: 80},
  {columnName: 'date_end', width: 80},
  {columnName: 'responsible_name', width: 150},
  {columnName: 'autoActuality', width: 30}
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
      />
    );
  }
  
  static defaultProps = {
    onRowClick: () => {},
  }
}

export default view(ProvidersTable);
