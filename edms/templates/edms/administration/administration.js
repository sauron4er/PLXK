'use strict';
import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

// axios.defaults.xsrfHeaderName = 'X-CSRFToken';
// axios.defaults.xsrfCookieName = 'csrftoken';
// axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

import SeatChooser from '../components/seat_chooser';
import DxTable from '../components/dx_table';
import Constructor from './constructor';

class Administration extends React.Component {
  state = {
    editing_view: false,
    doc_types: [],
    seat_id: 0,
    doc_type: '', // Обраний документ

    // налаштування колонок для таблиць
    doc_types_columns: [{name: 'description', title: 'Назва'}, {name: 'creator', title: 'Автор'}],
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

  // отримує нову посаду з компоненту SeatChooser і відповідно змінює списки
  onSeatChange = (new_seat_id) => {
    this.setState({seat_id: new_seat_id});
    this.updateLists(new_seat_id);
  };

  // Оновлює списки документів
  updateLists = (seat_id) => {
    axios({
      method: 'get',
      url: 'get_types/' + seat_id + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        if (response.data) {
          this.setState({doc_types: response.data});
        }
      })
      .catch(function(error) {
        console.log('errorpost: ' + error);
      });
  };

  // Виклик інформації про тип документу
  onRowClick = (clicked_row) => {
    this.setState({
      doc_type: clicked_row
    });
  };

  onClick = (e) => {
    e.preventDefault();
    this.setState((prevState) => ({
      doc_type: prevState.doc_type === '' ? {id: 0, description: ''} : ''
    }));
  };

  render() {
    const {doc_type, doc_types, doc_types_columns, main_div_height} = this.state;
    return (
      <Choose>
        <When condition={doc_type === ''}>
          <div className='d-flex justify-content-between'>
            <button className='btn btn-sm btn-outline-secondary' onClick={this.onClick}>
              Створити новий вид документу
            </button>
            <SeatChooser onSeatChange={this.onSeatChange} />
          </div>
          <div className='row css_main_div' ref={this.getMainDivRef}>
            <div className='col-lg-4'>
              Редагувати вид документу:
              <DxTable
                rows={doc_types}
                columns={doc_types_columns}
                defaultSorting={[{columnName: 'description', direction: 'asc'}]}
                onRowClick={this.onRowClick}
                height={main_div_height}
                filter
              />
            </div>
          </div>
        </When>
        <Otherwise>
          <Constructor docType={doc_type} onClick={this.onClick} />
        </Otherwise>
      </Choose>
    );
  }
}

ReactDOM.render(<Administration />, document.getElementById('administration'));
