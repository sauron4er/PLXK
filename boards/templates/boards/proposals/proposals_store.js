import {store} from '@risingstack/react-easy-state';

const proposalsStore = store({
  main_div_height: 0,
  clicked_row_id: 0,
  proposal: {
    id: 0,
    author: 0,
    author_name: '',
    department: 0,
    department_name: '',
    incident: '',
    incident_date: '',
    name: '',
    text: '',
    deadline: '',
    responsible: 0,
    responsible_name: '',
    is_done: false,
    editing_allowed: true
  },
  proposals: [],

  clearProposal: () => {
    proposalsStore.proposal = {
      id: 0,
      author: 0,
      author_name: '',
      department: 0,
      department_name: '',
      incident: '',
      incident_date: '',
      name: '',
      text: '',
      deadline: '',
      responsible: 0,
      responsible_name: '',
      is_done: false
    };
  }
});

export default proposalsStore;
