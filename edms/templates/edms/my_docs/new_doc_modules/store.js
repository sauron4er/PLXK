import {store} from '@risingstack/react-easy-state';

const newDocStore = store({
  mockup_type_loading: true,
  new_document: {
    mockup_type_id: 0,
    mockup_type_name: '',
    mockup_product_type_id: 0,
    mockup_product_type_name: '',
  }
});

export default newDocStore;
