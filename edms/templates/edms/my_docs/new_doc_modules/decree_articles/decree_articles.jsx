'use strict';
import React, {useEffect, useState} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import DecreeArticle from "edms/templates/edms/my_docs/new_doc_modules/decree_articles/decree_article";

function DecreeArticles(props) {
  function addEmptyArticle() {
    let articles = [...newDocStore.new_document.decree_articles];
    articles.push({text: '', responsibles: [], deadline: '', status: 'new', periodicity: '', term: 'term'});
    newDocStore.new_document.decree_articles = [...articles];
  }

  return (
    <>
      <div>Пункти наказу:</div>
      <For each='article' index='article_idx' of={newDocStore.new_document.decree_articles}>
        <If condition={article.status !== 'delete'}>
          <DecreeArticle key={article_idx} index={article_idx} />
        </If>
      </For>
      <button className='btn btn-sm btn-outline-secondary' onClick={addEmptyArticle}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
      
      <small className='text-danger'>{props.module_info?.additional_info}</small>
    </>
  );
}

DecreeArticles.defaultProps = {
  module_info: {
    field_name: '---',
    queue: 0,
    required: false,
    additional_info: null
  }
};

export default view(DecreeArticles);
