'use strict';
import React from 'react';
import axios from 'axios';
import DxTable from 'templates/components/dx_table';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

const columns = [
  {name: 'id', title: 'id'},
  {name: 'name', title: 'Назва'}
];

const col_width = [
  {columnName: 'id', width: 30},
];

class CorrTable extends React.Component {
  state = {
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({
      main_div_height: this.mainDivRef.clientHeight
    });
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  newRequest = (e) => {
    e.preventDefault();
    this.props.showRequest({})
  };

  onRowClick = (row) => {
    this.props.showRequest(row)
  };

  render() {
    const {main_div_height} = this.state;
    const {requests} = this.props;
    return (
      <div ref={this.getMainDivRef}>
        <button className='btn btn-outline-success' onClick={this.newRequest}>Додати запит</button>
        <DxTable
          rows={requests}
          columns={columns}
          colWidth={col_width}
          onRowClick={this.onRowClick}
          height={main_div_height}
          filter
        />
      </div>
    );
  }

  static defaultProps = {
    requests: [],
    showRequest: () => {}
  };
}

export default CorrTable;
