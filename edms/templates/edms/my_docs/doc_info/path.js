'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from './doc_info_modules/doc_info_store';
import {getItemById} from 'templates/components/my_extras';

// отримує історію документа в масиві path, рендерить її для doc_info
class Path extends React.Component {
  getPathColor = (mark_id) => {
    if (mark_id === 3) return '#ffcccc';
    return '#ccffcc';
  };

  getOriginalComment = (id) => {
    const original_path = getItemById(id, docInfoStore.info.path);
    return (
      <blockquote key={id}>
        <div className='font-italic'>{original_path.emp}</div>
        <div>{original_path.comment}</div>
      </blockquote>
    );
  };

  render() {
    const {print, onAnswerClick} = this.props;
    return (
      <div>
        Історія:
        <For each='path' index='idx' of={this.props.path}>
          <div
            key={idx}
            className='css_path p-2 my-1 mr-1'
            style={{background: this.getPathColor(path.mark_id)}}
          >
            <div className='d-flex justify-content-between'>
              <span className='font-weight-bold'>{path.emp}</span>
              <span>{path.time}</span>
            </div>
            <div>{path.seat}</div>
            <div className='css_mark'>{path.mark}</div>
            <If condition={path.comment !== '' && path.comment !== null}>
              <If condition={path.original_path}>
                {this.getOriginalComment(path.original_path)}
              </If>
              <div className='css_comment'>{path.comment}</div>
              <If condition={!print}>
                <div className='text-right'>
                  <button
                    type='button'
                    className='btn btn-light btn-outline-secondary my-1'
                    onClick={() => onAnswerClick(path)}
                  >
                    Відповісти
                  </button>
                </div>
              </If>
            </If>
            <If condition={path.resolutions}>
              <ol className='list-group mt-1'>
                {path.resolutions.map((res) => {
                  return (
                    <li className='list-group-item' key={res.id}>
                      <div className='font-italic'>{res.emp_seat}</div>
                      <div>{res.comment}</div>
                    </li>
                  );
                })}
              </ol>
            </If>
            <If condition={path.acquaints}>
              <ol className='list-group mt-1'>
                {path.acquaints.map((acquaint) => {
                  return (
                    <li className='list-group-item' key={acquaint.id}>
                      <div className='font-italic'>{acquaint.emp_seat}</div>
                    </li>
                  );
                })}
              </ol>
            </If>
            <If condition={path.files.length > 0}>
              <ol className='list-group mt-1'>
                Додано {path.files.length > 1 ? 'файли' : 'файл'}:
                {path.files.map((file) => {
                  return (
                    <div key={file.id}>
                      <a href={'../../media/' + file.file} download>
                        {file.name}{' '}
                        <If condition={file.version > 1}>
                          <span className='text-dark font-weight-bold'>v{file.version}</span>
                        </If>
                      </a>
                    </div>
                  );
                })}
              </ol>
            </If>
            <If condition={path.deactivated_files.length > 0}>
              <ol className='list-group mt-1'>
                Видалено {path.deactivated_files.length > 1 ? 'файли' : 'файл'}:
                {path.deactivated_files.map((file) => {
                  return (
                    <div key={file.id}>
                      <a href={'../../media/' + file.file} download>
                        {file.name}{' '}
                        <If condition={file.version > 1}>
                          <span className='text-dark font-weight-bold'>v{file.version}</span>
                        </If>
                      </a>
                    </div>
                  );
                })}
              </ol>
            </If>
          </div>
        </For>
      </div>
    );
  }

  static defaultProps = {
    path: [],
    onAnswerClick: (mark) => {},
    print: false // при true кнопки Відповісти зникнуть (для друку)
  };
}

export default view(Path);
