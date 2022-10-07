import {store} from '@risingstack/react-easy-state';

const contractSubjectsStore = store({
  employees: [],
  contract_subjects: [],
  contract_subject: {
    id: 0,
    name: '',
    approval_list: [],
    to_work_list: []
  }
});

export default contractSubjectsStore;
