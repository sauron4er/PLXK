'use strict';
import React, {useState, useEffect, useRef} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyLettersStore from 'boards/templates/boards/counterparty/components/letters/store';
import DxTable from 'templates/components/tables/dx_table';
import Letter from 'boards/templates/boards/counterparty/components/letters/letter';
import {axiosGetRequest} from 'templates/components/axios_requests';
import counterpartyStore from '../counterparty_store';

function CounterpartyLetters(props) {
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    getLetters();
  }, []);

  function onRowClick(row) {
    counterpartyLettersStore.letter.id = row.id;
    counterpartyLettersStore.letter.name = row.name;
    counterpartyLettersStore.letter.text = row.text;
    counterpartyLettersStore.letter.date = row.date;
    counterpartyLettersStore.letter.counterparty_mail = row.counterparty_mail;
    counterpartyLettersStore.letter.comment = row.comment;
    counterpartyLettersStore.letter.old_files = row.files;
  }

  function getLetters() {
    counterpartyLettersStore.clearLetter();
    axiosGetRequest(`get_letters/${props.counterparty_id}/`)
      .then((response) => {
        setLetters(response);
        console.log(response);
      })
      .catch((error) => console.log(error));
  }

  return (
    <Choose>
      <When condition={counterpartyStore.counterparty.id}>
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
            <Letter counterparty_id={props.counterparty_id} reloadLetters={getLetters} />
          </div>
        </div>
      </When>
      <Otherwise>
        <div>Для додавання офіційних листів, будь ласка, збережіть новоствореного клієнта у вкладці "Загальна інформація"</div>
      </Otherwise>
    </Choose>
  );
}

CounterpartyLetters.defaultProps = {
  counterparty_id: 0
};

export default view(CounterpartyLetters);
