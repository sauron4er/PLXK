'use strict';
import React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import Document from '../my_docs/doc_info/document';
import Selector from '../../../../templates/components/form_modules/selector';
import 'static/css/my_styles.css';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

// налаштування колонок для таблиць
const my_archive_columns = [
  {name: 'id', title: '№'},
  {name: 'type', title: 'Тип'},
  {name: 'date', title: 'Дата'}
];
const my_archive_col_width = [{columnName: 'id', width: 70}, {columnName: 'type'}, {columnName: 'date', width: 100}];
const work_archive_columns = [
  {name: 'id', title: '№'},
  {name: 'type', title: 'Тип'},
  {name: 'author', title: 'Ініціатор'}
];
const work_archive_col_width = [{columnName: 'id', width: 70}, {columnName: 'type', width: 150}, {columnName: 'author'}];

class Archive extends React.Component {
  state = {
    seat_id: 0, // посада
    my_archive: [], // список моїх документів
    work_archive: [], // список документів, що були в роботі
    row: '', // вибраний документ
    doc_info: '', // отримана з бд інфа про вибраний документ
    carry_out_items: [],
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    doc_type_id: 0,
    doc_type_name: ''
  };

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  getArchive = (doc_type_id) => {
    axiosGetRequest('get_archive/' + doc_type_id + '/')
      .then((response) => {
        this.setState({
          my_archive: response.my_archive,
          work_archive: response.work_archive
        });
      })
      .catch((error) => notify(error));
  };

  onRowClick = (clicked_row) => {
    this.setState({row: clicked_row});
  };

  onSelectorChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    this.setState({
      doc_type_id: e.target.options[selectedIndex].getAttribute('data-key'),
      doc_type_name: e.target.options[selectedIndex].getAttribute('value')
    });
    this.getArchive(e.target.options[selectedIndex].getAttribute('data-key'));
  };

  render() {
    const {main_div_height, doc_type_name, my_archive, work_archive} = this.state;

    return (
      <>
        <div className='d-flex justify-content-between'>
          <div className='form-group'>
            <Selector
              list={window.doc_types}
              selectedName={doc_type_name}
              fieldName={'Оберіть тип документу'}
              valueField={'description'}
              onChange={(e) => this.onSelectorChange(e)}
              disabled={false}
            />
          </div>
        </div>
        <div className='row css_main_div' ref={this.getMainDivRef}>
          <div className='col-lg-4'>
            Створені вами документи
            <DxTable
              rows={my_archive}
              columns={my_archive_columns}
              defaultSorting={[{columnName: 'id', direction: 'desc'}]}
              colWidth={my_archive_col_width}
              onRowClick={this.onRowClick}
              height={main_div_height}
              filter
            />
          </div>
          <div className='col-lg-4'>
            Документи, що були у роботі
            <DxTable
              rows={work_archive}
              columns={work_archive_columns}
              defaultSorting={[{columnName: 'id', direction: 'desc'}]}
              colWidth={work_archive_col_width}
              onRowClick={this.onRowClick}
              height={main_div_height}
              filter
            />
          </div>
          <div className='col-lg-4 css_height_100'>
            <Document doc={this.state.row} closed={true} />
          </div>
        </div>
      </>
    );
  }
}

export default Archive;
