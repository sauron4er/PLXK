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
  }
});

export default providerStore;
