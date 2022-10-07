'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import 'static/css/files_uploader.css';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/doc_info_store';
import FilesUpload from 'templates/components/files_uploader/files_upload';
import { notify } from "templates/components/my_extras";
import MultiSelectorWithAxios from "templates/components/form_modules/selectors/multi_selector_with_axios";

class PostSignedFiles extends React.Component {
  onSubmit = () => {
    if (docInfoStore.signed_files.length === 0) {
      notify('Ви не додали жодного файлу');
    } else if (docInfoStore.inform_employees && !docInfoStore.employees_to_inform.length) {
      notify('Ви не додали жодного співробітника');
    } else {
      this.props.onSubmit();
    }
  };

  onClose = () => {
    this.props.onCloseModal();
  };

  onFilesChange = (e) => {
    docInfoStore.signed_files = e.target.value;
  };
  
  informEmployees = () => {
    docInfoStore.inform_employees = !docInfoStore.inform_employees;
  }
  
  onEmployeesChange = (list) => {
    docInfoStore.employees_to_inform = list;
  };

  render() {
    return (
      <>
        <div className='modal-header d-flex justify-content-between'>
          <h5 className='modal-title font-weight-bold'>Додавання скан-копій підписаних документів</h5>
          <button className='btn btn-link' onClick={this.onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className='modal-body'>
          <FilesUpload onChange={this.onFilesChange} files={docInfoStore.signed_files} module_info={{field_name: ''}} />
          <hr />
          <div className='form-check'>
            <input
              className='form-check-input'
              type='checkbox'
              value=''
              id='inform_checkbox'
              checked={docInfoStore.inform_employees}
              onChange={this.informEmployees}
            />
            <label className='form-check-label' htmlFor='inform_checkbox'>
              Інформувати співробітників про підписання договору
            </label>
          </div>
          <If condition={docInfoStore.inform_employees}>
            <MultiSelectorWithAxios
              listNameForUrl='employees'
              onChange={this.onEmployeesChange}
              disabled={false} />
          </If>
        </div>
        <div className='modal-footer'>
          <small>Після додавання скан-копій підписаних документів даний Договір потрапить у список Договорів на відповідній сторінці</small>
          <button className='btn btn-outline-info ml-1' onClick={this.onSubmit}>
            Зберегти зміни
          </button>
        </div>
      </>
    );
  }

  static defaultProps = {
    onCloseModal: {}
  };
}

export default view(PostSignedFiles);