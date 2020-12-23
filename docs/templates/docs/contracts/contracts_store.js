import {store} from '@risingstack/react-easy-state';
import { axiosGetRequest } from "templates/components/axios_requests";

const contractsStore = store({
  contracts: [],
  view: 'ТДВ', // ТДВ, ТОВ
  contract_view: false, // перегляд чи додавання договору
  contract: {
    id: 0,
    number: '',
    company: 'ТДВ',
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
    old_files: [],
    edms_doc_id: 0
  },
  employees: [],
  clearContract: () => {
    contractsStore.contract = {
      id: 0,
      number: '',
      company: 'ТДВ',
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
      new_files: [],
      edms_doc_id: 0
    };
  },
  get_contracts: (company) => {
    axiosGetRequest('get_contracts/' + company + '/')
      .then((response) => {
        contractsStore.contracts = response
      })
      .catch((error) => console.log(error));
  }
});

export default contractsStore;
