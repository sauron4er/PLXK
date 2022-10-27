'use strict';
import React, {useEffect, useState} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import reclamationsStore from "boards/templates/boards/reclamations/store";

function Reclamations(props) {
  const [view, setView] = useState('table'); // , reclamation

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  // getMainDivRef = (input) => {
  //   this.mainDivRef = input;
  // };

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
    reclamationsStore.non_compliance.id = id;
    setView('non_compliance');
  }

  function onRowClick(clicked_row) {
    reclamationStore.non_compliance.id = clicked_row.id;
    setView('non_compliance');
  }

  function changeView(name) {
    setView(name);
  }

  function getButtonStyle(name) {
    if (name === view) return 'btn btn-sm btn-secondary mr-1 active';
    return 'btn btn-sm btn-secondary mr-1';
  }

  return (
    <div>asd</div>
    // <Choose>
    //   <When condition={view === 'table'}>
    //     <div className='row mt-2' ref={this.getMainDivRef} style={{height: '90vh'}}>
    //       <div className='ml-3'>
    //         <button onClick={() => this.changeView('non_compliance')} className='btn btn-sm btn-info mr-2'>
    //           Додати акт невідповідності
    //         </button>
    //       </div>
    //       <NonComplianceTable onRowClick={this.onRowClick} />
    //     </div>
    //   </When>
    //   <Otherwise>
    //     <button className='btn btn-sm btn-info my-2' onClick={() => location.reload()}>
    //       Назад
    //     </button>
    //     <NonCompliance id={counterparty_id} />
    //   </Otherwise>
    // </Choose>
  );
}

Reclamations.defaultProps = {
  counterparty_id: 0,
  counterparty_name: ''
};

export default view(Reclamations);
