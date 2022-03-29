'use strict';
import * as React from 'react';
import Select from 'react-select';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';

class DocTypeVersion extends React.Component {
  state = {
    doc_type_versions: []
  };

  componentDidMount() {
    axiosGetRequest(`get_doc_type_versions/${newDocStore.new_document.doc_type_id}`)
      .then((response) => {
        this.setState({doc_type_versions: response});
      })
      .catch((error) => console.log(error));
  }

  onSelectChange = (e) => {
    newDocStore.new_document.doc_type_version = e.id;
    newDocStore.new_document.doc_type_version_name = e.name;
  };

  render() {
    const {module_info} = this.props;
    const {doc_type_versions} = this.state;

    return (
      <div>
        <label className='mr-1 full_width'>
          <If condition={module_info.required}>{'* '}</If>
          {module_info.field_name}:
          <br/>
        

        <Select
          options={doc_type_versions}
          onChange={this.onSelectChange}
          value={{name: newDocStore.new_document.doc_type_version_name, id: newDocStore.new_document.doc_type_version}}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.id}
        />
        </label>
        
        <small className='text-danger'>{module_info?.additional_info}</small>
      </div>
    );
  }

  static defaultProps = {
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default view(DocTypeVersion);
