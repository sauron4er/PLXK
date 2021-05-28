import {store} from '@risingstack/react-easy-state';

const getToday = () => {
  return new Date().toISOString().substring(0, 10);
};

const nonComplianceStore = store({
  edit_access: false,
  non_compliance: {
    id: 0,
    author: 0,
    author_name: 'Автор',
    phase: 2, // 0 - creating, 1 - chief, 2 - visas, 3 - director, 4 - execution, done
    dep_chief: 0,
    dep_chief_name: 'Шеф',
    dep_chief_approval: false,
    registration_number: '1',
    date_added: getToday(),
    name: '3',
    party_number: '4',
    order_number: '5',
    quantity: '6',
    packing_type: '7',
    product: 5,
    product_name: '',
    provider: 2,
    provider_name: '',
    reason_big: '8',
    old_files: [],
    new_files: [],
    codification: '9',
    defect: '10',
    reason: '11',
    sector: '12',

    decision_date: ''
  },
  // non_compliance: {
  //   id: 0,
  //   phase: 0, // 1 - chief, 2 - visas, 3 - director, 4 - execution, done
  //   registration_number: '',
  //   date_added: '',
  //   name: '',
  //   party_number: '',
  //   order_number: '',
  //   quantity: '',
  //   packing_type: '',
  //   decision_date: '',
  //   product: 0,
  //   product_name: '',
  //   provider: 0,
  //   provider_name: '',
  //   reason_big: '',
  //   old_files: [],
  //   new_files: [],
  //   codification: '',
  //   defect: '',
  //   reason: '',
  //   sector: '',
  // },
  employees: [],

  onFormChange: (e, field) => {
    nonComplianceStore.non_compliance[field] = e.target.value;
  },

  clearNonCompliance: () => {
    nonComplianceStore.non_compliance = {
      id: 0,
      phase: 1 // , 2, 3, done
    };
  },

  getStyle: (phase) => {
    let div_style = {};
    switch (phase) {
      case 1:
        // div_style.height = '35vh';
        div_style.borderBottom = '2px solid grey';
        break;
      case 2:
        // div_style.height = '25vh';
        div_style.borderBottom = '2px solid grey';
        break;
      case 3:
        // div_style.height = '25vh';
        break;
    }

    return div_style;
  }
});

export default nonComplianceStore;
