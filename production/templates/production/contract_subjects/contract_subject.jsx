'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import contractSubjectsStore from './contract_subjects_store';
import TextInput from 'templates/components/form_modules/text_input';
import MultiSelectorWithList from 'templates/components/form_modules/multi_selector_with_list';

function ContractSubject(props) {
  function onNameChange(e) {
    contractSubjectsStore.contract_subject.name = e.target.value;
  }

  function editApprovalList(new_list) {
    contractSubjectsStore.contract_subject.approval_list = [...new_list];
  }

  function editToWorkList(new_list) {
    contractSubjectsStore.contract_subject.to_work_list = [...new_list];
  }

  return (
    <>
      <h5>
        <Choose>
          <When condition={props.id === 0}>Додавання нового предмету</When>
          <Otherwise>Редагування предмету договору</Otherwise>
        </Choose>
      </h5>
      <hr />
      <TextInput
        text={contractSubjectsStore.contract_subject.name}
        fieldName={'Назва'}
        onChange={onNameChange}
        maxLength={100}
        disabled={false}
      />
      <hr/>
      <MultiSelectorWithList
        list={contractSubjectsStore.employees}
        fieldName='Оберіть співробітників, яким документ піде на візування'
        onChange={editApprovalList}
        disabled={false}
      />
      <hr/>
      <MultiSelectorWithList
        list={contractSubjectsStore.employees}
        fieldName='Оберіть співробітників, яким документ піде на позначку "Прийнято в роботу"'
        onChange={editToWorkList}
        disabled={false}
      />
    </>
  );
}

ContractSubject.defaultProps = {
  id: 0,
  name: '',
  approval_list: [],
  to_work_list: []
};

export default view(ContractSubject);
