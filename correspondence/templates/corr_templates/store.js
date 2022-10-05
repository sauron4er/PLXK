import {store} from '@risingstack/react-easy-state';

const corrTemplatesStore = store({
  employees: [],
  corr_templates: [],
  corr_template: {
    id: 0,
    name: '',
    old_files: [],
    new_files: [],
  }
});

export default corrTemplatesStore;
