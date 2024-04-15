'use strict';
import React, {Fragment} from 'react';

class Files extends React.Component {
  render() {
    const {fieldName, files, is_editable, only_first_path} = this.props;
  
    return (
      <>
        <If condition={fieldName}>
          <div>{fieldName}:</div>
        </If>
        <For each='file' index='id' of={files}>
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
        </For>
      </>
    );
  }

  static defaultProps = {
    files: [],
    fieldName: '???',
    is_editable: false,
    only_first_path: false
  };
}

export default Files;
