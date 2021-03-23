'use strict';
import * as React from 'react';
import Select from 'react-select';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import {LoaderSmall} from 'templates/components/loaders';

class Counterparty extends React.Component {
  state = {
    counterparties: [],
    loading: true
  };

  componentDidMount() {
    axiosGetRequest('get_counterparties_for_select/')
      .then((response) => {
        this.setState({
          counterparties: response,
          loading: false
        });
      })
      .catch((error) => console.log(error));
  }

  onSelectChange = (e) => {
    newDocStore.new_document.counterparty = e.value;
    newDocStore.new_document.counterparty_name = e.label;
  };

  render() {
    const {module_info} = this.props;
    const {loading, counterparties} = this.state;
  
    console.log(window.location);
  
    return (
      <Choose>
        <When condition={!loading}>
          <div>- radio Клієнт-Постачальник, яке фільтрує загальний список</div>
          <Select options={counterparties} onChange={this.onSelectChange} />
          <small>
            Якщо потрібного контрагента нема в списку, його можна додати на сторінці{' '}
            <a href={`${window.location.origin}/boards/providers/`} target='_blank'>
              Постачальники
            </a>{' '}
            або{' '}
            <a href={`${window.location.origin}/boards/clients/`} target='_blank'>
            {/*<a href={'http://127.0.0.1:8000/boards/clients/'} target='_blank'>*/}
              Клієнти
            </a>
            . Якщо у вас нема прав на додавання контрагента у базу, зверніться до адміністратора
          </small>
          <small className='text-danger'>{module_info?.additional_info}</small>
        </When>
        <Otherwise>
          <LoaderSmall />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    counterparty: [],
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default view(Counterparty);
