'use strict';
import * as React from 'react';
import {view} from '@risingstack/react-easy-state';
import corrTemplatesStore from "correspondence/templates/corr_templates/store";
import DxTable from "templates/components/tables/dx_table";
import CorrTemplate from "correspondence/templates/corr_templates/corr_template";

class CorrTemplates extends React.Component {
  state = {
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight});
    corrTemplatesStore.corr_templates = window.corr_templates;
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (row) => {
    corrTemplatesStore.corr_template.id = row.id;
    corrTemplatesStore.corr_template.name = row.name;
    corrTemplatesStore.corr_template.old_files = row.files;
  };

  render() {
    const {main_div_height} = this.state;
    const {corr_templates} = corrTemplatesStore;

    return (
      <div ref={this.getMainDivRef} className='d-md-flex mt-2'>
        <div className='col-md-6'>
          <DxTable
            rows={corr_templates}
            columns={[{name: 'name', title: 'Назва'}, {name: 'files', title: 'Файл'}]}
            defaultSorting={[{columnName: 'name', direction: 'asc'}]}
            onRowClick={this.onRowClick}
            height={main_div_height}
            filter
          />
        </div>
        <div className='col-md-6'>
          <CorrTemplate />
        </div>
      </div>
    );
  }
  
  static defaultProps = {
  
  }
}

export default view(CorrTemplates);
