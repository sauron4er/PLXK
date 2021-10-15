import * as React from 'react';
import ReactDOM from 'react-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Employee from "accounts/templates/accounts/employees/employee";
import { ToastContainer } from "react-toastify";

class Employees extends React.Component {
  state = {
    employee: {
      id: 0,
      pip: '',
      tab_number: '',
      department: 0,
      department_name: ''
    },
    filter: '',
    employees: [],
    modal_opened: false
  };

  componentDidMount() {
    this.setState({employees: [...window.employees]});
  }

  filterChange = (e) => {
    const filter = e.target.value.toLowerCase();
    let employees = [...window.employees];
    
    employees = employees.filter((item) => {
      
      return (
        item.pip.toLowerCase().indexOf(filter) !== -1 || item.tab_number.indexOf(filter) !== -1 || item.department_name.indexOf(filter) !== -1
      );
    });
    this.setState({
      filter: e.target.value,
      employees: [...employees]
    });
  };

  onRowClick = (item) => {
    this.setState({
      employee: item,
      modal_opened: true
    });
  };
  
  onClick = (e) => {
    this.setState({modal_opened: true});
  };
  
  closeModal = () => {
    this.setState({
      employee: {
        id: 0,
        pip: '',
        tab_number: '',
        department: 0,
        department_name: ''
      },
      modal_opened: false
    })
  };

  render() {
    const {employees, employee, filter, modal_opened} = this.state;
    return (
      <>
        <h4 className='mt-1'>Список співробітників</h4>
        <div className='mb-1'>
          <label>Пошук</label>
          <input className='ml-2' value={filter} onChange={this.filterChange} />
          <button className='btn btn-sm btn-secondary float-right' onClick={this.onClick}>Додати співробітника</button>
        </div>
        <table className='table table-sm table-striped table-hover table-bordered'>
          <thead className='thead-light'>
            <tr>
              <th>П.І.Б.</th>
              <th>Таб. номер</th>
              <th>Відділ</th>
              <th> </th>
            </tr>
          </thead>
          <tbody>
            <For each='item' of={employees} index='index'>
              <tr key={index}>
                <td className='align-middle'>{item.pip}</td>
                <td className='align-middle'>{item.tab_number}</td>
                <td className='align-middle'>{item.department_name}</td>
                <th>
                  <button className='btn btn-sm' onClick={() => this.onRowClick(item)}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </th>
              </tr>
            </For>
          </tbody>
        </table>
        <Modal
          open={modal_opened}
          onClose={() => this.closeModal()}
          closeOnOverlayClick={false}
          styles={{modal: {marginTop: 100}}}
        >
          <Employee employee={employee} />
        </Modal>
        
        {/*Вспливаюче повідомлення*/}
        <ToastContainer />
      </>
    );
  }
}

ReactDOM.render(<Employees />, document.getElementById('employees'));
