import * as React from 'react';

function PDFCell(props) {
  return (
    <>
      <div className={`p-2 mt-1 col-${props.columns} ${props.className}`}>
        {props.children}
      </div>
      <hr/>
    </>

  );
}

PDFCell.defaultProps = {
  columns: 12,
  className: ''
};

export default PDFCell;
