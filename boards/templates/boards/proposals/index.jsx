'use strict';
import * as React from 'react';
import ReactDOM from 'react-dom';
import ProposalsTable from 'boards/templates/boards/proposals/table';
import {useState} from 'react';
import Proposal from 'boards/templates/boards/proposals/proposal';
import proposalsStore from "boards/templates/boards/proposals/proposals_store";

function Proposals() {
  const [view, setView] = useState('table'); //, 'proposal

  function changeView(view_name) {
    if (view_name === 'new_proposal') {proposalsStore.clearProposal();}
    setView(view_name);
  }

  return (
    <div className='mt-3'>
      <Choose>
        <When condition={view === 'table'}>
          <h5>Реєстр випадків та пропозицій щодо покращення небезпечних умов праці на ТДВ "Перечинський ЛХК"</h5>
          <div className='mt-1'>
            <button onClick={(e) => changeView('new_proposal')} className='btn btn-sm btn-info mt-2'>
              Додати пропозицію
            </button>
          </div>
          <ProposalsTable onRowClick={(e) => changeView('proposal')} />
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-info my-2' onClick={(e) => changeView('table')}>
            Назад
          </button>
          <Proposal/>
        </Otherwise>
      </Choose>
    </div>
  );
}

ReactDOM.render(<Proposals />, document.getElementById('bundle'));
