'use strict';
import React from 'react';
import FilesUpload from 'templates/components/files_uploader/files_upload';

class Files extends React.Component {
  render() {
    const {oldFiles, newFiles, fieldName, onChange, onDelete, edit_mode} = this.props;
    
    return (
      <>
        <div>{fieldName}</div>

        <For each='file' index='id' of={oldFiles}>
          <If condition={file.status !== 'delete'}>
            <div key={file.id}>
              <a href={'../../media/' + file.file} target='_blank'>
                {file.name}{' '}
              </a>

              <button className='btn btn-sm btn-link text-danger ' onClick={() => onDelete(file.id)} disabled={!edit_mode}>
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
          </If>
        </For>

        <If condition={edit_mode}>
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
    edit_mode: false
  };
}

export default Files;
