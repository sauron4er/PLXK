'use strict';
import * as React from 'react';
import { useEffect, useState } from "react";
import { axiosGetRequest } from "templates/components/axios_requests";

const columns = [
  {name: 'id', title: '№'},
  {name: 'type', title: 'Тип'}
];

const col_width = [
  {columnName: 'id', width: 70}
];

function EDMSDocuments(props) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocuments();
  }, [])

  function getDocuments() {
    axiosGetRequest(`get_edms_documents/${props.counterparty_id}/`)
      .then((response) => {
        console.log(response);
        setDocuments(response);
        setLoading(false)
      })
      .catch((error) => console.log(error));
  }

  return <div>{props.counterparty_id}</div>;
}

EDMSDocuments.defaultProps = {};

export default EDMSDocuments;
