'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import FilesUpload from 'templates/components/files_uploader/files_upload';

class AnswerFiles extends React.Component {
  state = {
    old_answer_files: {}
  };

  deleteFile = (e, id) => {
    e.preventDefault();
  };

  onFilesChange = (e) => {
    corrStore.new_answer_files = e.target.value;
  };

  render() {
    return (
      <>
        <div>Файли відповіді:</div>

        <For each='file' index='id' of={corrStore.request.old_answer_files}>
          <div key={file.id}>
            <a href={'../../media/' + file.file} target='_blank'>
              {file.name}{' '}
            </a>

            <button
              className='btn btn-sm btn-link text-danger '
              onClick={(e) => this.deleteFile(e, file.id)}
            >
              <span aria-hidden='true'>&times;</span>
            </button>
          </div>
        </For>

        <FilesUpload
          onChange={this.onFilesChange}
          files={corrStore.new_answer_files}
          fieldName={''}
        />
      </>
    );
  }

  static defaultProps = {};
}

export default view(AnswerFiles);
