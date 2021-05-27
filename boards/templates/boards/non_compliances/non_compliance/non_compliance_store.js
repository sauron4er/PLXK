import {store} from '@risingstack/react-easy-state';

const nonComplianceStore = store({
  edit_access: false,
  non_compliance: {
    id: 0,
    phase: 1, // , 2, 3, done
    registration_number: '',
    date_added: '',
    name: '',
    party_number: '',
    order_number: '',
    quantity: '',
    packing_type: '',
    decision_date: '',
    product: 0,
    product_name: '',
    counterparty: 0,
    identified_by: 0,
    identified_by_name: '',
    old_files: [],
    new_files: []
  },
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
