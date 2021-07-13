'use strict';
import * as React from 'react';
import ContractView from 'docs/templates/docs/contracts/contract_simple_view';
import Modal from 'react-responsive-modal';
import DocumentSimpleView from "edms/templates/edms/my_docs/doc_info/document_simple_view";

class DocumentLink extends React.Component {
  state = {
    modal_open: false
  };

  render() {
    const {fieldName, documentLink} = this.props;
    const {modal_open} = this.state;

    return (

        <If condition={documentLink.id !== 0}>
          <div>{fieldName}:</div>
          <div className='css_note_text'>
            <div>
              № {documentLink.id}, "{documentLink.main_field}"
            </div>

            <button className='btn btn-sm btn-outline-info my-1' onClick={() => this.setState({modal_open: true})}>
              Переглянути
            </button>
          </div>
          <Modal
            open={modal_open}
            onClose={() => this.setState({modal_open: false})}
            showCloseIcon={true}
            closeOnOverlayClick={true}
            styles={{modal: {marginTop: 50}}}
          >
            <DocumentSimpleView doc_id={documentLink.id} />
          </Modal>
        </If>
    );
  }

  static defaultProps = {
    documentLink: {
      id: 0,
      main_field: ''
    },
    fieldName: '---'
  };
}

export default DocumentLink;
