'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';

import { notify } from "templates/components/my_extras";
import { useEffect, useState } from "react";


function EditClientRequirements(props) {
  const [comment, setComment] = useState('')
  const [newCR, setNewCR] = useState([])

  console.log(props.oldCR);

  useEffect(() => {
    console.log(1);
  }, [])

  function onSubmit() {
    if (props.oldCR === JSON.stringify(newCR)) {
      notify('Ви нічого не змінили.');
    } else {
      props.onSubmit(comment);
    }
  }

  function onClose() {
    props.onCloseModal();
  }
  
  function onCommentChange(e) {
    setComment(e.target.value);
  }

  return (
    <>
      <div className='modal-header d-flex justify-content-between'>
        <h5 className='modal-title font-weight-bold'>Редагування вимог клієнта</h5>
        <button className='btn btn-link' onClick={onClose}>
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>
      <div className='modal-body'>
        {/*<For each='cr' of={props.oldCR} index='index'>*/}
        {/*  <div className="">1</div>*/}
        {/*</For>*/}
      </div>

      <div className='modal-footer'>
        <label htmlFor='comment_modal'>Прокоментуйте зміни:</label>
          <textarea
            name='comment'
            className='form-control'
            rows='3'
            id='comment_modal'
            onChange={onCommentChange}
            value={comment}
          />
        <small>При збереженні змін даний електронний документ буде знов запропоновано на розгляд візуючим</small>
        <button className='btn btn-outline-info ml-1' onClick={onSubmit}>
          Зберегти зміни
        </button>
      </div>
    </>
  );
}

EditClientRequirements.defaultProps = {
  onCloseModal: {},
  onSubmit: {}
};

export default EditClientRequirements;

const clientRequirementsNamesAndLabels = {
    "bag_name": "Назва мішка, ТМ"
}
