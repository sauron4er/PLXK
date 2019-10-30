'use strict';
import React from 'react';
import axios from 'axios';

class SubEmpChooser extends React.PureComponent {
  state = {
    sub_emps: [],
    sub_emp: this.props.subEmp
  };

  componentDidMount() {
    const seat_id = parseInt(
      localStorage.getItem('my_seat') ? localStorage.getItem('my_seat') : window.my_seats[0].id
    );
    
    axios({
      method: 'get',
      url: 'get_sub_emps/' + seat_id + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        if (response.data) {
          this.setState({
            sub_emps: response.data
          });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  onChange = (event) => {
    if (event.target.name === 'sub_emp') {
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        sub_emp: {
          id: parseInt(event.target.options[selectedIndex].getAttribute('data-key')),
          sub_emp: event.target.options[selectedIndex].getAttribute('value')
        }
      });
      this.props.changeSubEmp({
        id: parseInt(event.target.options[selectedIndex].getAttribute('data-key')),
        sub_emp: event.target.options[selectedIndex].getAttribute('value')
      });
    }
  };

  render() {
    const {sub_emps, sub_emp} = this.state;
    const {label} = this.props;

    return (
      <form className='form-inline'>
        <div className='form-group mb-1'>
          <label className='font-weight-bold mr-1'>{label}</label>
          <select
            className='form-control-sm bg-white'
            id='sub-emp-select'
            name='sub_emp'
            value={sub_emp.sub_emp}
            onChange={this.onChange}
          >
            <option key={0} data-key={0} value={''}>
              ---------------------
            </option>
            {sub_emps.map((sub_emp) => {
              return (
                <option key={sub_emp.id} data-key={sub_emp.id} value={sub_emp.emp + ', ' + sub_emp.seat}>
                  {sub_emp.emp + ', ' + sub_emp.seat}
                </option>
              );
            })}
          </select>
        </div>
      </form>
    );
  }

  static defaultProps = {
    label: 'Підлеглий',
    subEmp: {
      id: 0,
      sub_emp: ''
    }
  };
}

export default SubEmpChooser;
