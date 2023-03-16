'use strict';
import * as React from 'react';
import permissionsStore from "boards/templates/boards/permissions/old/permissions_store";
import ReactDOM from "react-dom";

import Permission from "boards/templates/boards/permissions/permission";
import PermissionsTable from "boards/templates/boards/permissions/table";

class Permissions extends React.Component {
  componentDidMount() {
    permissionsStore.main_div_height = this.mainDivRef.clientHeight - 30; // розмір головного div, з якого вираховується розмір таблиць
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (clicked_row) => {
    permissionsStore.permission = clicked_row;
    permissionsStore.permission_view = true;
  };

  onPermissionClose = () => {
    permissionsStore.clearPermission();
    permissionsStore.permission_view = false;
  };

  render() {
    const {permission_view, permission} = permissionsStore;

    return (
      <Choose>
        <When condition={!permission_view}>
          <div className='mt-1'>
            <button onClick={() => (permissionsStore.permission_view = true)} className='btn btn-sm btn-info mt-2'>
              Додати Дозвіл
            </button>
          </div>

          <div className='row mt-2' ref={this.getMainDivRef}>
            <PermissionsTable />
          </div>
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-info my-2' onClick={() => this.onPermissionClose()}>
            Назад
          </button>
          <br />
          <Permission
            id={permission.id}
            close={this.onPermissionClose}
          />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    counterparty_filter: 0,
    counterparty_name: ''
  };
}

ReactDOM.render(<Permissions />, document.getElementById('bundle'));
