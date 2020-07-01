'use strict';
import React from 'react';
import FilesUpload from 'templates/components/files_uploader/files_upload';

class Files extends React.Component {
  render() {
    const {oldFiles, newFiles, fieldName, onChange, onDelete} = this.props
    return (
      <>
        <div>{fieldName}</div>

        <For each='file' index='id' of={oldFiles}>
          <If condition={file.status !== 'delete'}>
            <div key={file.id}>
              <a href={'../../media/' + file.file} target='_blank'>
                {file.name}{' '}
              </a>
      
              <button
                className='btn btn-sm btn-link text-danger '
                onClick={() => onDelete(file.id)}
              >
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
          </If>
        </For>

        <FilesUpload
          onChange={onChange}
          files={newFiles}
          fieldName={''}
        />
      </>
    );
  }

  static defaultProps = {
    oldFiles: [],
    newFiles: [],
    fieldName: '-',
    onChange: () => {},
    onDelete: () => {}
  }
}

export default Files
