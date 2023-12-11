import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import 'css/org_structure.css';
import TextInput from 'templates/components/form_modules/text_input';
import SubmitButton from "templates/components/form_modules/submit_button";
import {axiosPostRequest} from "templates/components/axios_requests";
import {notify} from "templates/components/my_extras";
import Files from "templates/components/form_modules/files";
import SelectorWithFilterAndAxios from "templates/components/form_modules/selectors/selector_with_filter_and_axios";


function NewSeat(props) {
  const [state, setState] = useSetState({
    name: '',
    chief: 0,
    chief_name: '',
    is_dep_chief: false,
    instructions_files: ''
  });

  function onNameChange(e) {
    setState({name: e.target.value});
  }

  function onChiefChange (e) {
    setState({
      chief: e.id,
      chief_name: e.name
    });
  }

  function onFileChange (e) {
    setState({instructions_files: e.target.value});
  }

  // TODO Перевірка, чи вже обраний начальник відділу і повернення помилки

  function addSeat() {
    let formData = new FormData();

    formData.append('name', state.name);
    formData.append('department_id', props.department);
    formData.append('chief_id', state.chief);
    formData.append('is_dep_chief', state.is_dep_chief);
    formData.append('instructions_file', state.instructions_files);

    axiosPostRequest(`post_seat/`, formData)
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  }

  return (
    <>
      <div className='modal-body'>
        <TextInput fieldName='Назва' text={state.name} disabled={false} maxLength={200} onChange={onNameChange} />
        <hr />
        <SelectorWithFilterAndAxios
          listNameForUrl='seats_for_select'
          fieldName='Керівник цієї посади'
          selectId='chief_select'
          value={{name: state.chief_name, id: state.chief}}
          onChange={onChiefChange}
          disabled={false}
        />
        <hr/>
        <Files
          newFiles={state.instructions_files}
          fieldName='Завантажити посадову інструкцію'
          onChange={onFileChange}
          disabled={false}
        />
      </div>
      <div className='modal-footer'>
        <SubmitButton className='btn-outline-info' text='Зберегти' onClick={addSeat} disabled={
          !state.name || !state.chief_id} />
      </div>
    </>
  );
}

NewSeat.defaultProps = {
  department: 0
};

export default NewSeat;
