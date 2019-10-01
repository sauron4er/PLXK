'use strict';
import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';

import DxTable from '../_else/dx_table';
import Document from '../doc_info/document';
import SeatChooser from '../_else/seat_chooser';
import '../_else/my_styles.css';

class Archive extends React.Component {
  state = {
    seat_id: 0, // посада
    my_archive: [], // список моїх документів
    work_archive: [], // список документів, що були в роботі
    row: '', // вибраний документ
    doc_info: '', // отримана з бд інфа про вибраний документ
    carry_out_items: [],

    // налаштування колонок для таблиць
    my_archive_columns: [
      {name: 'id', title: '№'},
      {name: 'type', title: 'Тип'},
      {name: 'date', title: 'Дата'}
    ],
    my_archive_col_width: [
      {columnName: 'id', width: 70},
      {columnName: 'type'},
      {columnName: 'date', width: 100}
    ],
    work_archive_columns: [
      {name: 'id', title: '№'},
      {name: 'type', title: 'Тип'},
      {name: 'author', title: 'Ініціатор'}
    ],
    work_archive_col_width: [
      {columnName: 'id', width: 70},
      {columnName: 'type', width: 150},
      {columnName: 'author'}
    ],
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  // шукає обрану посаду або обирає першу зі списку і показує відповідні їй документи
  componentDidMount() {
    const seat_id = parseInt(
      localStorage.getItem('my_seat') ? localStorage.getItem('my_seat') : window.my_seats[0].id
    );
    this.setState({
      seat_id: seat_id,
      main_div_height: this.mainDivRef.clientHeight - 30
    });
    this.updateLists(seat_id);
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  // Оновлює списки документів
  updateLists = (seat_id) => {
    this.state.my_archive = [];
    window.my_archive.map((doc) => {
      if (doc.author_seat_id === seat_id) {
        this.setState((prevState) => ({
          my_archive: [...prevState.my_archive, doc]
        }));
      }
    });

    this.state.work_archive = [];
    window.work_archive.map((doc) => {
      if (doc.emp_seat_id === seat_id) {
        this.setState((prevState) => ({
          work_archive: [...prevState.work_archive, doc]
        }));
      }
    });
  };

  // отримує нову посаду з компоненту SeatChooser і відповідно змінює списки
  onSeatChange = (new_seat_id) => {
    this.setState({seat_id: new_seat_id});

    this.updateLists(new_seat_id);
  };

  onRowClick = (clicked_row) => {
    this.setState({row: clicked_row});
  };

  render() {
    const {
      my_archive_columns,
      my_archive_col_width,
      work_archive_columns,
      work_archive_col_width,
      main_div_height
    } = this.state;

    return (
      <Fragment>
        <SeatChooser onSeatChange={this.onSeatChange} />
        <div className='row css_main_div' ref={this.getMainDivRef}>
          <div className='col-lg-4'>
            Створені вами документи
            <DxTable
              rows={this.state.my_archive}
              columns={my_archive_columns}
              defaultSorting={[{columnName: 'id', direction: 'asc'}]}
              colWidth={my_archive_col_width}
              onRowClick={this.onRowClick}
              height={main_div_height}
              filter
            />
          </div>
          <div className='col-lg-4'>
            Документи, що були у роботі
            <DxTable
              rows={this.state.work_archive}
              columns={work_archive_columns}
              defaultSorting={[{columnName: 'id', direction: 'desc'}]}
              colWidth={work_archive_col_width}
              onRowClick={this.onRowClick}
              height={main_div_height}
              filter
            />
          </div>
          <div className='col-lg-4 css_height_100'>
            <Document doc={this.state.row} my_seat_id={this.state.seat_id} closed={true} />
          </div>
        </div>
      </Fragment>
    );
  }
}

ReactDOM.render(<Archive />, document.getElementById('archive'));
