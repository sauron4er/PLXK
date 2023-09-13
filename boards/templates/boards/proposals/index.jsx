'use strict';
import * as React from 'react';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Modal from 'react-responsive-modal';
import EmployeePAM from 'boards/templates/boards/phones/employee_pam';
import ReactDOM from 'react-dom';
import ProposalsTable from 'boards/templates/boards/proposals/table';
import {useState} from 'react';
import proposalsStore from 'boards/templates/boards/proposals/proposals_store';

function Proposals() {
  const [view, setView] = useState('table'); //, 'proposal

  function changeView(view_name) {
    setView(view_name);
  }

  return (
    <div className='mt-3'>
      <Choose>
        <When condition={view === 'table'}>
          <h5>Реєстр випадків та пропозицій щодо покращення небезпечних умов праці на ТДВ "Перечинський ЛХК"</h5>
          <div className='mt-1'>
            <button onClick={e => changeView('proposal')} className='btn btn-sm btn-info mt-2'>
              Додати пропозицію
            </button>
          </div>
          <ProposalsTable onRowClick={e => changeView('proposal')} />
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-info my-2' onClick={e => changeView('table')}>
            Назад
          </button>
          <br />
          <br />
          -- записати в базу ід департамента з основної посади автора (на випадок якщо посада зміниться, то департмент лишиться)
          <br />
          -- доступ людям - пошук усіх активних посад і якщо одна з них - підходяща, то доступ є
          <br />
          -- доступ: адміни, директор, Чобаня (посада?), Артур (посада?), начальник СОП
        </Otherwise>
      </Choose>
    </div>
  );
}

ReactDOM.render(<Proposals />, document.getElementById('bundle'));
