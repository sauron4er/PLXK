import {store} from '@risingstack/react-easy-state';

const corrStore = store({
  view: 'request', // table, request, clients, laws
  requests: [],
  request: {
    id: 0,
    client_id: 0,
    client_name: '',
    answer: '',
    new_eml_file: [],
    old_eml_file: [],
    new_answer_files: [],
    old_answer_files: [],
    request_date: '',
    request_term: '',
    answer_date: '',
    responsible_id: 0,
    responsible_name: '',
    answer_responsible_id: 0,
    answer_responsible_name: '',
    laws: []
  },
  laws: [],
  clients: [],
  employees: [],
});

export default corrStore;
