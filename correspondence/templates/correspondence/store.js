import {store} from '@risingstack/react-easy-state';

const corrStore = store({
  view: 'request', // table, request, clients, laws
  requests: [],
  request: {
    id: 0,
    client_id: 0,
    client_name: '',
    scope_id: 0,
    scope_name: '',
    product_id: 0,
    product_name: '',
    answer: '',
    new_request_files: [],
    old_request_files: [],
    new_answer_files: [],
    old_answer_files: [],
    request_date: '',
    request_term: '',
    answer_date: '',
    responsible_id: 0,
    responsible_name: '',
    answer_responsible_id: 0,
    answer_responsible_name: '',
    laws: [],
    new_laws: [],
    delete_laws: []
  },
  law: {
    scope_id: 0,
    scope_name: '',
    scopes: []
  },
  selected_law_id: 0,
  selected_law_name: '',
  laws: [],
  clients: [],
  employees: [],
  products: [],
  scopes: []
});

export default corrStore;
