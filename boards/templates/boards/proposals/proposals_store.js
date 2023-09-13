import {store} from '@risingstack/react-easy-state';

const proposalsStore = store({
  main_div_height: 0,
  proposal: {
    id: 0,
    author: 0,
    author_name: '',
    department: 0,
    department_name: '',
    incident: '',
    incident_date: '',
    proposal_name: '',
    proposal: '',
    deadline: '',
    responsible: 0,
    responsible_name: '',
    is_done: false
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
      proposal_name: '',
      proposal: '',
      deadline: '',
      responsible: 0,
      responsible_name: '',
      is_done: false
    };
  }
});

export default proposalsStore;
