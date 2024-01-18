'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';

function NonEditable(props) {
  console.log(props);

  return (
    <>
      <div>{props.module_info.field_name}</div>
      <div className='css_note_text'>{props.module_info.additional_info}</div>
    </>
  );
}

NonEditable.defaultProps = {
  module_info: {
    field_name: '---',
    queue: 0,
    required: false,
    additional_info: null
  }
};

export default view(NonEditable);
