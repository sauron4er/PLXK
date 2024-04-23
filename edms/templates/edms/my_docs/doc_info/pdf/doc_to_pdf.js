'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFilePdf} from '@fortawesome/free-solid-svg-icons';
import ReactToPrint from 'react-to-print';
import PDFRow from "edms/templates/edms/my_docs/doc_info/pdf/pdf_row";

function DocToPDF(props) {
  let componentRef = null;

  const hideStyle = {
    display: 'none'
  };

  const printWindowStyle = {
    padding: '10px'
  };

  return (
    <>
      <ReactToPrint
        trigger={() => (
          <a href='#' className='text-dark mr-2'>
            <FontAwesomeIcon icon={faFilePdf} />
          </a>
        )}
        content={() => componentRef}
        pageStyle={printWindowStyle}
      />

      <div style={hideStyle}>
        <div ref={(el) => (componentRef = el)}>
          <img src='../../../../../../static/img/blank_header.png' alt='Italian Trulli' style={{width: '100%'}} />
          <PDFRow />
        </div>
      </div>
    </>
  );
}

DocToPDF.defaultProps = {
  info: []
};

export default DocToPDF;
