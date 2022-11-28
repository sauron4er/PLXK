import React, { useState } from 'react';
import RegNumbersTable from 'docs/templates/docs/contracts/registration_numbers/table';
import Document from "edms/templates/edms/my_docs/doc_info/document";
import Modal from "react-responsive-modal";
import 'react-responsive-modal/styles.css';

function ContractRegNumbers() {
  const [EDMSModalOpened, setEDMSModalOpened] = useState(false)
  const [EDMSDocId, setEDMSDocId] = useState(0)
  
  function openEDMSModal(doc_id) {
    setEDMSDocId(doc_id);
    setEDMSModalOpened(true);
  }
  
  return (
    <>
      <RegNumbersTable onRowClick={openEDMSModal} />
      <Modal
        open={EDMSModalOpened}
        onClose={() => setEDMSModalOpened(false)}
        showCloseIcon={true}
        closeOnOverlayClick={true}
        styles={{modal: {marginTop: 75}}}
      >
        <Document doc_id={EDMSDocId} closed={true} />
      </Modal>
    </>
  );
}

export default ContractRegNumbers;
