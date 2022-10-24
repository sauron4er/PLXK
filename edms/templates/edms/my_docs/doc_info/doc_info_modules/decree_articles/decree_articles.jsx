import * as React from 'react';
import DecreeArticle from "edms/templates/edms/my_docs/doc_info/doc_info_modules/decree_articles/decree_article";

function DecreeArticles(props) {
  return (
    <>
      <div>{props.fieldName}:</div>
      <div className='css_note_text py-1'>
        <For each='article' of={props.articles} index='article_idx'>
          <DecreeArticle key={article_idx} index={article_idx} article={article} />
        </For>
      </div>
    </>
  );
}

DecreeArticles.defaultProps = {
  field_name: '---',
  articles: []
};

export default DecreeArticles;
