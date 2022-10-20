'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import decreeArticlesStore from "edms/templates/edms/my_docs/new_doc_modules/decree_articles/store";
import DecreeArticle from "edms/templates/edms/my_docs/new_doc_modules/decree_articles/decree_article";

function DecreeArticles(props) {
  function addEmptyArticle() {
    let articles = [...decreeArticlesStore.decree_articles];
    articles.push({text: '', responsibles: [], deadline: '', status: 'new', periodicity: '', term: 'term'});
    decreeArticlesStore.decree_articles = [...articles];
  }

  return (
    <>
      <div>Пункти наказу:</div>
      <For each='article' index='article_idx' of={decreeArticlesStore.decree_articles}>
        <If condition={article.status !== 'delete'}>
          <DecreeArticle key={article_idx} index={article_idx} />
        </If>
      </For>
      <button className='btn btn-sm btn-outline-secondary' onClick={addEmptyArticle}>
        +
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
