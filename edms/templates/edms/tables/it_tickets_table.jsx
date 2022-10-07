'use strict';
import * as React from 'react';
import 'static/css/my_styles.css';
import Modal from 'react-responsive-modal';
import Document from 'edms/templates/edms/my_docs/doc_info/document';
import PaginatedTable from 'templates/components/tables/paginated_table';

class ITTicketsTable extends React.Component {
  state = {
    doc_type_version: 0,
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    clicked_row_id: 0,
    columns: '',
    col_width: ''
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (row) => {
    this.setState({clicked_row_id: row.id});
  };

  onDocTypeVersionChange = (e) => {
    if (e.target.value !== '0') {
      this.setState({ doc_type_version: e.target.value });
      this.changeColumns(e.target.value);
    }
  };
  
  changeColumns = (doc_type_version) => {
    switch (doc_type_version) {
      case '5':
        this.setState({
          columns: [
            {name: 'id', title: 'id'},
            {name: 'author', title: 'Автор'},
            {name: 'name', title: 'Назва заявки'},
            {name: 'importancy', title: 'Важливість'},
            {name: 'deadline', title: 'Строк виконання'},
            {name: 'added_date', title: 'Створено'},
            {name: 'done_date', title: 'Виконано'},
            {name: 'stage', title: 'Стадія'},
          ],
          col_width: [
            {columnName: 'id', width: 50},
            {columnName: 'author', width: 200},
            {columnName: 'stage', width: 100},
            {columnName: 'importancy', width: 105},
            {columnName: 'deadline', width: 105},
            {columnName: 'added_date', width: 105},
            {columnName: 'done_date', width: 105},
        ]})
        break;
      case '6':
        this.setState({
          columns: [
            {name: 'id', title: 'id'},
            {name: 'author', title: 'Автор'},
            {name: 'name', title: 'Назва заявки'},
            {name: 'company', title: 'Бізнес-напрямок'},
            {name: 'accounting', title: 'Вид обліку'},
            {name: 'task_type', title: 'Тип задачі'},
            {name: 'importancy', title: 'Важливість'},
            {name: 'deadline', title: 'Строк виконання'},
            {name: 'added_date', title: 'Створено'},
            {name: 'done_date', title: 'Виконано'},
            {name: 'stage', title: 'Стадія'},
          ],
          col_width: [
            {columnName: 'id', width: 50},
            {columnName: 'author', width: 200},
            {columnName: 'stage', width: 100},
            {columnName: 'importancy', width: 105},
            {columnName: 'deadline', width: 105},
            {columnName: 'added_date', width: 105},
            {columnName: 'done_date', width: 105},
            {columnName: 'task_type', width: 150},
            {columnName: 'company', width: 150},
            {columnName: 'accounting', width: 150},
        ]})
        break;
      case '7':
        this.setState({
          columns: [
            {name: 'id', title: 'id'},
            {name: 'author', title: 'Автор'},
            {name: 'name', title: 'Назва заявки'},
            {name: 'task_type', title: 'Тип задачі'},
            {name: 'importancy', title: 'Важливість'},
            {name: 'deadline', title: 'Строк виконання'},
            {name: 'added_date', title: 'Створено'},
            {name: 'done_date', title: 'Виконано'},
            {name: 'stage', title: 'Стадія'},
          ],
          col_width: [
            {columnName: 'id', width: 50},
            {columnName: 'author', width: 200},
            {columnName: 'stage', width: 100},
            {columnName: 'importancy', width: 105},
            {columnName: 'deadline', width: 105},
            {columnName: 'added_date', width: 105},
            {columnName: 'done_date', width: 105},
            {columnName: 'task_type', width: 150},
        ]})
        break;
      case '14':
        this.setState({
          columns: [
            {name: 'id', title: 'id'},
            {name: 'author', title: 'Автор'},
            {name: 'name', title: 'Назва заявки'},
            {name: 'task_type', title: 'Тип задачі'},
            {name: 'deadline', title: 'Строк виконання'},
            {name: 'added_date', title: 'Створено'},
            {name: 'done_date', title: 'Виконано'},
            {name: 'stage', title: 'Стадія'},
          ],
          col_width: [
            {columnName: 'id', width: 50},
            {columnName: 'author', width: 200},
            {columnName: 'stage', width: 100},
            {columnName: 'deadline', width: 105},
            {columnName: 'added_date', width: 105},
            {columnName: 'done_date', width: 105},
            {columnName: 'task_type', width: 150},
        ]})
        break;
    }
  };

  render() {
    const {doc_type_version, main_div_height, clicked_row_id, columns, col_width} = this.state;

    return (
      <>
        <div className='css_main_div' ref={this.getMainDivRef}>
          <select className='form-control mx-3 mx-lg-0' value={doc_type_version} onChange={this.onDocTypeVersionChange}>
            <option key={0} data-key={0} value='0'>
              Оберіть підтип документу
            </option>
            <option key={1} data-key={5} value={5}>
              Заявка ІТ
            </option>
            <option key={2} data-key={6} value={6}>
              Заявка 1С8
            </option>
            <option key={3} data-key={7} value={7}>
              Заявка ПЛХК
            </option>
            <option key={4} data-key={14} value={14}>
              Заявка по сайту 10.10
            </option>
          </select>
          <If condition={doc_type_version}>
            <PaginatedTable
              url={`get_it_tickets/${doc_type_version}`}
              columns={columns}
              defaultSorting={[{columnName: 'id', direction: 'desc'}]}
              colWidth={col_width}
              onRowClick={this.onRowClick}
              height={main_div_height}
              filter
              coloredStage
            />
          </If>
        </div>
        <Modal
          open={clicked_row_id !== 0}
          onClose={() => this.setState({clicked_row_id: 0})}
          showCloseIcon={true}
          closeOnOverlayClick={true}
          styles={{modal: {marginTop: 100}}}
        >
          <Document doc_id={clicked_row_id} closed={true} opened_in_modal />
        </Modal>
      </>
    );
  }

  static defaultProps = {};
}

export default ITTicketsTable;