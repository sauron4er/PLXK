'use strict';
import * as React from 'react';
import Tables from 'edms/templates/edms/tables/tables';

function EDMSDocuments(props) {
  return (
    <If condition={props.counterparty_id !== 0}>
      <Tables doc_type_id={5} counterparty_id={props.counterparty_id} />
    </If>
  );
}

EDMSDocuments.defaultProps = {};

export default EDMSDocuments;
