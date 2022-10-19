'use strict';
import React from 'react';
import DecreeArticle from "edms/templates/edms/my_docs/doc_info/doc_info_modules/decree_articles/decree_article";

function DecreeArticles(props) {
  console.log(props.articles);

  function getDeadline(article) {
    switch (article.term) {
      case 'term':
        return article.deadline;
      case 'no_term':
        return 'Безстроково';
      case 'constant':
        return 'Постійно';
    }
  }

  return (
    <>
      {props.fieldName}:
      <div className='css_note_text py-2'>
        <For each='article' of={props.articles} index='article_idx'>
          <DecreeArticle key={article_idx} index={article_idx} article={article}/>
        </For>
      </div>
    </>
  );
}

DecreeArticles.defaultProps = {
  articles: [],
  fieldName: 'Кому:'
};

export default DecreeArticles;
