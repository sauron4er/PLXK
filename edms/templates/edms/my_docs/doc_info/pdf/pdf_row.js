import * as React from 'react';

function PDFRow(props) {
  return (
      <div className={`d-flex mt-3 ${props.className}`}>
        {props.children}
      </div>
  );
}

PDFRow.defaultProps = {
  className: ''
};

export default PDFRow;
