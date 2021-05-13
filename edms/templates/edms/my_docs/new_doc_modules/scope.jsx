'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import {LoaderSmall} from 'templates/components/loaders';

class Scope extends React.Component {
  state = {
    scopes: [],
    loading: true
  };

  componentDidMount() {
    axiosGetRequest('get_scopes')
      .then((response) => {
        this.setState({
          scopes: response,
          loading: false
        });
      })
      .catch((error) => console.log(error));
  }

  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    newDocStore.new_document.scope = event.target.options[selectedIndex].getAttribute('data-key');
    newDocStore.new_document.scope_name = event.target.options[selectedIndex].getAttribute('value');
  };

  render() {
    const {module_info} = this.props;
    const {loading, scopes} = this.state;
  
    return (
      <Choose>
        <When condition={!loading}>
          <div className='row align-items-center mt-1 mr-lg-1'>
            <label className='col-lg-4' htmlFor='scope'>
              <If condition={module_info.required}>{'* '}</If> {module_info.field_name}:
            </label>
            <select
              className='col-lg-8 form-control mx-3 mx-lg-0'
              id='scope'
              name='scope'
              value={newDocStore.new_document.scope_name}
              onChange={this.onChange}
            >
              <option key={0} data-key={0} value='0'>
                ------------
              </option>
              {scopes.map((scope) => {
                return (
                  <option key={scope.id} data-key={scope.id} value={scope.name}>
                    {scope.name}
                  </option>
                );
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
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    },
  };
}

export default view(Scope);
