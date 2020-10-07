import {store} from '@risingstack/react-easy-state';

const orgStructureStore = store({
  clicked_seat_id: 0,
  clicked_seat: '',
  modal_opened: false,
});

export default orgStructureStore;
