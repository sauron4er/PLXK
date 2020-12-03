'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

class ChooseContract extends React.Component {
  state = {
    contracts: []
  };

  // отримуємо з бд список шефів
  componentDidMount() {
    axiosGetRequest('get_contracts/')
      .then((response) => {
        this.setState({contracts: response});
      })
      .catch((error) => notify(error));
  }

  render() {
    const {contracts} = this.state;
    const {name, id} = this.props.contract;
    const {fieldName, onChange} = this.props;
    
    return (
      <Choose>
        <When condition={contracts?.length > 0}>
        <label className='full_width' htmlFor='contract_select'>
          {fieldName}:
          <select
            id='contract_select'
            name='contract'
            className='form-control full_width'
            value={name}
            onChange={onChange}
          >
            <option key={0} data-key={0} value='0'>
              ------------
            </option>
            {contracts.map((contract) => {
              return (
                <option key={contract.id} data-key={contract.id} value={contract.name}>
                  {contract.name}
                </option>
              );
            })}
          </select>
        </label>
      </When>
        <Otherwise>
          <div className='mt-3 loader-small' id='loader-1'>
            {' '}
          </div>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    contract: [],
    fieldName: 'Основний Договір'
  };
}

export default ChooseContract;
