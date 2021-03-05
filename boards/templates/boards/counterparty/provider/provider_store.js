import {store} from '@risingstack/react-easy-state';

const providerStore = store({
  edit_access: false,
  provider: {
    id: 0,
    name: '',
    legal_address: '',
    actual_address: '',
    edrpou: '',
    added_date: '',
    author: '',
    products: [],
    is_active: true
  },
  certificate: {
    id: -1,
    certification_type_id: 0,
    certification_type: '',
    number: '',
    declaration: '',
    start: '',
    end: '',
    old_plhk_number: '',
    pauses: [],
    is_active: true
  },
  certification_types: [],
  certificates: [],
  clearProvider: () => {
    providerStore.provider = {
      id: 0,
      name: '',
      legal_address: '',
      actual_address: '',
      edrpou: '',
      added_date: '',
      author: '',
      products: [],
      is_active: true
    };
  },
  clearCertificate: () => {
    providerStore.certificate = {
      id: 0,
      certification_type_id: 0,
      certification_type: '',
      number: '',
      declaration: '',
      start: '',
      end: '',
      old_plhk_number: '',
      pauses: [],
      is_active: true
    };
  }
});

export default providerStore;
