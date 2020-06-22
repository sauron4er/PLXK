import {store} from '@risingstack/react-easy-state';

const docInfoStore = store({
  doc: {},
  info: {},
  view: 'info', // info, new_document
  comment_to_answer: {
    id: 0,
    author: '',
    text: ''
  }
});

export default docInfoStore;
