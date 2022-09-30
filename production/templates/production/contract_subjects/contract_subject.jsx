'use strict';
import React, {useState} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import contractSubjectsStore from './contract_subjects_store';
import TextInput from 'templates/components/form_modules/text_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify, notifySuccess} from 'templates/components/my_extras';
import MultiSelectorWithItemStatus from 'templates/components/form_modules/selectors/multi_selector_with_item_status';

function ContractSubject() {
  const [request_sent, setRequestSent] = useState(false);

  function onNameChange(e) {
    contractSubjectsStore.contract_subject.name = e.target.value;
  }

  function editApprovalList(new_list) {
    contractSubjectsStore.contract_subject.approval_list = [...new_list];
  }

  function editToWorkList(new_list) {
    contractSubjectsStore.contract_subject.to_work_list = [...new_list];
  }

  function postContractSubject() {
    setRequestSent(true);

    let formData = new FormData();
    formData.append('contract_subject', JSON.stringify(contractSubjectsStore.contract_subject));

    axiosPostRequest('post_contract_subject', formData)
      .then((response) => {
        location.reload();
        setRequestSent(false);
      })
      .catch((error) => {
        setRequestSent(false);
        notify('Не вдалося зберегти, зверніться до адміністратора');
      });
  }

  function delContractSubject() {
    let formData = new FormData();
    formData.append('id', JSON.stringify(contractSubjectsStore.contract_subject.id));

    axiosPostRequest('del_contract_subject', formData)
      .then((response) => {
        location.reload();
      })
      .catch((error) => {
        notify('Не вдалося видалити, зверніться до адміністратора');
      });
  }
  
  function fieldsAreValid() {
    const {approval_list, to_work_list, name} = contractSubjectsStore.contract_subject;
    
    const name_valid = !!name
    const lists_not_empty = !!approval_list.length && !!to_work_list.length;
    const at_least_one_not_deleted_approval = approval_list.some(approval => ['new', 'old'].includes(approval.status))
    const at_least_one_not_deleted_to_work = to_work_list.some(to_work => ['new', 'old'].includes(to_work.status))
  
    return name_valid && lists_not_empty && at_least_one_not_deleted_approval && at_least_one_not_deleted_to_work
  }
  
  return (
    <>
      <h5 className='mt-2'>
        <Choose>
          <When condition={contractSubjectsStore.contract_subject.id === 0}>Додавання нового предмету</When>
          <Otherwise>Редагування предмету договору</Otherwise>
        </Choose>
      </h5>
      <hr />
      <TextInput
        text={contractSubjectsStore.contract_subject.name}
        fieldName={'Назва'}
        onChange={onNameChange}
        maxLength={100}
        disabled={contractSubjectsStore.contract_subject.id !== 0}
      />
      <hr />
      <MultiSelectorWithItemStatus
        options={contractSubjectsStore.employees}
        selected={contractSubjectsStore.contract_subject.approval_list}
        fieldName='Оберіть співробітників, яким документ піде на візування'
        onChange={editApprovalList}
        disabled={false}
      />
      <hr />
      <MultiSelectorWithItemStatus
        options={contractSubjectsStore.employees}
        selected={contractSubjectsStore.contract_subject.to_work_list}
        fieldName='Оберіть співробітників, яким документ піде на позначку "Прийнято в роботу"'
        onChange={editToWorkList}
        disabled={false}
      />
      <hr />
      <div className='d-flex justify-content-between'>
        <SubmitButton className='btn-info'
                      text='Зберегти'
                      onClick={postContractSubject}
                      disabled={!fieldsAreValid()}
                      requestSent={request_sent} />
        <If condition={contractSubjectsStore.contract_subject.id !== 0}>
          <SubmitButton className='btn-outline-danger' text='Видалити' onClick={delContractSubject} />
        </If>
      </div>
    </>
  );
}

export default view(ContractSubject);
