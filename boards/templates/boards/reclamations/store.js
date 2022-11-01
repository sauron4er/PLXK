import {store} from '@risingstack/react-easy-state';

const getToday = () => {
  return new Date().toISOString().substring(0, 10);
};

const reclamationsStore = store({
  edit_access: false,
  user_role: 'author',
  counterparty_id: -1,
  counterparty_name: '',
  reclamation: {
    id: 0,
    phase: 0, // 0 - creating, 1 - chief, 2 - visas, 3 - execution, 4 - done, 666 - denied
    author_name: '',
    department_name: department_name,
    dep_chief: 0,
    dep_chief_name: '',
    dep_chief_approved: '',

    product_type: 0,
    product_type_name: '',
    product: 0,
    product_name: '',
    client: 0,
    client_name: '',
    car_number: '',
    date_manufacture: '',
    date_shipment: '',
    date_received: getToday(),
    reason: '',
    old_files: [],
    new_files: [],

    final_decisioner: '',
    final_decision: '',
    final_decision_time: '',

    decisions: [],
    edited_decision: '',
    edited_decision_index: 0,

    responsible: 0,
    responsible_name: '',
    answer_responsible_dep: 0,
    answer_responsible_dep_name: '',

    new_comment: '',
    new_comment_files: [],
    comments: []
  },

  onFormChange: (e, field) => {
    reclamationsStore.reclamation[field] = e.target.value;
  },

  clearReclamation: () => {
    reclamationsStore.reclamation = {
      id: 0,
      phase: 0,
      author_name: '',
      department_name: department_name,
      dep_chief: 0,
      dep_chief_name: '',
      dep_chief_approved: '',

      product_type: 0,
      product_type_name: '',
      product: 0,
      product_name: '',
      client: 0,
      client_name: '',
      car_number: '',
      date_manufacture: '',
      date_shipment: '',
      date_received: getToday(),
      reason: '',
      old_files: [],
      new_files: [],

      final_decisioner: '',
      final_decision: '',
      final_decision_time: '',

      decisions: [],
      edited_decision: '',
      edited_decision_index: 0,

      responsible: 0,
      responsible_name: '',
      answer_responsible_dep: 0,
      answer_responsible_dep_name: '',

      new_comment: '',
      new_comment_files: [],
      comments: []
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

export default reclamationsStore;
