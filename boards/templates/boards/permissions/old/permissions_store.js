import {store} from '@risingstack/react-easy-state';

const permissionsStore = store({
  main_div_height: 0,
  permission: {
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
    date_next: '',
    files: [],
  },
  permissions: [],

  clearPermission: () => {
    permissionsStore.permission = {
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
      date_next: '',
      files: [],
    };
  },
});

export default permissionsStore;
