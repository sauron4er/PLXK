'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';
import decreeArticlesStore from 'edms/templates/edms/my_docs/new_doc_modules/decree_articles/store';
import DecreeArticles from "edms/templates/edms/my_docs/new_doc_modules/decree_articles/decree_articles";
import { notify } from "templates/components/my_extras";
import { useState } from "react";
import { areArticlesValid } from "edms/templates/edms/my_docs/new_doc_modules/decree_articles/validation";

function EditDecreeArticles(props) {
  const [oldDecrees, setOldDecrees] = useState(JSON.stringify(decreeArticlesStore.decree_articles))
  const [comment, setComment] = useState('')
  
  function onSubmit() {
    if (oldDecrees === JSON.stringify(decreeArticlesStore.decree_articles)) {
      notify('Ви нічого не змінили.');
    } else if (areArticlesValid()) {
      props.onSubmit(comment);
    }
  }

  // При закритті модального вікна прибираємо внесені зміни
  function onClose() {
    decreeArticlesStore.decree_articles = JSON.parse(oldDecrees);
    props.onCloseModal();
  }
  
  function onCommentChange(e) {
    setComment(e.target.value);
  }

  return (
    <>
      <div className='modal-header d-flex justify-content-between'>
        <h5 className='modal-title font-weight-bold'>Редагування пунктів</h5>
        <button className='btn btn-link' onClick={onClose}>
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>
      <div className='modal-body'>
        <DecreeArticles  />
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

EditDecreeArticles.defaultProps = {
  onCloseModal: {},
  onSubmit: {}
};

export default EditDecreeArticles;
