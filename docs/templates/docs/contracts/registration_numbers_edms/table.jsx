'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import PaginatedTable from 'templates/components/tables/paginated_table';
import {useEffect, useRef, useState} from 'react';

const columns = [
  {name: 'reg_number', title: 'Номер'},
  {name: 'contract_subject', title: 'Предмет'},
  {name: 'document_id', title: 'Номер док.'}
];

const col_width = [
  {columnName: 'reg_number', width: 300},
  {columnName: 'document_id', width: 100}
];

function RegNumbersTable(props) {
  const refMainDiv = useRef(null); // Отримує ref основного div для визначення його висоти та передачі її у DxTable
  const [mainDivHeight, setMainDivHeight] = useState(0);

  useEffect(() => {
    refMainDiv ? setMainDivHeight(refMainDiv.current.clientHeight - 50) : null;
  }, []);

  function onRowClick(clicked_row) {
    props.onRowClick(clicked_row.document_id)
  }

  return (
    <div className='row mt-2 ml-1' ref={refMainDiv} style={{height: '90vh'}}>
      <PaginatedTable
        url={`get_contract_reg_numbers`}
        columns={columns}
        defaultSorting={[{columnName: 'reg_number', direction: 'desc'}]}
        colWidth={col_width}
        onRowClick={onRowClick}
        height={mainDivHeight}
        filter
      />
    </div>
  );
}

RegNumbersTable.defaultProps = {
  onRowClick: () => {}
}

export default view(RegNumbersTable);
