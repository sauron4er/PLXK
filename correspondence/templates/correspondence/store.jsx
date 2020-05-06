import { store } from '@risingstack/react-easy-state'

const corrStore = store({
  test: '1',
  requests: [],
  request: {
    client_id: 0,
    answer: '',
    new_eml_file: {},
    old_eml_file: {
      file: '',
      name: '',
      id: 0,
    },
    new_answer_files: [],
    old_answer_files: [],
    request_date: '',
  },
  laws: [],
  clients: [],
})

export default corrStore