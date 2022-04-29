import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import TextInput from 'templates/components/form_modules/text_input';
import CompanyChoose from "templates/components/form_modules/company_choose";
import SubmitButton from 'templates/components/form_modules/submit_button';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

function NewDepartment(props) {
  const [state, setState] = useSetState({
    name: '',
    company: 'ТДВ',
  });

  function onNameChange(e) {
    setState({name: e.target.value});
  }

  function onCompanyChange(company) {
    setState({company});
  }

  function addDepartment() {
    let formData = new FormData();
    formData.append('id', state.id);
    formData.append('name', state.name);
    formData.append('company', state.company);

    axiosPostRequest(`post_department/`, formData)
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  }

  return (
    <>
      <div className='modal-header'>
        <h3>Новий відділ</h3>
      </div>
      <div className='modal-body'>
        <CompanyChoose fieldName='Підприємство' onChange={onCompanyChange} company={state.company} id='new_dep' />
        <hr />
        <TextInput fieldName='Назва' text={state.name} disabled={false} maxLength={200} onChange={onNameChange} />
      </div>
      <div className='modal-footer'>
        <SubmitButton className='btn-outline-info' text='Зберегти' onClick={addDepartment} disabled={!state.name} />
      </div>
    </>
  );
}

export default NewDepartment;
