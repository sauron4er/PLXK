'use strict';
import React from 'react';

function DecreeArticle(props) {
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
    <div className='css_note_text p-1'>
      <div>
        <strong>{props.index + 1}. </strong>
        {props.article.text}
      </div>
      <hr className='my-1'/>
      <Choose>
        <When condition={props.article.term === 'term'}>
          <div>
            Термін виконання:{' '}
            <span className='font-italic'>
              {props.article.deadline}
              <If condition={props.article.periodicity}> {props.article.periodicity === 'y' ? '(щорічно)' : '(щомісяця)'}</If>
            </span>
          </div>
        </When>
        <When condition={props.article.term === 'no_term'}>
          <div>
            Термін виконання: <span className='font-italic'>Безстроково</span>
          </div>
        </When>
        <Otherwise>
          <div>
            Термін виконання: <span className='font-italic'>Постійно</span>
          </div>
        </Otherwise>
      </Choose>
      <hr className='my-1'/>
      <div>
        Відповідальні особи:
        <ul className='p-0 mb-0'>
          <For each='responsible' of={props.article.responsibles} index='resp_idx'>
            <li className='ml-3' key={resp_idx}>{responsible.name}</li>
          </For>
        </ul>
      </div>
    </div>
  );
}

DecreeArticle.defaultProps = {
  index: 0,
  article: {}
};

export default DecreeArticle;
