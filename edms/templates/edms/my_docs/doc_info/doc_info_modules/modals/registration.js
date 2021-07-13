'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import 'static/css/files_uploader.css';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/doc_info_store';

class RegistrationModal extends React.Component {
  
  onSubmit = () => {
      this.props.onSubmit();
  };

  onClose = () => {
    this.props.onCloseModal();
  };

  onChange = (e) => {
    docInfoStore.info.registration_number = e.target.value;
  };

  render() {
    const {registration_number} = docInfoStore.info

    return (
      <>
        <div className='modal-header d-flex justify-content-between'>
          <h5 className='modal-title font-weight-bold'>Реєстрація документа</h5>
          <button className='btn btn-link' onClick={this.onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className='modal-body'>
          <label htmlFor='registration_modal'>Реєстраційний номер:</label>
          <input
              className='form-control mr-1'
              name='registration'
              id='registration_modal'
              value={registration_number}
              onChange={this.onChange}
              maxLength={5000}
            />
        </div>
        <div className='modal-footer'>
          <button className='btn btn-outline-info' onClick={this.onSubmit}>
            Зберегти
          </button>
        </div>
      </>
    );
  }

  static defaultProps = {
    onCloseModal: () => {},
    onSubmit: () => {},
  };
}

export default view(RegistrationModal);
