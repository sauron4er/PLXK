import {store} from '@risingstack/react-easy-state';

const contractsStore = store({
  contracts: [],
  contract: {
    id: 0,
    number: '',
    author_id: 0,
    author: '',
    subject: '',
    counterparty: '',
    nomenclature_group: '',
    date_start: '',
    date_end: '',
    responsible_id: 0,
    responsible: '',
    department_id: 0,
    department: '',
    lawyers_received: false,
    is_additional_contract: false,
    basic_contract_id: 0,
    basic_contract_subject: '',
    new_files: [],
    old_files: []
  },
  employees: [],
  is_contracts_admin: false
});

export default contractsStore;
