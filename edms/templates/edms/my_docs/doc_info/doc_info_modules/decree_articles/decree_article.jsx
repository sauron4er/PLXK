import * as React from 'react';

function DecreeArticle(props) {
  return (
    <div className='css_note_text mb-1'>
      <div>
        <span className='font-weight-bold'>{props.index + 1}.</span> {props.article.text}
      </div>
      <hr className='my-1' />
      <Choose>
        <When condition={props.article.term === 'term'}>
          <div>
            Строк:{' '}
            <span className='font-italic'>
              {props.article.deadline}{' '}
              <If condition={props.article.periodicity !== ''}>{props.article.periodicity === 'y' ? '(щорічно)' : '(щомісячно)'}</If>
            </span>
          </div>
        </When>
        <When condition={props.article.term === 'no_term'}>
          <div>
            Строк: <span className='font-italic'>Безстроково</span>
          </div>
        </When>
        <Otherwise>
          <div>
            Строк: <span className='font-italic'>Постійно</span>
          </div>
        </Otherwise>
      </Choose>
      <hr className='my-1' />
      <div>Відповідальні особи:</div>
      <For each='responsible' of={props.article.responsibles} index='resp_idx'>
        <small key={resp_idx}><li className='ml-3'>
          {responsible.name}
        </li></small>
      </For>
    </div>
  );
}

DecreeArticle.defaultProps = {
  index: 0,
  article: {}
};

export default DecreeArticle;
