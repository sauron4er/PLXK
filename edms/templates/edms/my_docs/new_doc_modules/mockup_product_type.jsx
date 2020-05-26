'use strict';
import React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './store';
import {LoaderSmall} from 'templates/components/loaders';

class MockupProductType extends React.Component {
  state = {
    mockup_product_types: [],
    loading: true
  };

  componentDidMount() {
    axiosGetRequest('get_mockup_product_types/')
      .then((response) => {
        this.setState({
          mockup_product_types: response,
          loading: false
        });
      })
      .catch((error) => console.log(error));
  }

  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    newDocStore.mockup_product_type_id = event.target.options[selectedIndex].getAttribute('data-key');
    newDocStore.mockup_product_type_name = event.target.options[selectedIndex].getAttribute('value');
  };

  render() {
    const {fieldName} = this.props;
    const {loading, mockup_product_types} = this.state;

    return (
      <Choose>
        <When condition={!loading}>
          <div className='row align-items-center mt-1 mr-lg-1'>
            <label className='col-lg-3' htmlFor='mockup_type'>
              {fieldName}:
            </label>
            <select
              className='col-lg-9 form-control mx-3 mx-lg-0'
              id='mockup_type'
              name='mockup_type'
              value={newDocStore.mockup_product_type_name}
              onChange={this.onChange}
            >
              <option key={0} data-key={0} value='0'>
                ------------
              </option>
              {mockup_product_types.map((mptype) => {
                if (mptype.mockup_type_id == newDocStore.mockup_type_id) {
                  return (
                    <option key={mptype.id} data-key={mptype.id} value={mptype.name}>
                      {mptype.name}
                    </option>
                  );
                }
              })}
            </select>
          </div>
        </When>
        <Otherwise>
          <LoaderSmall />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    fieldName: '-'
  };
}

export default view(MockupProductType);
