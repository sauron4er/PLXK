import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFilePdf} from '@fortawesome/free-solid-svg-icons';
import ReactToPrint from 'react-to-print';
import PDFCell from 'edms/templates/edms/my_docs/doc_info/pdf/pdf_cell';
import {getBooleanByQueue, getDayByQueue, getTextByQueue} from 'templates/components/my_extras';

function DocToPDF(props) {
  let componentRef = null;

  const hideStyle = {
    display: 'none'
  };

  function getModuleValue(module, index) {
    switch (module.module) {
      case 'text':
        return getTextByQueue(props.info.text_list, index);
      case 'day':
        return getDayByQueue(props.info.days, index);
      case 'dep_seat':
        return props.info.dep_seat.dep_name + ' – ' + props.info.dep_seat.seat_name;
      case 'boolean':
        const bln = getBooleanByQueue(props.info.booleans, index);
        return bln.checked ? 'Так' : 'Ні';
      case 'info_on_print':
        return props.info.info_on_print;
      case 'sign_after_print':
        return '\n____  __________  20___ р.                                                                                                  _________________';
    }

    return '-';
  }

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
          <div className='m-5'>
            <h3 className='text-center mb-5'>{props.info.type}</h3>
            <div className='row'>
              <For each='module' index='index' of={props.info.type_modules}>
                <PDFCell key={index} label={module.field_name} value={getModuleValue(module, index)} columns={module.columns} />
              </For>
            </div>
            <div className='float-right'>
              <div>
                <i>Автор/відповідальний: {props.info.responsible}</i>
              </div>
              <div>
                <i>Створено: {props.info.date}</i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

DocToPDF.defaultProps = {
  info: []
};

export default DocToPDF;
