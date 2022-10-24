'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import Document from './doc_info/document';
import 'static/css/my_styles.css';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from './doc_info/doc_info_modules/doc_info_store';

class Docs extends React.Component {
  state = {
    my_docs_columns: [
      {name: 'id', title: '№'},
      {name: 'type', title: 'Тип'},
      {name: 'main_field', title: 'Зміст'},
      {name: 'date', title: 'Дата'}
    ],
    work_docs_columns: [
      {name: 'id', title: '№'},
      {name: 'type', title: 'Тип'},
      {name: 'main_field', title: 'Зміст'},
      {name: 'responsible', title: 'Відповідальний'}
    ],
    my_docs_col_width: [
      {columnName: 'id', width: 70},
      {columnName: 'type', width: 100},
      {columnName: 'date', width: 80}
    ],
    work_docs_col_width: [
      {columnName: 'id', width: 70},
      {columnName: 'type', width: 100},
      {columnName: 'author', width: 100}
    ],
    row: '',
    opened_doc_id: 0,
    modal_row: '',
    doc_info: '',
    carry_out_items: [],
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.id});
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 30});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Якщо ми отримали посилання на документ, шукаємо його в таблиці Мої документи:
    if (prevProps.openDocId !== this.props.openDocId) {
      this.setState({
        opened_doc_id: this.props.openDocId
      });

      let doc_info = '';
      for (let i = 0; i < this.props.my_docs.length; i++) {
        if (this.props.my_docs[i].id === this.props.openDocId) {
          doc_info = this.props.my_docs[i];
          break;
        }
      }
      // Якщо не знайшли у Моїх документах - шукаємо в Документах в черзі
      if (doc_info === '') {
        for (let i = 0; i < this.props.work_docs.length; i++) {
          if (this.props.work_docs[i].id === this.props.openDocId) {
            doc_info = this.props.work_docs[i];
            break;
          }
        }
      }

      //Якщо знайшли документ, показуємо його:
      if (doc_info !== '') {
        this.setState({row: doc_info});
      }
    }
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (clicked_row) => {
    this.setState({opened_doc_id: clicked_row.id});
  };

  // видаляє запис про виділений рядок, щоб очистити компонент DocInfo, передає інфу про закритий документ в MyDocs
  removeRow = (id, mark_id, author_id) => {
    // видаляємо документ зі списку, якщо реакція не коментар, файл, взято у роботу чи "на ознайомлення"
    // або якщо автор позначки не автор документу і позначка не "взято у роботу":
    // TODO реформатувати цей кошмарний код. (Переробити дві таблиці на одну і працювати з однією?)

    if (author_id === parseInt(localStorage.getItem('my_seat'))) {
      // Якщо автор закриває чи видаляє документ, видаляємо документ зі списку створених та отриманих
      [7, 13].includes(mark_id) ? this.props.removeMyDoc(id, author_id) : null;
      // Якщо автор ставить іншу позначку, видаляємо документ тільки зі списку отриманих:
      this.props.removeWorkDoc(id, author_id);
    } else if (mark_id === 23) {
      docInfoStore.info.expected_mark === 23 ? this.props.removeWorkDoc(id, author_id) : null;
    } else if (![4, 12, 15].includes(mark_id)) {
      // Якщо позначку ставить не автор, видаляємо документ зі списку отриманих
      // (Якщо позначка: Коментар, Файл чи На ознайомлення - не робимо нічого)
      this.props.removeWorkDoc(id, author_id);
    }

    // рендеримо відповідь на подію:
    let answer = '';
    switch (mark_id) {
      case 2:
        answer = 'Документ №' + id + ' погоджено.';
        break;
      case 3:
        answer = 'У виконанні документу №' + id + ' відмовлено.';
        break;
      case 4:
        answer = 'Коментар до документу №' + id + ' опубліковано.';
        break;
      case 5:
        answer = 'Документ №' + id + ' відправлено автору на доопрацювання.';
        break;
      case 6:
        answer = 'Документ №' + id + ' погоджено.';
        break;
      case 7:
        answer = 'Документ №' + id + ' закрито та відправлено в архів.';
        break;
      case 8:
        answer = 'Позначка "Ознайомлений" додана до документу №' + id + '.';
        break;
      case 10:
        answer = 'Резолюції до документу №' + id + ' додано.';
        break;
      case 11:
        answer = 'Позначка "Виконано" додана до документу №' + id + '.';
        break;
      case 12:
        answer = 'Файл до документу №' + id + ' додано.';
        break;
      case 13:
        answer = 'Документ №' + id + ' видалено.';
        break;
      case 15:
        answer = 'Документ №' + id + ' відправлено на ознайомлення.';
        break;
      case 17:
        answer = 'Документ №' + id + ' погоджено.';
        break;
      case 18:
        answer = 'Зміни в документі №' + id + ' збережено.';
        break;
      case 21:
        answer = 'Відповідь на коментар додано';
        break;
      case 22:
        answer = 'Підписані документи додано. Договір додано у базу Договорів';
        break;
      case 23:
        answer = 'Документ №' + id + ' взято до виконання';
        break;
      case 24:
        answer = 'Документ №' + id + ' підтверджено';
        break;
      case 25:
        answer = 'Документ №' + id + ' делеговано';
        break;
      case 26:
        answer = 'Документ №' + id + ' деактивовано';
        break;
      case 27:
        answer = 'Документ №' + id + ' зареєстровано';
        break;
      case 30:
        answer = 'Візуючого видалено';
        break;
      case 31:
        answer = 'Документ відправлено обраним особам';
        break;
      case 33:
        answer = 'Позначку "Оригінали документів отримано" додано';
        break;
      case 34:
        answer = 'Нагадування розіслано';
        break;
    }
    this.setState({opened_doc_id: 0});
    docInfoStore.answer = answer;
  };

  render() {
    const {work_docs_columns, my_docs_columns, my_docs_col_width, work_docs_col_width, main_div_height, opened_doc_id} = this.state;

    const my_docs = this.props.my_docs ? this.props.my_docs.filter((doc) => doc.status === 'doc') : [];
    const {work_docs} = this.props;

    return (
      <div className='row css_main_div' ref={this.getMainDivRef}>
        <div className='col-lg-4'>
          Створені документи
          <Choose>
            <When condition={my_docs !== ''}>
              <DxTable
                rows={my_docs}
                columns={my_docs_columns}
                defaultSorting={[{columnName: 'id', direction: 'desc'}]}
                colWidth={my_docs_col_width}
                onRowClick={this.onRowClick}
                height={main_div_height}
                filter
              />
            </When>
            <Otherwise>
              <div className='mt-3 loader-small' id='loader-1'>
                {' '}
              </div>
            </Otherwise>
          </Choose>
        </div>
        <div className='col-lg-4'>
          Документи в черзі
          <Choose>
            <When condition={work_docs !== ''}>
              <DxTable
                rows={work_docs}
                columns={work_docs_columns}
                defaultSorting={[{columnName: 'id', direction: 'desc'}]}
                colWidth={work_docs_col_width}
                onRowClick={this.onRowClick}
                height={main_div_height}
                filter
              />
            </When>
            <Otherwise>
              <div className='mt-3 loader-small' id='loader-1 '>
                {' '}
              </div>
            </Otherwise>
          </Choose>
        </div>
        <br />

        <div className='col-lg-4 css_height_100'>
          <Document
            // doc={this.state.row}
            doc_id={opened_doc_id}
            directSubs={this.props.directSubs}
            removeRow={this.removeRow}
            archived={false}
          />
        </div>
      </div>
    );
  }

  static defaultProps = {
    my_docs: [],
    work_docs: []
  };
}

export default view(Docs);
