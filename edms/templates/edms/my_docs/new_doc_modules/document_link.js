'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import Document from 'edms/templates/edms/my_docs/doc_info/document';
import DocumentSimpleView from 'edms/templates/edms/my_docs/doc_info/document_simple_view';

class DocumentLink extends React.Component {
  state = {
    document_modal_open: false
  };

  openAdditionalModal = () => {
    const {documentLink} = this.props;
    newDocStore.additional_modal_opened = true;
    newDocStore.additional_modal_content = <DocumentSimpleView doc_id={documentLink} />;
  };

  render() {
    const {moduleInfo, documentLink, mainField} = this.props;

    return (
      <>
        <If condition={moduleInfo.required}>{'* '}</If> {moduleInfo.field_name}:
        <div>
          <Choose>
            <When condition={documentLink === 0}>
              <small>Це поле заповнюється автоматично при створенні Договору зі сторінки Тендеру</small>
            </When>
            <Otherwise>
              № {documentLink} "{mainField}"{' '}
              <button className='btn btn-sm btn-outline-info' onClick={this.openAdditionalModal}>
                Переглянути
              </button>
            </Otherwise>
          </Choose>
        </div>
      </>
    );
  }

  static defaultProps = {
    moduleInfo: {
      field_name: 'Посилання на документ',
      queue: 0,
      required: false,
      additional_info: null
    },
    documentLink: 0,
    mainField: '',
    additionalModalOpen: () => {}
  };
}

export default view(DocumentLink);
