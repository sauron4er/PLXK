import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFilePdf} from '@fortawesome/free-solid-svg-icons';
import ReactToPrint from 'react-to-print';
import PDFRow from 'edms/templates/edms/my_docs/doc_info/pdf/pdf_row';
import PDFCell from "edms/templates/edms/my_docs/doc_info/pdf/pdf_cell";

function DocToPDF(props) {
  let componentRef = null;

  const hideStyle = {
    display: 'none'
  };

  function getModuleValue(module) {
    return 'value'
    // boolean - вертати слово Так чи Ні
    // dep_seat - вертати відділ і посаду
    
  }

  console.log(props.info.type_modules);

  return (
    <>
      <ReactToPrint
        trigger={() => (
          <a href='#' className='text-dark mr-2'>
            <FontAwesomeIcon icon={faFilePdf} />
          </a>
        )}
        content={() => componentRef}
        pageStyle={''}
      />

      <div style={hideStyle}>
        <div ref={(el) => (componentRef = el)}>
          <img src='../../../../../../static/img/blank_header.png' alt='Italian Trulli' style={{width: '100%'}} />
          {/*<PDFRow>*/}
          <div className={`row mt-3 mx-1`}>
            <For each='module' index='index' of={props.info.type_modules}>
              <PDFCell key={index} label={module.field_name} value={getModuleValue(module)} columns={module.columns}/>
            </For>
          </div>
          {/*</PDFRow>*/}
        </div>
      </div>
    </>
  );
}

DocToPDF.defaultProps = {
  info: []
};

export default DocToPDF;
