'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';

const columns = [
  {name: 'id', title: 'id'},
  {name: 'product', title: 'Продукт'},
  {name: 'client', title: 'Клієнт'},
  {name: 'author', title: 'Ініціатор'},
  {name: 'responsible', title: 'Виконавець'},
  {name: 'status', title: ''},
];

const col_width = [
  {columnName: 'id', width: 30},
  {columnName: 'product', width: 100},
  {columnName: 'author', width: 200},
  {columnName: 'responsible', width: 200},
  {columnName: 'status', width: 30},
];

class NonComplianceTable extends React.Component {
  state = {
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight,});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (row) => {
    corrStore.corr_type = this.props.corrType;
    this.props.showRequest(row.id);
  };
  
  newNonCompliance = () => {
  
  };

  render() {
    const {main_div_height} = this.state;
    const {corrType} = this.props;
  
    return (
      <div ref={this.getMainDivRef}>
        <button className='btn btn-sm btn-outline-secondary' onClick={this.newNonCompliance}>Додати акт невідповідності</button>
        <DxTable
          rows={[]}
          columns={columns}
          colWidth={col_width}
          onRowClick={this.onRowClick}
          height={main_div_height}
          filter
          coloredStatus
        />
      </div>
    );
  }

  static defaultProps = {
    counterparty_id: 0,
  };
}

export default NonComplianceTable;
