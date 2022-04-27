import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import TextInput from 'templates/components/form_modules/text_input';
import CompanyChoose from 'templates/components/form_modules/choose_company';
import SubmitButton from 'templates/components/form_modules/submit_button';

function NewDepartment(props) {
  const [state, setState] = useSetState({
    name: '',
    company: '',
    commentary: ''
  });

  function onNameChange() {}

  function onCompanyChange(e) {
    e.target.value === 'ТДВ' ? setState({company: 'TDV'}) : setState({company: 'TOV'});
  }

  function onCommentaryChange() {}

  function addDepartment() {}

  return (
    <>
      <div className='modal-header'>
        <h3>Новий відділ</h3>
      </div>
      <div className='modal-body'>
        <TextInput text={state.name} disabled={false} placeholder='Назва' maxLength={200} onChange={onNameChange} />
        <hr />
        <CompanyChoose fieldName='Підприємство' onChange={onCompanyChange} company={state.company} />
        <hr />
        <TextInput text={state.commentary} disabled={false} placeholder='Коментар' maxLength={4000} onChange={onCommentaryChange} />
      </div>
      <div className='modal-footer'>
        <SubmitButton className='btn-outline-info' text='Зберегти' onClick={addDepartment} />
      </div>
    </>
  );
}

export default NewDepartment;
