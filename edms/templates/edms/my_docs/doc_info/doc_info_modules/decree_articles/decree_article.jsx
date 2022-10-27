import * as React from 'react';
import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css'
import 'static/css/react-quill-custom.css'

function DecreeArticle(props) {
  return (
    <div className='css_note_text mb-1'>
      <div className='d-flex'>
        <span className='font-weight-bold mr-1'>{props.index + 1}.</span>
        <ReactQuill
          theme="snow"
          value={props.article.text}
          // style={{minHeight: '400px'}}
          readOnly={true}
          modules={{ "toolbar": false }}
          className='flex-grow-1 css_read_only'
        />
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
      <If condition={props.article.responsibles.length}>
        <hr className="my-1" />
        <div>Відповідальні особи:</div>
        <For each="responsible" of={props.article.responsibles} index="resp_idx">
          <small key={resp_idx}>
            <li className="ml-3">
              {responsible.name}
            </li>
          </small>
        </For></If>
    </div>
  );
}

DecreeArticle.defaultProps = {
  index: 0,
  article: {}
};

export default DecreeArticle;
