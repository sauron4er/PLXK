import {store} from '@risingstack/react-easy-state';

const contractsStore = store({
  contracts: [],
  contract: {
    id: 0,
    number: '',
    author: 0,
    author_name: '',
    subject: '',
    counterparty: '',
    nomenclature_group: '',
    date_start: '',
    date_end: '',
    responsible: null,
    responsible_name: '',
    department: null,
    department_name: '',
    lawyers_received: false,
    is_additional_contract: false,
    basic_contract: null,
    basic_contract_subject: '',
    new_files: [],
    old_files: []
  },
  employees: [],
  clearContract: () => {
    contractsStore.contract = {
      id: 0,
      number: '',
      author: 0,
      author_name: '',
      subject: '',
      counterparty: '',
      nomenclature_group: '',
      date_start: '',
      date_end: '',
      responsible: null,
      responsible_name: '',
      department: null,
      department_name: '',
      lawyers_received: false,
      is_additional_contract: false,
      basic_contract: null,
      basic_contract_subject: '',
      old_files: [],
      new_files: []
    };
  }
});

export default contractsStore;
