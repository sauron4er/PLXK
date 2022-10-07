'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import contractSubjectsStore from './contract_subjects_store';
import DxTable from 'templates/components/tables/dx_table';
import ContractSubject from 'production/templates/production/contract_subjects/contract_subject';

class ContractSubjects extends React.Component {
  state = {
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight});
    contractSubjectsStore.contract_subjects = window.contract_subjects;
    contractSubjectsStore.employees = window.employees;
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (row) => {
    contractSubjectsStore.contract_subject = {...row};
  };

  render() {
    const {main_div_height} = this.state;
    const {contract_subjects} = contractSubjectsStore;

    return (
      <div ref={this.getMainDivRef} className='d-md-flex mt-2'>
        <div className='col-md-4'>
          <DxTable
            rows={contract_subjects}
            columns={[{name: 'name', title: 'Предмет договору'}]}
            defaultSorting={[{columnName: 'name', direction: 'asc'}]}
            onRowClick={this.onRowClick}
            height={main_div_height}
            filter
          />
        </div>
        <div className='col-md-8'>
          <ContractSubject />
        </div>
      </div>
    );
  }
}

export default view(ContractSubjects);
