'use strict';
import React, {useEffect, useState, useRef} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import reclamationsStore from "boards/templates/boards/reclamations/store";
import ReclamationTable from "boards/templates/boards/reclamations/table";
import Reclamation from "boards/templates/boards/reclamations/reclamation";

function Reclamations(props) {
  const [view, setView] = useState('table'); // , reclamation

  useEffect(() => {
    reclamationsStore.counterparty_id = props.counterparty_id;
    reclamationsStore.counterparty_name = props.counterparty_name;

    // Визначаємо, чи відкриваємо просто список, чи це конкретне посилання:
    const arr = window.location.pathname.split('/');
    let filtered = arr.filter((el) => el !== '');
    const last_href_piece = parseInt(filtered[filtered.length - 1]);
    const is_link = !isNaN(last_href_piece);
    if (is_link) showReclamation(last_href_piece);
  }, []);

  function showReclamation(id) {
    reclamationsStore.reclamation.id = id;
    setView('reclamation');
  }

  function onRowClick(clicked_row) {
    console.log(clicked_row);
    reclamationsStore.reclamation.id = clicked_row.id;
    setView('reclamation');
  }

  function changeView(name) {
    setView(name);
  }

  function getButtonStyle(name) {
    if (name === view) return 'btn btn-sm btn-secondary mr-1 active';
    return 'btn btn-sm btn-secondary mr-1';
  }

  return (
    <Choose>
      <When condition={view === 'table'}>
        <div className='row mt-2' style={{height: '90vh'}}>
          <div className='ml-3'>
            <button onClick={() => changeView('reclamation')} className='btn btn-sm btn-info mr-2'>
              Додати рекламацію
            </button>
          </div>
          <ReclamationTable onRowClick={onRowClick} />
        </div>
      </When>
      <Otherwise>
        <button className='btn btn-sm btn-info my-2' onClick={() => location.reload()}>
          Назад
        </button>
        <Reclamation />
      </Otherwise>
    </Choose>
  );
}

Reclamations.defaultProps = {
  counterparty_id: 0,
  counterparty_name: ''
};

export default view(Reclamations);
