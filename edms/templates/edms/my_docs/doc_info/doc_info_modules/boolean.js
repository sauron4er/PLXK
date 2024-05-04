'use strict';
import React from 'react';

function Boolean(props) {
  console.log(props);
  return (
    <>
      <div>{fieldName}:</div>
      <div></div>
    </>
  );
}

Boolean.defaultProps = {
  fieldName: '---',
  data: {
    fieldName: '---',
    checked: false
  }
};

export default Day;
