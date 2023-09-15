'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import PaginatedTable from 'templates/components/tables/paginated_table';
import permissionsStore from "boards/templates/boards/permissions/permissions_store";
import proposalsStore from "boards/templates/boards/proposals/proposals_store";


const columns = [
  {name: 'proposal_name', title: 'Пропозиція'},
  {name: 'author', title: 'Автор'},
  {name: 'deadline', title: 'Строк'},
  {name: 'responsible', title: 'Відповідальний'},
  {name: 'done', title: 'Виконано'},
];

const col_width = [
  {columnName: 'author', width: 250},
  {columnName: 'deadline', width: 150},
  {columnName: 'responsible', width: 250},
  {columnName: 'done', width: 100},
];

class ProposalsTable extends React.Component {
  state = {
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 60});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (clicked_row) => {
    proposalsStore.proposal = clicked_row;
    this.props.onRowClick(clicked_row.id)
  };

  render() {
    const {main_div_height} = this.state;

    return (
      <div className='row mt-2 ml-1' ref={this.getMainDivRef} style={{height: '83vh', width: '100%'}}>
        <PaginatedTable
          url={`get_proposals`}
          columns={columns}
          // defaultSorting={[{columnName: 'id', direction: 'asc'}]}
          colWidth={col_width}
          onRowClick={e => this.onRowClick(e)}
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

export default view(ProposalsTable);
