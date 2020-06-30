'use strict';
import React from 'react';

class UserSelect extends React.Component {
  
  render() {
    const {users, user_name, onChange, field_name} = this.props;
  
    return (
      <div className='row align-items-center mt-1 mr-lg-1'>
        <label className='col-lg-2' htmlFor='user'>
          {field_name}
        </label>
        <select
          className='col-lg-10 form-control mx-3 mx-lg-0'
          id='user'
          name='user'
          value={user_name}
          onChange={onChange}
        >
          <option key={0} data-key={0} value='0'>
            ------------
          </option>
          {users.map((emp) => {
            return (
              <option key={emp.id} data-key={emp.id} value={emp.name}>
                {emp.name}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
  
  static defaultProps = {
    users: [],
    field_name: '',
    user_name: '',
    onChange: () => {}
  }
}

export default UserSelect;