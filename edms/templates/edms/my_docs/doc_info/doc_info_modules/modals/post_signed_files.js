'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import 'static/css/files_uploader.css';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/doc_info_store';
import FilesUpload from 'templates/components/files_uploader/files_upload';
import {notify} from 'templates/components/my_extras';

class PostSignedFiles extends React.Component {

  onSubmit = () => {
    if (docInfoStore.signed_files.length === 0) {
      notify('Ви не додали жодного файлу');
    } else {
      this.props.onSubmit();
    }
  };

  onClose = () => {
    this.props.onCloseModal();
  };
  
  onChange = (e) => {
    docInfoStore.signed_files = e.target.value;
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
          <FilesUpload onChange={this.onChange} files={docInfoStore.signed_files}/>
        </div>

        <div className='modal-footer'>
          <small>Після додавання скан-копій підписаних документів даний Договір потрапить у список Договорів на відповідній сторінці</small>
          <button className='btn btn-outline-success ml-1' onClick={this.onSubmit}>
            Зберегти зміни
          </button>
        </div>
      </>
    );
  }

  static defaultProps = {
    onCloseModal: {},
  };
}

export default view(PostSignedFiles);
