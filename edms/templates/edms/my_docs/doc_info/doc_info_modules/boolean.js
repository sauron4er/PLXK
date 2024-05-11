'use strict';
import React from 'react';
import CheckboxInput from 'templates/components/form_modules/checkbox_input';

function Boolean(props) {
  return <CheckboxInput className='mt-1' checked={props.checked} fieldName={props.field_name} />;
}

Boolean.defaultProps = {
  id: 0,
  queue: 0,
  field_name: '---',
  checked: false
};

export default Boolean;
