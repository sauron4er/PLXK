'use strict';
import * as React from 'react';
import FilesUpload from 'templates/components/files_uploader/files_upload';

class Files extends React.Component {
  render() {
    const {oldFiles, newFiles, fieldName, onChange, onDelete, disabled} = this.props;
    
    return (
      <>
        <div>{fieldName}</div>

        <For each='file' index='id' of={oldFiles}>
          <If condition={file.status !== 'delete'}>
            <div key={file.id}>
              <a href={'../../media/' + file.file} target='_blank'>
                {file.name}{' '}
              </a>

              <button className='btn btn-sm btn-link text-danger ' onClick={() => onDelete(file.id)} disabled={disabled}>
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
          </If>
        </For>

        <If condition={!disabled}>
          <FilesUpload onChange={onChange} files={newFiles} fieldName={''} />
        </If>
      </>
    );
  }

  static defaultProps = {
    oldFiles: [],
    newFiles: [],
    fieldName: '-',
    onChange: () => {},
    onDelete: () => {},
    disabled: true
  };
}

export default Files;
