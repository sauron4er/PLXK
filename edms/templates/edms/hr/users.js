'use strict';
import React, {Fragment} from 'react';
import axios from 'axios';
import DxTable from '../../../../templates/components/dx_table';
import User from './user';
import Vacations from './vacations';

axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class Users extends React.Component {
  state = {
    user_modal: false,
    user: {}
  };

  onRowClick = (row) => {
    axios({
      method: 'get',
      url: 'get_user/' + row.id + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        this.setState({
          user: {
            // інформація про натиснутий рядок
            id: row.id,
            emp: row.emp,
            tab_number: row.tab_number,
            on_vacation: row.on_vacation === 'true',
            acting: row.acting,
            acting_id: row.acting_id,
            vacation_checked: row.on_vacation === 'true',
            emp_seats: response.data.emp_seats,
            vacations: response.data.vacations
          }
        });
      })
      .then(() => {
        this.setState({user_modal: true});
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  onCloseModal = () => {
    this.setState({user_modal: false});
  };

  render() {
    const {user_modal, user} = this.state;
    const users_columns = [{name: 'emp', title: 'Ф.І.О.'}, {name: 'tab_number', title: 'Таб.ном.'}];
    const users_col_width = [{columnName: 'tab_number', width: 110}];

    return (
      <>
        <button
          type='button'
          className='btn btn-sm btn-outline-secondary mb-1 float-left'
          // onClick={this.onOpenModalNew}
        >
          Додати співробітника
        </button>
        <Vacations/>
        <div className='float-left'>
          <DxTable
            rows={this.props.emps}
            columns={users_columns}
            colWidth={users_col_width}
            defaultSorting={[{columnName: 'emp', direction: 'asc'}]}
            onRowClick={this.onRowClick}
            height={this.props.height}
            filter
          />
        </div>

        <If condition={user_modal}>
          <User
            emps={this.props.emps}
            seats={this.props.seats}
            user={user}
            onClose={this.onCloseModal}
          />
        </If>
      </>
    );
  }
}

export default Users;
