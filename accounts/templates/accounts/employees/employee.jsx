import * as React from 'react';
import { axiosGetRequest, axiosPostRequest } from "templates/components/axios_requests";
import {notify} from 'templates/components/my_extras';
import TextInput from 'templates/components/form_modules/text_input';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selector_with_filter_and_axios';


class Employee extends React.Component {
  state = {
    id: 0,
    pip: '',
    tab_number: '',
    department: 0,
    department_name: '',
    is_pc_user: 'true'
  };

  componentDidMount() {
    const {employee} = this.props;
    this.setState({
      id: employee.id,
      pip: employee.pip,
      tab_number: employee.tab_number,
      department: employee.department,
      department_name: employee.department_name,
      is_pc_user: employee.is_pc_user
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.employee.id !== prevProps.employee.id) {
      this.setState({employee: {...this.props.employee}});
    }
  }

  onPipChange = (e) => {
    this.setState({pip: e.target.value});
  };

  onTabNumberChange = (e) => {
    this.setState({tab_number: e.target.value});
  };

  onDepartmentChange = (e) => {
    this.setState({
      department: e.id,
      department_name: e.name
    });
  };

  saveChanges = () => {
    const {id, pip, tab_number, department} = this.state;
    let formData = new FormData();
    formData.append('id', id);
    formData.append('pip', pip);
    formData.append('tab_number', tab_number);
    formData.append('department', department);
    axiosPostRequest('save_employee', formData)
      .then((response) => {
        if (response === 'ok') location.reload();
        else notify(response);
      })
      .catch((error) => notify(error));
  };
  
  deactEmployee = () => {
    axiosGetRequest(`deact_employee/${this.state.id}`)
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  };

  render() {
    const {id, pip, tab_number, department, department_name, is_pc_user} = this.state;
    return (
      <>
        <h4 className='mt-4'>{pip}</h4>
        <If condition={id !== 0 && is_pc_user === 'false'}>
          <button className='btn btn-sm btn-outline-danger' onClick={this.deactEmployee}>
            Видалити
          </button>
        </If>
        <hr/>
        <SelectorWithFilterAndAxios
          listNameForUrl='departments'
          fieldName='Відділ'
          selectId='department_select'
          value={{name: department_name, id: department}}
          onChange={this.onDepartmentChange}
          disabled={false}
        />
        <TextInput text={pip} fieldName='П.І.Б.' onChange={this.onPipChange} maxLength={100} disabled={false} />
        <TextInput text={tab_number} fieldName='Табельний номер' onChange={this.onTabNumberChange} maxLength={15} disabled={false} />

        <button className='btn btn-outline-primary mt-3 float-right' onClick={this.saveChanges} disabled={!pip || !tab_number || !department}>
          Зберегти зміни
        </button>
        
        
      </>
    );
  }

  static defaultProps = {
    employee: {
      id: 0,
      pip: '',
      tab_number: '',
      department: 0,
      department_name: '',
      is_pc_user: 'true'
    }
  };
}

export default Employee;
