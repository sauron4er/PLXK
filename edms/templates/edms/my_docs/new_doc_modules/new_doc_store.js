import {store} from '@risingstack/react-easy-state';

const newDocStore = store({
  mockup_type_loading: true,
  new_document: {
    text: [],
    mockup_type: 0,
    mockup_type_name: '',
    mockup_product_type: 0,
    mockup_product_type_name: '',
    client: 0,
    client_name: '',
    counterparty: 0,
    counterparty_name: '',
    packaging_type: {
      queue: -1,
      text: ''
    },
    dimensions: [],
    contract_link: 0,
    contract_link_name: '',
    company: 'ТДВ',
    select: []
  },
  clean_fields: () => {
    newDocStore.new_document = {
      text: [],
      mockup_type: 0,
      mockup_type_name: '',
      mockup_product_type: 0,
      mockup_product_type_name: '',
      client: 0,
      client_name: '',
      counterparty: 0,
      counterparty_name: '',
      packaging_type: {
        queue: -1,
        text: ''
      },
      dimensions: [],
      contract_link: 0,
      contract_link_name: '',
      company: 'ТДВ',
      select: []
    }
  }
});

export default newDocStore;
