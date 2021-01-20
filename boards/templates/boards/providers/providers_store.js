import {store} from '@risingstack/react-easy-state';
import { axiosGetRequest } from "templates/components/axios_requests";

const providersStore = store({
  full_edit_access: false,
  view: 'table', // provider
  provider: {
    id: 0,
  },
  clearProvider: () => {
    providersStore.provider = {
      id: 0,
    };
  },
});

export default providersStore;
