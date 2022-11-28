import * as React from 'react';
import ReactDOM from 'react-dom';
import ContractRegNumbers from 'docs/templates/docs/contracts/registration_numbers/contract_reg_numbers';

function ContractRegNumbersApp() {
  return (
    <ContractRegNumbers />
  );
}

ReactDOM.render(<ContractRegNumbersApp />, document.getElementById('contract_reg_numbers'));
