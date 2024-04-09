'use strict';
import * as React from 'react';
import { getTextByQueue } from "templates/components/my_extras";
import Text from "edms/templates/edms/my_docs/doc_info/doc_info_modules/text";

function BagTest(props) {
  console.log(props.fields);

  return <>
    <Text text={props.fields.test_type} text_info={{ field_name: 'Тип тестування' }} />
    <Text text={props.fields.provider} text_info={{ field_name: 'Постачальник' }} />
    <Text text={props.fields.client} text_info={{ field_name: 'Клієнт' }} />
  </>;
}

BagTest.defaultProps = {
  fields: {}
};

export default BagTest;
