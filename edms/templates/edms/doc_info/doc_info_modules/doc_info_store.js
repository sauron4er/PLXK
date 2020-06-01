import {store} from '@risingstack/react-easy-state';

const docInfoStore = store({
  doc: {},
  info: {},
  view: 'info' // info, new_document
});

export default docInfoStore;
