'use strict';
import React, {useState, useEffect, useRef} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrTemplatesStore from 'correspondence/templates/corr_templates/store';
import DxTable from 'templates/components/tables/dx_table';


function CounterpartyLetters() {
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    // get letters
    setLetters([]);
  }, []);

  function onRowClick(row) {
    // corrTemplatesStore.corr_template.id = row.id;
    // corrTemplatesStore.corr_template.name = row.name;
    // corrTemplatesStore.corr_template.old_files = row.files;
  }

  return (
    <div className='d-md-flex mt-2'>
      <div className='col-md-6'>
        <DxTable
          rows={letters}
          columns={[
            {name: 'name', title: 'Назва'},
            {name: 'files', title: 'Файл'}
          ]}
          defaultSorting={[{columnName: 'name', direction: 'asc'}]}
          onRowClick={onRowClick}
          filter
        />
      </div>
      <div className='col-md-6'>
        {/*<CorrTemplate />*/}
      </div>
    </div>
  );
}

export default view(CounterpartyLetters);
