'use strict';
import * as React from 'react';
import ReactToPrint from 'react-to-print';
import {faPrint} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

class NCPrint extends React.Component {
  hideStyle = {
    display: 'none'
  };

  printWindowStyle = {
    padding: '10px'
  };

  render() {
    const {info} = this.props;

    return (
      <>
        <ReactToPrint
          trigger={() => (
            <a href='#' className='text-dark'>
              <FontAwesomeIcon icon={faPrint} />
            </a>
          )}
          content={() => this.componentRef}
          pageStyle={this.printWindowStyle}
        />

        <div style={this.hideStyle}>
          <div ref={(el) => (this.componentRef = el)}>
            <img src='../../../../../static/img/blank_header.png' alt='Italian Trulli' style={{width: '100%'}} />
            <div className='css_border bg-light p-2 mt-2 mr-1'>123</div>
          </div>
        </div>
      </>
    );
  }
}

export default NCPrint;
