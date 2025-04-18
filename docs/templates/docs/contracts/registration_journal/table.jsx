'use strict';
import * as React from 'react';
import PaginatedTable from 'templates/components/tables/paginated_table';
import {useEffect, useRef, useState} from 'react';
import Selector from 'templates/components/form_modules/selectors/selector';
import counterpartyStore from 'boards/templates/boards/counterparty/components/counterparty_store';

function RegJournalTable(props) {
  const refMainDiv = useRef(null); // Отримує ref основного div для визначення його висоти та передачі її у DxTable
  const [mainDivHeight, setMainDivHeight] = useState(0);
  const [company, setCompany] = useState('0');
  const [type, setType] = useState('0');
  const [year, setYear] = useState('0');

  useEffect(() => {
    refMainDiv ? setMainDivHeight(refMainDiv.current.clientHeight - 50) : null;
  }, []);

  function onRowClick(clicked_row) {
    props.onRowClick(clicked_row);
  }

  function onCompanyChange(e) {
    const selectedIndex = e.target.options.selectedIndex;
    setCompany(e.target.options[selectedIndex].value);
  }

  function onTypeChange(e) {
    const selectedIndex = e.target.options.selectedIndex;
    setType(e.target.options[selectedIndex].value);
  }

  function onYearChange(e) {
    const selectedIndex = e.target.options.selectedIndex;
    setYear(e.target.options[selectedIndex].value);
  }

  return (
    <>
      <div className='d-flex mt-2'>
        <If condition={window.edit_access}>
          <div>
            <div className="btn btn-sm btn-outline-secondary" onClick={(e) => props.onRowClick()}>
              Додати
            </div>
          </div>
        </If>
        <div className='d-flex ml-auto'>
          <Selector
            list={[
              {id: 1, name: 'ТДВ'},
              {id: 2, name: 'ТОВ'},
              {id: 3, name: 'NorthlandChem'},
              {id: 4, name: 'ЩЕ ШОСЬ'}
            ]}
            classes='mr-1'
            selectedName={company}
            onChange={onCompanyChange}
            disabled={!window.edit_access}
          />
          <Selector
            list={[
              {id: 1, name: 'Закупівля лісу'},
              {id: 2, name: 'Купівля-продаж'},
              {id: 3, name: 'Перевезення'},
              {id: 4, name: 'Послуги та інше'}
            ]}
            classes='mr-1'
            selectedName={type}
            onChange={onTypeChange}
            disabled={!window.edit_access}
          />
          <Selector
            list={[
              {id: 1, name: '2020'},
              {id: 2, name: '2021'},
              {id: 3, name: '2022'},
              {id: 4, name: '2023'},
              {id: 5, name: '2024'},
              {id: 6, name: '2025'}
            ]}
            selectedName={year}
            onChange={onYearChange}
            disabled={!window.edit_access}
          />
        </div>
      </div>
      <div className='row mt-1 ml-1' ref={refMainDiv} style={{height: '89vh'}}>
        <PaginatedTable
          url={`get_contracts_reg_journal`}
          formData={[
            {id: 0, name: 'company', value: company},
            {id: 0, name: 'type', value: type},
            {id: 0, name: 'year', value: year}
          ]}
          columns={columns}
          defaultSorting={{columnName: 'auto_number', direction: 'desc'}}
          colWidth={col_width}
          onRowClick={onRowClick}
          height={mainDivHeight}
          coloredStatus
          filter
        />
      </div>
    </>
  );
}

RegJournalTable.defaultProps = {
  onRowClick: () => {}
};

export default RegJournalTable;

const columns = [
  {name: 'auto_number', title: 'Номер'},
  {name: 'type', title: 'Тип'},
  {name: 'date', title: 'Дата'},
  // {name: 'company', title: 'Підприємство'},
  {name: 'counterparty_name', title: 'Контрагент'},
  {name: 'subject', title: 'Предмет'},
  {name: 'responsible', title: 'Менеджер'},
  {name: 'status', title: ' '}
];

const col_width = [
  {columnName: 'auto_number', width: 100},
  {columnName: 'date', width: 100},
  {columnName: 'type', width: 250},
  {columnName: 'counterparty_name', width: 300},
  {columnName: 'responsible', width: 250},
  // {columnName: 'company', width: 100},
  {columnName: 'status', width: 35}
];
