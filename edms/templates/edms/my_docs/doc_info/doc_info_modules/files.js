'use strict';
import React, {Fragment} from 'react';

class Files extends React.Component {
  render() {
    const {fieldName, files, is_editable, queue, only_first_path} = this.props;

    return (
      <If condition={!queue || files.find((file) => file.queue === queue)}>
        <If condition={fieldName}>
          <div>{fieldName}:</div>
        </If>
        <For each='file' index='id' of={files}>
          <If condition={!file.queue || file.queue === queue}>
            <If condition={!only_first_path || file.first_path}>
              <div key={file.id}>
                <a href={'../../media/' + file.file} target='_blank'>
                  {file.name}{' '}
                </a>
                <If condition={is_editable}>
                  <span className='text-dark font-weight-bold'>v{file.version}</span>
                </If>
              </div>
            </If>
          </If>
        </For>
      </If>
    )
  }

  static defaultProps = {
    files: [],
    fieldName: '???',
    is_editable: false,
    queue: null,
    only_first_path: false
  };
}

export default Files;
