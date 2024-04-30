'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import CheckboxInput from 'templates/components/form_modules/checkbox_input';
import {getIndexByProperty} from 'templates/components/my_extras';
import {useLayoutEffect} from 'react';

function Boolean(props) {
  const queue_in_booleans = getIndexByProperty(newDocStore.new_document.booleans, 'queue', parseInt(props.module_info.queue));

  useLayoutEffect(() => {
    onCheckBoxChange(false);
  }, []);

  function onCheckBoxChange(e) {
    if (queue_in_booleans === -1) {
      newDocStore.new_document.booleans.push({
        queue: props.module_info.queue,
        checked: false
      });
    } else {
      newDocStore.new_document.booleans[queue_in_booleans].checked = !newDocStore.new_document.booleans[queue_in_booleans].checked;
    }
  }

  return (
    <CheckboxInput
      checked={newDocStore.new_document.booleans[queue_in_booleans]?.checked || false}
      fieldName={props.module_info.field_name}
      onChange={onCheckBoxChange}
    />
  );
}

Boolean.defaultProps = {
  module_info: {
    field_name: '---',
    queue: 0,
    required: false,
    additional_info: null
  }
};

export default view(Boolean);
