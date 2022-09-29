'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import contractSubjectsStore from './contract_subjects_store';
import DxTable from 'templates/components/tables/dx_table';
import ContractSubject from 'production/templates/production/contract_subjects/contract_subject';

class ContractSubjects extends React.Component {
  state = {
    clicked_subject_id: 0,
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight});
    contractSubjectsStore.contract_subjects = window.contract_subjects;
    contractSubjectsStore.employees = window.employees;
    console.log(window.employees);
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (row) => {
    this.setState({clicked_subject_id: row.id})
    contractSubjectsStore.contract_subject.name = row.name;
    contractSubjectsStore.contract_subject.approval_list = row.approval_list;
    contractSubjectsStore.contract_subject.to_work_list = row.to_work_list;
  };

  render() {
    const {main_div_height, clicked_subject_id} = this.state;

    return (
      <div ref={this.getMainDivRef} className='d-flex mt-2'>
        <div className='col-4'>
          <DxTable
            rows={contractSubjectsStore.contract_subjects}
            columns={[{name: 'name', title: 'Предмет договору'}]}
            defaultSorting={[{columnName: 'name', direction: 'asc'}]}
            onRowClick={this.onRowClick}
            height={main_div_height}
            filter
          />
        </div>
        <div className='col-8'>
          <ContractSubject id={clicked_subject_id} />
        </div>
      </div>
    );
  }
}

export default view(ContractSubjects);
