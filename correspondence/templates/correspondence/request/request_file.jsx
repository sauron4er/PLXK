'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import FilesUpload from 'templates/components/files_uploader/files_upload';

class RequestFile extends React.Component {
  deleteFile = (e) => {
    e.preventDefault();
    corrStore.old_eml_file = {};
  };

  onFilesChange = (e) => {
    corrStore.new_eml_file = e.target.value;
  };

  render() {
    return (
      <>
        <div>Лист запиту (.eml)</div>
        <Choose>
          <When condition={corrStore.request.old_eml_file.file}>
            <a href={'../../media/' + corrStore.request.old_eml_file.file} target='_blank'>
              {corrStore.request.old_eml_file.name}{' '}
            </a>
            <button className='btn btn-sm btn-link text-danger ' onClick={this.deleteFile}>
              <span aria-hidden='true'>&times;</span>
            </button>
          </When>
          <Otherwise>
            <FilesUpload
              onChange={this.onFilesChange}
              files={corrStore.new_eml_file}
              fieldName={''}
              multiple={false}
            />
          </Otherwise>
        </Choose>
      </>
    );
  }

  static defaultProps = {};
}

export default view(RequestFile);
