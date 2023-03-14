import {store} from '@risingstack/react-easy-state';

const permissionsStore = store({
  permissions: {
    id: 0,
    category: 0,
    category_name: '',
    department: 0,
    department_name: '',
    name: '',
    info: '',
    comment: '',
    responsibles: [],
    dates: [],
    files: [],
  }
});

export default permissionsStore;
