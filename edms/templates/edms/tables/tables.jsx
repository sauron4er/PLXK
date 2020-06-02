'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
// import corrStore from './store';
import DxTable from 'templates/components/dx_table';
import ReactDOM from 'react-dom';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {Loader} from 'templates/components/loaders';
import 'static/css/my_styles.css';

const col_width = [{columnName: 'id', width: 35}, {columnName: 'status', width: 30}];

class Tables extends React.Component {
  state = {
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    doc_types: window.doc_types,
    doc_type_id: 0,
    doc_type_name: '',
    loading: false,
    header: [],
    rows: []
  };

  componentDidMount() {
    this.setState({
      main_div_height: this.mainDivRef.clientHeight
    });
  }

  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    this.setState(
      {
        doc_type_id: event.target.options[selectedIndex].getAttribute('data-key'),
        doc_type_name: event.target.options[selectedIndex].getAttribute('value'),
        loading: true
      },
      () => {
        this.getTable();
      }
    );
  };

  getTable = () => {
    axiosGetRequest('get_table/' + this.state.doc_type_id + '/')
      .then((response) => {
        this.setState({
          header: response.header,
          rows: response.rows,
          loading: false
        });
      })
      .catch((error) => notify(error));
  };

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (row) => {};

  render() {
    const {main_div_height, doc_types, doc_type_name, header, rows, loading} = this.state;
  
    return (
      <Choose>
        <When condition={!loading}>
          <div className='css_main_div'>
            <select
              className='form-control mx-3 mx-lg-0'
              id='doc_type'
              name='doc_type'
              value={doc_type_name}
              onChange={this.onChange}
            >
              <option key={0} data-key={0} value='0'>
                Оберіть тип документу
              </option>
              {doc_types.map((doc_type) => {
                return (
                  <option key={doc_type.id} data-key={doc_type.id} value={doc_type.name}>
                    {doc_type.name}
                  </option>
                );
              })}
            </select>
            <div ref={this.getMainDivRef}>
              <If condition={header.length}>
                <DxTable
                  rows={rows}
                  // rows={test_rows}
                  columns={header}
                  colWidth={col_width}
                  onRowClick={this.onRowClick}
                  height={main_div_height}
                  filter
                  coloredStatus
                />
              </If>
            </div>
          </div>
        </When>
        <Otherwise>
          <Loader />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    showRequest: () => {}
  };
}

ReactDOM.render(<Tables />, document.getElementById('tables'));
