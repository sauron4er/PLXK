'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import useSetState from "templates/hooks/useSetState";
import ReactToPrint from "react-to-print";

function DocumentPDF(props) {
  let componentRef = null

  console.log(props.info.bag_test);

  const hideStyle = {
    display: 'none'
  };

  const printWindowStyle = {
    padding: '10px'
  };

  const [state, setState] = useSetState({
    modal_open: false
  })

  function toggleModal() {
    setState({modal_open: !state.modal_open})
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
          pageStyle={printWindowStyle}
        />

        <div style={hideStyle}>
          <div ref={(el) => (componentRef = el)}>
            <img src="../../../../../static/img/blank_header.png" alt="Italian Trulli" style={{width: '100%'}} />
            <div className='border border-dark rounded mt-3 mr-2 p-0 '>
              {props.info.bag_test.test_type}
            </div>
          </div>
        </div>
      </>
  );
}

DocumentPDF.defaultProps = {
  info: []
};

export default DocumentPDF;
