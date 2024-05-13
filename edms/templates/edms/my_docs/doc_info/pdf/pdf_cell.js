import * as React from 'react';

function PDFCell(props) {
  return (
    <>
      <div className={`border p-2 mb-2 col-${props.columns} ${props.className}`}>
        <div>{props.label}:</div>
        <h5>{props.value}</h5>
      </div>
      <hr />
    </>
  );
}

PDFCell.defaultProps = {
  columns: 12,
  className: '',
  label: '',
  value: ''
};

export default PDFCell;
