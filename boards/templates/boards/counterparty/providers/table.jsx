'use strict';
import * as React from 'react';
import PaginatedTable from 'templates/components/tables/paginated_table';

const columns = [
  // {name: 'id', title: 'id'},
  {name: 'name', title: 'Назва'},
  {name: 'certificates', title: 'Сертифікати'},
  {name: 'edrpou', title: 'ЄДРПОУ'},
  {name: 'added', title: 'Додано'},
  {name: 'author', title: 'Відповідальний'},
  {name: 'status', title: ' '}
];

const col_width = [
  // {columnName: 'id', width: 50},
  {columnName: 'added', width: 90},
  {columnName: 'edrpou', width: 80},
  {columnName: 'author', width: 180},
  {columnName: 'status', width: 30}
];

class ProvidersTable extends React.Component {
  state = {
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    only_wood: false
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 100});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  changeOnlyWood = () => {
    this.setState({
      only_wood: !this.state.only_wood
    });
  };

  render() {
    const {main_div_height, only_wood} = this.state;
    return (
      <div ref={this.getMainDivRef}>
        <div className='form-check'>
          <input className='form-check-input' type='checkbox' value='' id='only_wood' checked={only_wood} onChange={this.changeOnlyWood} />
          <label className='form-check-label' htmlFor='only_wood'>
            Тільки лісосировина
          </label>
        </div>
        <PaginatedTable
          url={`get_providers/${only_wood}`}
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
    onRowClick: () => {}
  };
}

export default ProvidersTable;
