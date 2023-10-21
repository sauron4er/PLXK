'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';
import {useEffect, useState} from 'react';
import TextInput from 'templates/components/form_modules/text_input';

function EditClientRequirement(props) {
  const [comment, setComment] = useState('');
  const [newCR, setNewCR] = useState([]);

  // console.log(props.oldCR);

  useEffect(() => {}, []);

  function onChange(e) {
    props.onChange(props.name, e.target.value, props.index)
  }

  function getMaxLength() {
    if (props.name === 'bag_name') return 100;
    if (props.name === 'binding') return 20;
    return 10;
  }

  return (
    <>
      <TextInput text={props.value} fieldName={props.label} onChange={onChange} maxLength={getMaxLength} disabled={false} />
      <hr />
    </>
  );
}

EditClientRequirement.defaultProps = {
  name: '',
  label: '',
  value: '',
  index: 0,
  onChange: () => {}
};

export default EditClientRequirement;
