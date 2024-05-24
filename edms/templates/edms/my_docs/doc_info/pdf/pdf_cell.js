import * as React from 'react';

function PDFCell(props) {
  return (
    <If condition={props.value}>
      <div className={`border p-2 mb-2 col-${props.columns} ${props.className}`}>
        <div style={{ fontSize: '1.1rem' }}>{props.label}:</div>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '1.3rem' }}>{props.value}</div>
      </div>
      <hr />
    </If>
  );
}

PDFCell.defaultProps = {
  columns: 12,
  className: '',
  label: '',
  value: ''
};

export default PDFCell;
