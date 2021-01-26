import {store} from '@risingstack/react-easy-state';
import {axiosGetRequest} from 'templates/components/axios_requests';

const providerStore = store({
  edit_access: false,
  provider: {
    id: 0,
    name: '',
    legal_address: '',
    actual_address: '',
    added_date: '',
    author: '',
    is_active: true
  },
  clearProvider: () => {
    providerStore.provider = {
      id: 0,
      name: '',
      legal_address: '',
      actual_address: '',
      added_date: '',
      author: '',
      is_active: true
    };
  }
});

export default providerStore;
