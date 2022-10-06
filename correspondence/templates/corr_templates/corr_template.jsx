'use strict';
import React, {useState} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrTemplatesStore from "correspondence/templates/corr_templates/store";
import TextInput from 'templates/components/form_modules/text_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify, notifySuccess} from 'templates/components/my_extras';
import Files from "templates/components/form_modules/files";

function CorrTemplate() {
  const [request_sent, setRequestSent] = useState(false);

  function onNameChange(e) {
    corrTemplatesStore.corr_template.name = e.target.value;
  }
  
  function onFilesChange(e) {
    corrTemplatesStore.corr_template.new_files = e.target.value;
  }
  
  function onFilesDelete(id) {
    // Необхідно проводити зміни через додаткову перемінну,
    // бо react-easy-state не помічає змін глибоко всередині перемінних, як тут.
    let old_files = [...corrTemplatesStore.corr_template.old_files];
    for (const i in old_files) {
      if (old_files[i].id === id) {
        old_files[i].status = 'delete';
        break;
      }
    }
    corrTemplatesStore.corr_template.old_files = [...old_files];
  }
  
  function postCorrTemplate() {
    setRequestSent(true);

    let formData = new FormData();
    formData.append('corr_template', JSON.stringify(corrTemplatesStore.corr_template));
    formData.append('old_files', JSON.stringify(corrTemplatesStore.corr_template.old_files));
    
    if (corrTemplatesStore.corr_template.new_files?.length) {
        corrTemplatesStore.corr_template.new_files.map((file) => {
          formData.append('new_files', file);
        });
      }
    
    axiosPostRequest('post_corr_template', formData)
      .then((response) => {
        location.reload();
        setRequestSent(false);
      })
      .catch((error) => {
        setRequestSent(false);
        notify('Не вдалося зберегти, зверніться до адміністратора');
      });
  }

  function delCorrTemplate() {
    let formData = new FormData();
    formData.append('id', JSON.stringify(corrTemplatesStore.corr_template.id));

    axiosPostRequest('del_corr_template', formData)
      .then((response) => {
        location.reload();
      })
      .catch((error) => {
        notify('Не вдалося видалити, зверніться до адміністратора');
      });
  }
  
  function fieldsAreValid() {
    const {name, file} = corrTemplatesStore.corr_template;
    
    const name_valid = !!name
    const file_added = corrTemplatesStore.corr_template.new_files.length ||
      corrTemplatesStore.corr_template.old_files.length;
  
    return name_valid && file_added
  }
  
  return (
    <>
      <h5 className='mt-2'>
        <Choose>
          <When condition={corrTemplatesStore.corr_template.id === 0}>Новий шаблон</When>
          <Otherwise>Редагування шаблону</Otherwise>
        </Choose>
      </h5>
      <hr />
      <TextInput
        text={corrTemplatesStore.corr_template.name}
        fieldName={'Назва'}
        onChange={onNameChange}
        maxLength={100}
        disabled={!window.editable}
      />
      <hr />
      <Files
        oldFiles={corrTemplatesStore.corr_template.old_files}
        newFiles={corrTemplatesStore.corr_template.new_files}
        fieldName={'Файли'}
        onChange={onFilesChange}
        onDelete={onFilesDelete}
        disabled={!window.editable}
      />
      <hr/>
      <If condition={window.editable}>
        <div className="d-flex justify-content-between">
          <SubmitButton className="btn-info"
                        text="Зберегти"
                        onClick={postCorrTemplate}
                        disabled={!fieldsAreValid()}
                        requestSent={request_sent} />
          <If condition={corrTemplatesStore.corr_template.id !== 0}>
            <SubmitButton className="btn-outline-danger" text="Видалити" onClick={delCorrTemplate} />
          </If>
        </div>
      </If>
    </>
  );
}

export default view(CorrTemplate);
