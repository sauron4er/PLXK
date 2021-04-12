'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import Document from '../my_docs/doc_info/document';
import SeatChooser from '../components/seat_chooser';
import DocTypeChooser from '../components/doc_type_chooser';
import SubEmpChooser from '../components/sub_emp_chooser';
import 'static/css/my_styles.css';
import docInfoStore from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/doc_info_store';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

const sub_columns = [
  {name: 'id', title: '№'},
  {name: 'type', title: 'Тип'},
  {name: 'author', title: 'Ініціатор'},
  {name: 'main_field', title: 'Зміст'},
  {name: 'date', title: 'Дата'}
];

const sub_col_width = [
  {columnName: 'id', width: 70},
  {columnName: 'type', width: 90},
  {columnName: 'author', width: 100},
  {columnName: 'date', width: 100}
];

class Delegated extends React.Component {
  state = {
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    active_docs: [],
    inactive_docs: [],
    doc_type: {id: 0},
    sub_emp: {id: 0}
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 60});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  updateLists = () => {
    const emp_seat = parseInt(localStorage.getItem('my_seat') ? localStorage.getItem('my_seat') : window.my_seats[0].id);
    const {doc_type, sub_emp} = this.state;
    this.setState({loading: true});

    axiosGetRequest('get/' + emp_seat + '/' + doc_type.id + '/' + sub_emp.id + '/')
      .then((response) => {
        this.setState({
          empty_response: response.length === 0,
          loading: false
        });
        this.docListArrange(response);
      })
      .catch((error) => notify(error));
  };

  docListArrange = (doc_list) => {
    this.setState({active_docs: [], inactive_docs: []}, () => {
      doc_list.map((doc) => {
        if (doc.md_is_active) {
          this.setState((prevState) => ({active_docs: [...prevState.active_docs, doc]}));
        } else {
          this.setState((prevState) => ({inactive_docs: [...prevState.inactive_docs, doc]}));
        }
      });
    });
  };

  onChangeDocType = (doc_type) => {
    this.setState({doc_type: doc_type});
  };

  onChangeSubEmp = (sub_emp) => {
    this.setState({sub_emp: sub_emp});
  };

  onRowClick = (clicked_row) => {
    this.setState({opened_doc_id: clicked_row.id});
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
    const {main_div_height, doc_type, sub_emp, active_docs, inactive_docs, opened_doc_id, loading, empty_response} = this.state;

    return (
      <div>
        <div className='d-flex justify-content-between align-content-start'>
          <div>
            <small>Оберіть тип документа та співробітника для пришвидшення пошуку (не обов’язково)</small>
            <div className='mr-3'>
              <DocTypeChooser docType={doc_type} changeDocType={this.onChangeDocType} />
            </div>
            <div className='mr-3'>
              <SubEmpChooser subEmp={sub_emp} changeSubEmp={this.onChangeSubEmp} />
            </div>
            <button className='btn btn-outline-info' onClick={this.updateLists}>
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
            <When condition={active_docs.length !== 0 || inactive_docs.length !== 0}>
              <div className='col-lg-4'>
                Документи у роботі
                <DxTable
                  rows={active_docs}
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
                  rows={inactive_docs}
                  columns={sub_columns}
                  defaultSorting={[{columnName: 'id', direction: 'desc'}]}
                  colWidth={sub_col_width}
                  onRowClick={this.onRowClick}
                  height={main_div_height}
                  filter
                />
              </div>
              <div className='col-lg-4 css_height_100'>
                <Document doc_id={opened_doc_id} archived={true} removeRow={this.onNewMark} />
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

export default Delegated;
