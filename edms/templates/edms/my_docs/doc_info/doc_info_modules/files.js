'use strict';
import React, {Fragment} from 'react';

class Files extends React.Component {
  render() {
    const {fieldName, files, is_editable} = this.props;

    return (
      <Fragment>
        <div>{fieldName}:</div>
        <For each='file' index='id' of={files}>
          <If condition={file.first_path}>
            <div key={file.id}>
              <a href={'../../media/' + file.file} download={file.name}>
                {file.name}{' '}
              </a>
              <If condition={is_editable}>
                <span className='text-dark font-weight-bold'>v{file.version}</span>
              </If>
            </div>
          </If>
        </For>
      </Fragment>
    );
  }

  static defaultProps = {
    files: [],
    fieldName: '???',
    is_editable: false
  };
}

export default Files;
