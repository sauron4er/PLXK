'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import Document from '../my_docs/doc_info/document';
import Selector from '../../../../templates/components/form_modules/selector';
import 'static/css/my_styles.css';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import docInfoStore from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/doc_info_store';
import {LoaderSmall} from 'templates/components/loaders';
import PaginatedTable from "templates/components/tables/paginated_table";

// налаштування колонок для таблиць
const my_archive_columns = [
  {name: 'id', title: '№'},
  {name: 'type', title: 'Тип'},
  {name: 'main_field', title: 'Зміст'},
  {name: 'date', title: 'Дата'}
];

const my_archive_col_width = [
  {columnName: 'id', width: 70},
  {columnName: 'type', width: 100},
  {columnName: 'date', width: 80}
];

const work_archive_columns = [
  {name: 'id', title: '№'},
  {name: 'type', title: 'Тип'},
  {name: 'main_field', title: 'Зміст'},
  {name: 'author', title: 'Ініціатор'}
];

const work_archive_col_width = [
  {columnName: 'id', width: 70},
  {columnName: 'type', width: 100},
  {columnName: 'author', width: 100}
];

class Archive extends React.Component {
  state = {
    seat_id: 0, // посада
    my_archive: [], // список моїх документів
    work_archive: [], // список документів, що були в роботі
    opened_doc_id: 0,
    doc_info: '', // отримана з бд інфа про вибраний документ
    carry_out_items: [],
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    doc_type_id: 0,
    doc_type_name: '',
    loading: false
  };

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getArchiveMainDivRef = (input) => {
      this.mainDivRef = input;
      if (this.mainDivRef) this.setState({main_div_height: this.mainDivRef.clientHeight - 50});
  };

  getArchive = (doc_type_id) => {
    if (doc_type_id) {
      this.setState({loading: true}, () => {
        axiosGetRequest('get_archive/' + doc_type_id + '/')
          .then((response) => {
            this.setState({
              my_archive: response.my_archive,
              work_archive: response.work_archive,
              loading: false
            });
          })
          .catch((error) => notify(error));
      });
    }
  };

  onRowClick = (clicked_row) => {
    this.setState({opened_doc_id: clicked_row.id});
  };

  onSelectorChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    this.setState({
      doc_type_id: e.target.options[selectedIndex].getAttribute('data-key'),
      doc_type_name: e.target.options[selectedIndex].getAttribute('value')
    });
    // this.getArchive(e.target.options[selectedIndex].getAttribute('data-key'));
  };

  onNewMark = (id, mark_id, author_id) => {
    // рендеримо відповідь на подію:
    let answer = '';
    switch (mark_id) {
      case 4:
        answer = 'Коментар до документу №' + id + ' опубліковано.';
        break;
      case 8:
        answer = 'Позначка "Ознайомлений" додана до документу №' + id + '.';
        break;
      case 12:
        answer = 'Файл до документу №' + id + ' додано.';
        break;
      case 15:
        answer = 'Документ №' + id + ' відправлено на ознайомлення.';
        break;
      case 21:
        answer = 'Відповідь на коментар додано';
        break;
    }
    this.setState({opened_doc_id: 0});
    docInfoStore.answer = answer;
  };

  render() {
    const {main_div_height, doc_type_id, doc_type_name, my_archive, work_archive, opened_doc_id, loading} = this.state;
  
    return (
      <>
        <div className='d-flex justify-content-between'>
          <div className='form-group'>
            <Choose>
              <When condition={!loading}>
                <Selector
                  list={window.doc_types}
                  selectedName={doc_type_name}
                  fieldName={'Оберіть тип документу'}
                  valueField={'description'}
                  onChange={(e) => this.onSelectorChange(e)}
                  disabled={false}
                />
              </When>
              <Otherwise>
                <LoaderSmall />
              </Otherwise>
            </Choose>
          </div>
        </div>
        <If condition={doc_type_id !== null && doc_type_id !== 0}>
          <div className="row css_main_div" ref={this.getArchiveMainDivRef}>
            <div className="col-lg-4">
              Створені вами документи
              <PaginatedTable
                url={`get_my_archive/${doc_type_id}`}
                columns={my_archive_columns}
                defaultSorting={[{ columnName: "id", direction: "desc" }]}
                colWidth={my_archive_col_width}
                onRowClick={this.onRowClick}
                height={main_div_height}
                filter
              />
              {/*<DxTable*/}
              {/*  rows={my_archive}*/}
              {/*  columns={my_archive_columns}*/}
              {/*  defaultSorting={[{columnName: 'id', direction: 'desc'}]}*/}
              {/*  colWidth={my_archive_col_width}*/}
              {/*  onRowClick={this.onRowClick}*/}
              {/*  height={main_div_height}*/}
              {/*  filter*/}
              {/*/>*/}
            </div>
            <div className="col-lg-4">
              Документи, що були у роботі
              <PaginatedTable
                url={`get_my_work_archive/${doc_type_id}`}
                columns={work_archive_columns}
                defaultSorting={[{ columnName: "id", direction: "desc" }]}
                colWidth={work_archive_col_width}
                onRowClick={this.onRowClick}
                height={main_div_height}
                filter
              />
              {/*<DxTable*/}
              {/*  rows={work_archive}*/}
              {/*  columns={work_archive_columns}*/}
              {/*  defaultSorting={[{ columnName: "id", direction: "desc" }]}*/}
              {/*  colWidth={work_archive_col_width}*/}
              {/*  onRowClick={this.onRowClick}*/}
              {/*  height={main_div_height}*/}
              {/*  filter*/}
              {/*/>*/}
            </div>
            <div className="col-lg-4 css_height_100">
              <Document doc_id={opened_doc_id} archived={true} removeRow={this.onNewMark} />
            </div>
          </div>
        </If>
      </>
    );
  }
}

export default Archive;
