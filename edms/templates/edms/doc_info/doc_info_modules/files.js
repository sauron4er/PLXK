'use strict';
import React, {Fragment} from 'react';

class Files extends React.Component {
  render() {
    const {fieldName, files} = this.props;

    return (
      <Fragment>
        <div>{fieldName}:</div>
        <For each='file' index='id' of={files}>
          <div key={file.id}>
            <a href={'../../media/' + file.file} download>
              {file.name}
            </a>
          </div>
        </For>
      </Fragment>
    );
  }

  static defaultProps = {
    files: [],
    fieldName: '???'
  };
}

export default Files;
