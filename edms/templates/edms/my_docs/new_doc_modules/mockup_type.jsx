'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import {LoaderSmall} from 'templates/components/loaders';

class MockupType extends React.Component {
  state = {
    mockup_types: [],
    loading: true
  };

  componentDidMount() {
    axiosGetRequest('get_mockup_types/')
      .then((response) => {
        this.setState({
          mockup_types: response,
          loading: false
        });
      })
      .catch((error) => console.log(error));
  }

  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    newDocStore.new_document.mockup_type = event.target.options[selectedIndex].getAttribute('data-key');
    newDocStore.new_document.mockup_type_name = event.target.options[selectedIndex].getAttribute('value');
  };

  render() {
    const {fieldName} = this.props;
    const {loading, mockup_types} = this.state;
  
    return (
      <Choose>
        <When condition={!loading}>
          <div className='row align-items-center mt-1 mr-lg-1'>
            <label className='col-lg-4' htmlFor='mockup_type'>
              {fieldName}:
            </label>
            <select
              className='col-lg-8 form-control mx-3 mx-lg-0'
              id='mockup_type'
              name='mockup_type'
              value={newDocStore.new_document.mockup_type_name}
              onChange={this.onChange}
            >
              <option key={0} data-key={0} value='0'>
                ------------
              </option>
              {mockup_types.map((mtype) => {
                return (
                  <option key={mtype.id} data-key={mtype.id} value={mtype.name}>
                    {mtype.name}
                  </option>
                );
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
    mockup_type: [],
    fieldName: '-'
  };
}

export default view(MockupType);
