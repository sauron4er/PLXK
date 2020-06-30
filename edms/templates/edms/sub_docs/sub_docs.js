'use strict';
import React from 'react';
import axios from 'axios';
import DxTable from 'templates/components/tables/dx_table';
import Document from '../doc_info/document';
import SeatChooser from '../components/seat_chooser';
import DocTypeChooser from '../components/doc_type_chooser';
import SubEmpChooser from '../components/sub_emp_chooser';
import 'static/css/my_styles.css';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class SubDocs extends React.Component {
  state = {
    seat_id: 0,
    sub_docs: [],
    sub_archive: [],
    row: '',
    doc_info: '',
    carry_out_items: [],

    doc_type: {
      id: 0,
      name: ''
    },
    sub_emp: {
      id: 0,
      sub_emp: ''
    },
    loading: false,
    empty_response: false,

    // налаштування колонок для таблиць
    sub_columns: [
      {name: 'id', title: '№'},
      {name: 'type', title: 'Тип'},
      {name: 'author', title: 'Ініціатор'},
      // { name: 'dep', title: 'Відділ' },
      {name: 'date', title: 'Дата'}
    ],
    sub_col_width: [
      {columnName: 'id', width: 70},
      {columnName: 'type', width: 120},
      {columnName: 'author'},
      // { columnName: 'dep', width: 70 },
      {columnName: 'date', width: 100}
    ],
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({
      main_div_height: this.mainDivRef.clientHeight - 30
    });
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  updateLists = () => {
    const emp_seat = parseInt(
      localStorage.getItem('my_seat') ? localStorage.getItem('my_seat') : window.my_seats[0].id
    );
    const {doc_type, sub_emp} = this.state;
    this.setState({
      loading: true
    });
    axios({
      // отримуємо з бази список документів
      method: 'get',
      url: 'get/' + emp_seat + '/' + doc_type.id + '/' + sub_emp.id + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        
        this.setState({
          empty_response: response.data.length === 0,
          loading: false
        });
        this.docListArrange(response.data);
      })
      .catch(function(error) {
        console.log('errorpost: ' + error);
      });
  };

  docListArrange = (doc_list) => {
    this.setState({sub_docs: [], sub_archive: []});

    doc_list.map((doc) => {
      if (doc.is_active) {
        this.setState((prevState) => ({
          sub_docs: [...prevState.sub_docs, doc]
        }));
      } else {
        this.setState((prevState) => ({
          sub_archive: [...prevState.sub_archive, doc]
        }));
      }
    });
  };

  onChangeDocType = (doc_type) => {
    this.setState({
      doc_type: doc_type
    });
  };

  onChangeSubEmp = (sub_emp) => {
    this.setState({
      sub_emp: sub_emp
    });
  };

  // Виклик історії документу
  onRowClick = (clicked_row) => {
    this.setState({row: clicked_row});
  };

  render() {
    const {
      sub_columns,
      sub_col_width,
      main_div_height,
      doc_type,
      sub_emp,
      sub_docs,
      sub_archive,
      row,
      loading,
      empty_response
    } = this.state;

    return (
      <div>
        <div className='d-flex justify-content-between align-content-start'>
          <div>
            <small>
              Оберіть тип документа та співробітника для пришвидшення пошуку (не обов’язково)
            </small>
              <div className='mr-3'>
                <DocTypeChooser docType={doc_type} changeDocType={this.onChangeDocType} />
              </div>
              <div className='mr-3'>
                <SubEmpChooser subEmp={sub_emp} changeSubEmp={this.onChangeSubEmp} />
              </div>
              <button className='btn btn-outline-success' onClick={this.updateLists}>
                Знайти
              </button>
          </div>
          <SeatChooser onSeatChange={this.onSeatChange} />
        </div>
        <div className='row css_main_div mt-3' ref={this.getMainDivRef}>
          <Choose>
            <When condition={loading}>
              <div className='mt-3 loader-small' id='loader-1'>
                {' '}
              </div>
            </When>
            <When condition={sub_docs.length !== 0 || sub_archive.length !== 0}>
              <div className='col-lg-4'>
                Документи у роботі
                <DxTable
                  rows={sub_docs}
                  columns={sub_columns}
                  defaultSorting={[{columnName: 'id', direction: 'desc'}]}
                  colWidth={sub_col_width}
                  onRowClick={this.onRowClick}
                  height={main_div_height}
                  filter
                />
              </div>
              <div className='col-lg-4'>
                Документи в архіві
                <DxTable
                  rows={sub_archive}
                  columns={sub_columns}
                  defaultSorting={[{columnName: 'id', direction: 'desc'}]}
                  colWidth={sub_col_width}
                  onRowClick={this.onRowClick}
                  height={main_div_height}
                  filter
                />
              </div>
              <div className='col-lg-4 css_height_100'>
                <Document doc={row} closed={true} />
              </div>
            </When>
            <When condition={empty_response}>
              <div>Нічого не знайдено.</div>
            </When>
            <Otherwise />
          </Choose>
        </div>
      </div>
    );
  }
}

export default SubDocs