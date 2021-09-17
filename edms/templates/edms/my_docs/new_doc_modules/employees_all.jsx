'use strict';
import * as React from 'react';
import Select from 'react-select';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';

class EmployeesAll extends React.Component {
  state = {
    employees: []
  };

  componentDidMount() {
    axiosGetRequest(`get_all_employees`)
      .then((response) => {
        this.setState({employees: response});
      })
      .catch((error) => console.log(error));
  }

  onSelectChange = (e) => {
    newDocStore.new_document.employee = e.id;
    newDocStore.new_document.employee_name = e.name;
  };

  render() {
    const {module_info} = this.props;
    const {employees} = this.state;
  
    return (
      <div>
        <label className='mr-1'>
          <If condition={module_info.required}>{'* '}</If>
          {module_info.field_name}:
        </label>
        <br />

        <Select
          options={employees}
          onChange={this.onSelectChange}
          value={{name: newDocStore.new_document.employee_name, id: newDocStore.new_document.employee}}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.id}
        />
        
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

export default view(EmployeesAll);
