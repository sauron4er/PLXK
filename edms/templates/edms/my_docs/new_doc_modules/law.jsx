'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import {LoaderSmall} from 'templates/components/loaders';

class Law extends React.Component {
  state = {
    laws: [],
    laws_filtered_by_scope: [],
    loading: true
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.scope !== this.props.scope) this.getLawsByScope();
  }

  componentDidMount() {
    axiosGetRequest('get_laws')
      .then((response) => {
        this.setState({
          laws: response,
          loading: false
        }, () => this.getLawsByScope());
      })
      .catch((error) => console.log(error));
  }

  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    newDocStore.new_document.law = event.target.options[selectedIndex].getAttribute('data-key');
    newDocStore.new_document.law_name = event.target.options[selectedIndex].getAttribute('value');
  };

  getLawsByScope = () => {
    let laws = [];

    for (const i in this.state.laws) {
      for (const j in this.state.laws[i].scopes) {
        if (this.state.laws[i].scopes[j].id == newDocStore.new_document.scope) {
          laws.push(this.state.laws[i]);
          break;
        }
      }
    }
  
    this.setState({laws_filtered_by_scope: laws})
  };

  render() {
    const {module_info} = this.props;
    const {loading, laws_filtered_by_scope} = this.state;
  
    return (
      <Choose>
        <When condition={!loading}>
          <div className='row align-items-center mt-1 mr-lg-1'>
            <label className='col-lg-4' htmlFor='law'>
              <If condition={module_info.required}>{'* '}</If> {module_info.field_name}:
            </label>
            <select
              className='col-lg-8 form-control mx-3 mx-lg-0'
              id='law'
              name='law'
              value={newDocStore.new_document.law_name}
              onChange={this.onChange}
            >
              <option key={0} data-key={0} value='0'>
                ------------
              </option>
              {laws_filtered_by_scope.map((law) => {
                return (
                  <option key={law.id} data-key={law.id} value={law.name}>
                    {law.name}
                  </option>
                );
              })}
            </select>
          </div>
          <small className='text-danger'>{module_info?.additional_info}</small>
          <small>
            Якщо потрібного законодавства нема в списку, його можна додати на сторінці{' '}
            <a href={`${window.location.origin}/correspondence/`} target='_blank'>
              Листування з клієнтами
            </a>{' '}
            у вкладці "Законодавство".
          </small>
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
    scope: 0
  };
}

export default view(Law);
