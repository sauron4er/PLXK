import {store} from '@risingstack/react-easy-state';

const ordersStore = store({
  view: 'table', //, order, calendar, constant_calendar
  orders: [],
  order: {
    id: 0,
    type: 0,
    type_name: '',
    code: '',
    name: '',
    articles: [],
    files: [],
    files_old: [],
    author: '0',
    author_name: '',
    responsible: '0',
    responsible_name: '',
    supervisory: '0',
    supervisory_name: '',
    date_start: '',
    date_canceled: '',
    canceled_by_code: '',
    canceled_by_id: '0',
    cancels_code: '',
    cancels_files: [],
    cancels_files_old: [],
    cancels_other_doc: false,
    cancels_id: '0',
    mail_mode: 'to_default',
    mail_list: [],
    status: 'in progress',
    done: false
  },
  employees: [],
  emp_seats: [],
  types: [],
  is_orders_admin: false,

  clearOrder: () => {
    ordersStore.order = {
      id: 0,
      type: 0,
      type_name: '',
      code: '',
      name: '',
      files: [],
      files_old: [],
      author: '0',
      author_name: '',
      responsible: '0',
      responsible_name: '',
      supervisory: '0',
      supervisory_name: '',
      date_start: '',
      date_canceled: '',
      canceled_by_id: '0',
      canceled_by_code: '',
      cancels_id: '0',
      cancels_code: '',
      cancels_files: [],
      cancels_files_old: [],
      cancels_other_doc: false,
      mail_mode: 'none',
      mail_list: [],
      articles: [],
      status: 'in progress',
      done: false
    };
  }
});

export default ordersStore;
