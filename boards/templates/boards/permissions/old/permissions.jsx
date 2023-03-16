import * as React from 'react';
import ReactDOM from "react-dom";
import SelectorWithFilterAndAxios from "templates/components/form_modules/selectors/selector_with_filter_and_axios";
import DxTable from "templates/components/tables/dx_table";
import permissionsStore from "boards/templates/boards/permissions/permissions_store";


class Permissions extends React.Component {
  state = {
    permission_category: 0,
    permission_category_name: '',
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
    this.setState({main_div_height: this.mainDivRef.clientHeight});
  };

  onPermissionCategoryChange = (e) => {
    this.setState({
      permission_category: e.id,
      permission_category_name: e.name
    })
  }

  render() {
    const {permission_category, permission_category_name} = this.state;
    return (
      <div>

        <div ref={this.getMainDivRef} className='d-md-flex mt-2'>
            <div className='col-md-4'>
              table
              {/*<DxTable*/}
              {/*  rows={contract_subjects}*/}
              {/*  columns={[{name: 'name', title: 'Предмет договору'}]}*/}
              {/*  defaultSorting={[{columnName: 'name', direction: 'asc'}]}*/}
              {/*  onRowClick={this.onRowClick}*/}
              {/*  height={main_div_height}*/}
              {/*  filter*/}
              {/*/>*/}
            </div>
            <div className='col-md-8'>
              {/*<ContractSubject />*/}info
            </div>
          </div>
      </div>
    );
  }
}

ReactDOM.render(<Permissions />, document.getElementById('bundle'));
