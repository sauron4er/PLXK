import {store} from '@risingstack/react-easy-state';

const getToday = () => {
  return new Date().toISOString().substring(0, 10);
};

const nonComplianceStore = store({
  edit_access: false,
  user_role: 'author',
  non_compliance: {
    id: 0,
    phase: 0, // 0 - creating, 1 - chief, 2 - visas, 3 - director, 4 - execution, 5 - done, 666 - denied
    author_name: '',
    department_name: department_name,
    dep_chief: 0,
    dep_chief_name: '',
    dep_chief_approved: '',
    date_added: getToday(),
    manufacture_date: '',
    name: '',
    party_number: '',
    order_number: '',
    total_quantity: '',
    nc_quantity: '',
    packing_type: '',
    product: 0,
    product_name: '',
    provider: 0,
    provider_name: '',
    reason: '',
    status: '',
    old_files: [],
    new_files: [],
    classification: '',
    defect: '',
    analysis_results: '',
    sector: '',
    final_decision: '',
    decision_date: '',
    result_of_nc: '',
    corrective_action: '',
    corrective_action_number: '',
    other: '',
    retreatment_date: '',
    spent_time: '',
    people_involved: '',
    quantity_updated: '',
    status_updated: '',
    
    decisions: [],

    new_comment: '',
    new_comment_files: [],
    comments: [],
  },
  counterparty_id: 0,
  counterparty_name: '',

  onFormChange: (e, field) => {
    nonComplianceStore.non_compliance[field] = e.target.value;
  },

  clearNonCompliance: () => {
    nonComplianceStore.non_compliance = {
      id: 0,
      author_name: '',
      department_name: department_name,
      phase: 0, // 0 - creating, 1 - chief, 2 - visas, 3 - director, 4 - execution, 5 - done, 666 - denied
      dep_chief: 0,
      dep_chief_name: '',
      dep_chief_approved: '',
      date_added: getToday(),
      manufacture_date: '',
      name: '',
      party_number: '',
      order_number: '',
      total_quantity: '',
      nc_quantity: '',
      packing_type: '',
      product: 0,
      product_name: '',
      provider: 0,
      provider_name: '',
      reason: '',
      status: '',
      old_files: [],
      new_files: [],
      classification: '',
      defect: '',
      analysis_results: '',
      sector: '',
      final_decision: '',
      decision_date: '',
      result_of_nc: '',
      corrective_action: '',
      corrective_action_number: '',
      other: '',
      retreatment_date: '',
      spent_time: '',
      people_involved: '',
      quantity_updated: '',
      status_updated: '',
    
      decisions: [],

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

export default nonComplianceStore;
