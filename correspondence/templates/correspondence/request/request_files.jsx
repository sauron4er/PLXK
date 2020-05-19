'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import FilesUpload from 'templates/components/files_uploader/files_upload';

class RequestFiles extends React.Component {
  deleteFile = (id) => {
    for (const i in corrStore.request.old_request_files) {
      if (
        corrStore.request.old_request_files.hasOwnProperty(i) &&
        corrStore.request.old_request_files[i].id === id
      ) {
        corrStore.request.old_request_files[i].status = 'delete';
        break;
      }
    }
  };

  onFilesChange = (e) => {
    corrStore.request.new_request_files = e.target.value;
  };

  render() {
    return (
      <>
        <div>Файли запиту (.eml)</div>

        <For each='file' index='id' of={corrStore.request.old_request_files}>
          <If condition={file.status !== 'delete'}>
            <div key={file.id}>
              <a href={'../../media/' + file.file} target='_blank'>
                {file.name}{' '}
              </a>
      
              <button
                className='btn btn-sm btn-link text-danger '
                onClick={() => this.deleteFile(file.id)}
              >
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
          </If>
        </For>

        <FilesUpload
          onChange={this.onFilesChange}
          files={corrStore.request.new_request_files}
          fieldName={''}
        />
      </>
    );
  }

  static defaultProps = {};
}

export default view(RequestFiles);
