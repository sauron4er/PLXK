'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
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
    newDocStore.new_document.mockup_product_type = event.target.options[selectedIndex].getAttribute('data-key');
    newDocStore.new_document.mockup_product_type_name = event.target.options[selectedIndex].getAttribute('value');
  };

  render() {
    const {module_info} = this.props;
    const {loading, mockup_product_types} = this.state;

    return (
      <Choose>
        <When condition={!loading}>
          <div className='row align-items-center mt-1 mr-lg-1'>
            <label className='col-lg-4' htmlFor='mockup_product_type'>
              {module_info.field_name}:
            </label>
            <select
              className='col-lg-8 form-control mx-3 mx-lg-0'
              id='mockup_product_type'
              name='mockup_product_type'
              value={newDocStore.new_document.mockup_product_type_name}
              onChange={this.onChange}
            >
              <option key={0} data-key={0} value='0'>
                ------------
              </option>
              {mockup_product_types.map((mptype) => {
                if (mptype.mockup_type_id == newDocStore.new_document.mockup_type) {
                  return (
                    <option key={mptype.id} data-key={mptype.id} value={mptype.name}>
                      {mptype.name}
                    </option>
                  );
                }
              })}
            </select>
          </div>
          <small className='text-danger'>{module_info?.additional_info}</small>
        </When>
        <Otherwise>
          <LoaderSmall />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    mockup_product_type: [],
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    },
  };
}

export default view(MockupProductType);
