'use strict';
import * as React from 'react';
import Document from 'edms/templates/edms/my_docs/doc_info/document';
import Selector from 'templates/components/form_modules/selectors/selector';
import 'static/css/my_styles.css';
import docInfoStore from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/doc_info_store';
import PaginatedTable from 'templates/components/tables/paginated_table';
import FancyRadio from 'templates/components/form_modules/fancy_radio';

// налаштування колонок для таблиць
const archive_columns = [
  {name: 'id', title: '№'},
  {name: 'type', title: 'Тип'},
  {name: 'main_field', title: 'Зміст'},
  {name: 'author', title: 'Ініціатор'},
  {name: 'date', title: 'Дата'}
];

const archive_col_width = [
  {columnName: 'id', width: 70},
  {columnName: 'type', width: 100},
  {columnName: 'author', width: 100},
  {columnName: 'date', width: 80}
];

const work_archive_columns = [
  {name: 'id', title: '№'},
  {name: 'type', title: 'Тип'},
  {name: 'main_field', title: 'Зміст'},
  {name: 'author', title: 'Ініціатор'},
  {name: 'date', title: 'Дата'}
];

const work_archive_col_width = [
  {columnName: 'id', width: 70},
  {columnName: 'type', width: 100},
  {columnName: 'author', width: 100},
  {columnName: 'date', width: 80}
];

class Archive extends React.Component {
  state = {
    seat_id: 0, // посада
    opened_doc_id: 0,
    doc_info: '', // отримана з бд інфа про вибраний документ
    carry_out_items: [],
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    doc_type_id: 0,
    doc_type_name: '',
    archive_type: 'my', //, 'subs', 'dep' (dep показується лише начальнику відділу)
    contract_phase: 'all' // 'scan', 'registration', 'visa'
  };

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getArchiveMainDivRef = (input) => {
    this.mainDivRef = input;
    if (this.mainDivRef) this.setState({main_div_height: this.mainDivRef.clientHeight - 50});
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

  onArchiveRadioChange = (e) => {
    this.setState({archive_type: e.target.name});
  };

  onContractRadioChange = (e) => {
    this.setState({contract_phase: e.target.name});
  };

  render() {
    const {main_div_height, doc_type_id, doc_type_name, opened_doc_id, archive_type, contract_phase} = this.state;

    return (
      <>
        <div className='d-flex'>
          <div className='d-flex'>
            <Selector
              list={window.doc_types}
              selectedName={doc_type_name}
              fieldName={'Оберіть тип документу'}
              valueField={'description'}
              onChange={(e) => this.onSelectorChange(e)}
              disabled={false}
            />
          </div>
          <If condition={doc_type_id === '5'}>
            <div className='d-flex ml-3'>
              <FancyRadio
                items={[
                  ['all', 'Всі'],
                  ['scan', 'Сканкопії'],
                  ['registration', 'Реєстрація'],
                  ['visa', 'Візування']
                ]}
                active={contract_phase}
                onChange={this.onContractRadioChange}
              />
            </div>
          </If>
          <div className='d-flex ml-auto'>
            <FancyRadio
              items={[
                ['my', 'Мої документи'],
                ['dep', 'Документи відділу'],
                ['subs', 'Документи підлеглих']
              ]}
              active={archive_type}
              onChange={this.onArchiveRadioChange}
            />
          </div>
        </div>
        <If condition={doc_type_id !== null && doc_type_id !== 0}>
          <div className='row css_main_div' ref={this.getArchiveMainDivRef}>
            <div className='col-lg-4'>
              {`Створені ${archive_type === 'my' ? 'вами' : archive_type === 'dep' ? 'працівниками відділу' : 'підлеглими'}  документи`}
              <PaginatedTable
                url={`get_archive/${archive_type}/${doc_type_id}/${contract_phase}`}
                columns={archive_columns}
                defaultSorting={[{columnName: 'id', direction: 'desc'}]}
                colWidth={archive_col_width}
                onRowClick={this.onRowClick}
                height={main_div_height}
                filter
              />
            </div>
            <div className='col-lg-4'>
              Документи, що були у роботі
              <PaginatedTable
                url={`get_work_archive/${archive_type}/${doc_type_id}/${contract_phase}`}
                columns={work_archive_columns}
                defaultSorting={[{columnName: 'id', direction: 'desc'}]}
                colWidth={work_archive_col_width}
                onRowClick={this.onRowClick}
                height={main_div_height}
                filter
              />
            </div>
            <div className='col-lg-4 css_height_100'>
              <Document doc_id={opened_doc_id} archived={true} removeRow={this.onNewMark} />
            </div>
          </div>
        </If>
      </>
    );
  }
}

export default Archive;
