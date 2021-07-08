'use strict';
import * as React from 'react';
import PaginatedTable from 'templates/components/tables/paginated_table';

const columns = [
  {name: 'id', title: 'id'},
  {name: 'provider', title: 'Постачальник'},
  {name: 'product', title: 'Продукція'},
  {name: 'order_number', title: '№ замовлення'},
  {name: 'author', title: 'Ініціатор'},
  {name: 'responsible', title: 'Виконавець'},
  {name: 'status', title: ''}
];

const col_width = [
  {columnName: 'id', width: 30},
  {columnName: 'product', width: 110},
  {columnName: 'order_number', width: 110},
  {columnName: 'author', width: 200},
  {columnName: 'responsible', width: 200},
  {columnName: 'status', width: 30}
];

class NonComplianceTable extends React.Component {
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

  render() {
    const {main_div_height} = this.state;
    return (
      <div className='ml-3' ref={this.getMainDivRef}>
        <PaginatedTable
          url={'get_non_compliances'}
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

export default NonComplianceTable;
