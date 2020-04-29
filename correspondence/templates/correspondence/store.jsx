import { store } from '@risingstack/react-easy-state'

const corrStore = store({
  test: '1',
  requests: [],
  request: {
    client_id: 0,
    answer: ''
  },
  laws: [],
  clients: [],
})

export default corrStore