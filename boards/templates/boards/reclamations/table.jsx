'use strict';
import * as React from 'react';
import PaginatedTable from 'templates/components/tables/paginated_table';
import {view, store} from '@risingstack/react-easy-state';
import {useEffect, useRef, useState} from 'react';
import reclamationsStore from "boards/templates/boards/reclamations/store";

const columns = [
  {name: 'id', title: 'id'},
  {name: 'client', title: 'Клієнт'},
  {name: 'product', title: 'Продукція'},
  {name: 'car_number', title: '№ авто'},
  {name: 'author', title: 'Ініціатор'},
  {name: 'responsible', title: 'Виконавець'},
  {name: 'status', title: ''}
];

const col_width = [
  {columnName: 'id', width: 30},
  {columnName: 'product', width: 110},
  {columnName: 'car_number', width: 110},
  {columnName: 'author', width: 200},
  {columnName: 'responsible', width: 200},
  {columnName: 'status', width: 30}
];

function ReclamationTable(props) {
  const refMainDiv = useRef(null); // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  const [mainDivHeight, setMainDivHeight] = useState(0);

  useEffect(() => {
    refMainDiv ? setMainDivHeight(refMainDiv.clientHeight - 50) : null;
  }, []);

  return (
    <div className='ml-3' ref={refMainDiv}>
      <If condition={reclamationsStore.counterparty_id !== -1}>
        <PaginatedTable
          url={`get_reclamations/${reclamationsStore.counterparty_id}`}
          columns={columns}
          defaultSorting={[{columnName: 'id', direction: 'desc'}]}
          colWidth={col_width}
          onRowClick={props.onRowClick}
          height={mainDivHeight}
          filter
        />
      </If>
    </div>
  );
}

ReclamationTable.defaultProps = {
  onRowClick: () => {}
};

export default view(ReclamationTable);
