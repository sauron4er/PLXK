'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import FilesUpload from 'templates/components/files_uploader/files_upload';

class AnswerFiles extends React.Component {
  state = {
    old_answer_files: {}
  };

  deleteFile = (id) => {
    for (const i in corrStore.request.old_answer_files) {
      if (
        corrStore.request.old_answer_files.hasOwnProperty(i) &&
        corrStore.request.old_answer_files[i].id === id
      ) {
        corrStore.request.old_answer_files[i].status = 'delete';
        break;
      }
    }
  };

  onFilesChange = (e) => {
    corrStore.request.new_answer_files = e.target.value;
  };

  render() {
    return (
      <>
        <div>Файли відповіді:</div>

        <For each='file' index='id' of={corrStore.request.old_answer_files}>
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
          files={corrStore.request.new_answer_files}
          fieldName={''}
        />
      </>
    );
  }

  static defaultProps = {};
}

export default view(AnswerFiles);
