'use strict';
import React from 'react';

class Path extends React.Component {
  // отримує історію документа в масиві path, рендерить її для doc_info

  render() {
    return (
      <div>
        Історія:
        <For each='path' index='id' of={this.props.path}>
          <div key={path.id} className='css_path p-2 my-1 mr-1'>
            <div className='d-flex justify-content-between'>
              <span className='font-weight-bold'>{path.emp}</span>
              <span>{path.time}</span>
            </div>
            <div>{path.seat}</div>
            <div className='css_mark'>{path.mark}</div>
            <If condition={path.comment !== '' && path.comment !== null}>
              <div className='text-right'>Коментар:</div>
              <div className='css_comment'>{path.comment}</div>
            </If>
            <If condition={path.resolutions}>
              <ol className='list-group mt-1'>
                {path.resolutions.map((res) => {
                  return (
                    <li className='list-group-item' key={res.id}>
                      <div className='font-italic'>
                        {res.emp_seat}
                      </div>
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
                      <div className='font-italic'>
                        {acquaint.emp_seat}
                      </div>
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
    path: []
  };
}

export default Path;
