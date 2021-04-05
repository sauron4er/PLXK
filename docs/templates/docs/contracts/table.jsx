'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import contractsStore from 'docs/templates/docs/contracts/contracts_store';
import PaginatedTable from 'templates/components/tables/paginated_table';

const columns = [
  {name: 'number', title: 'Номер'},
  {name: 'subject', title: 'Предмет'},
  {name: 'counterparty_link__name', title: 'Контрагент'},
  {name: 'counterparty_link__edrpou', title: 'ЄДРПОУ'},
  {name: 'date_start', title: 'Діє з'},
  {name: 'date_end', title: 'Діє до'},
  {name: 'files', title: 'Файли'},
  // {name: 'responsible_name', title: 'Відповідальний'},
  {name: 'autoActuality', title: ' '}
];

const col_width = [
  {columnName: 'number', width: 100},
  {columnName: 'counterparty_link__name', width: 150},
  {columnName: 'counterparty_link__edrpou', width: 80},
  {columnName: 'date_start', width: 80},
  {columnName: 'date_end', width: 80},
  // {columnName: 'responsible_name', width: 150},
  {columnName: 'autoActuality', width: 30}
];

class ContractsTable extends React.Component {
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
        <If condition={contractsStore.counterparty_filter !== -1}>
          <PaginatedTable
            url={`get_contracts/${contractsStore.counterparty_filter}/${contractsStore.view}/${contractsStore.with_additional}`}
            columns={columns}
            defaultSorting={[{columnName: 'number', direction: 'desc'}]}
            colWidth={col_width}
            onRowClick={this.onRowClick}
            height={main_div_height}
            redRow='is_canceled'
            coloredStatus
            filter
          />
        </If>
      </div>
    );
  }
}

export default view(ContractsTable);
