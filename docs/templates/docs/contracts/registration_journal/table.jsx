'use strict';
import * as React from 'react';
import PaginatedTable from 'templates/components/tables/paginated_table';
import {useEffect, useRef, useState} from 'react';

const columns = [
  {name: 'number', title: 'Номер'},
  {name: 'date', title: 'Дата'},
  {name: 'counterparty', title: 'Контрагент'},
  {name: 'contract_subject', title: 'Предмет'},
];

const col_width = [
  {columnName: 'number', width: 100},
  {columnName: 'date', width: 100},
  {columnName: 'counterparty', width: 300},
];

function RegJournalTable(props) {
  const refMainDiv = useRef(null); // Отримує ref основного div для визначення його висоти та передачі її у DxTable
  const [mainDivHeight, setMainDivHeight] = useState(0);

  useEffect(() => {
    refMainDiv ? setMainDivHeight(refMainDiv.current.clientHeight - 50) : null;
  }, []);

  function onRowClick(clicked_row) {
    props.onRowClick(clicked_row)
  }

  return (
    <div className='row mt-1 ml-1' ref={refMainDiv} style={{height: '89vh'}}>
      <PaginatedTable
        url={`get_contracts_reg_journal`}
        columns={columns}
        defaultSorting={[{columnName: 'date', direction: 'desc'}]}
        colWidth={col_width}
        onRowClick={onRowClick}
        height={mainDivHeight}
        filter
      />
    </div>
  );
}

RegJournalTable.defaultProps = {
  onRowClick: () => {}
}

export default RegJournalTable;
