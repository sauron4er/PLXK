import * as React from 'react';
import ReactDOM from 'react-dom';
import ContractsRegJournal from 'docs/templates/docs/contracts/registration_journal/contracts_reg_journal';

function ContractsRegJournalApp() {
  return (
    <ContractsRegJournal />
  );
}

ReactDOM.render(<ContractsRegJournalApp />, document.getElementById('contracts_reg_journal'));
