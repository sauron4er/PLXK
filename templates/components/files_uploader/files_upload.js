'use strict';
import * as React from 'react';
import Files from 'react-files';
import 'static/css/files_uploader.css';
import NewFilesList from 'templates/components/files_uploader/new_files_list';

class FilesUpload extends React.Component {
  onFilesChange = (new_files) => {
    const changed_event = {
      target: {
        name: 'files',
        value: new_files
      }
    };
    this.props.onChange(changed_event);
  };

  onFilesError = (error, file) => {
    console.log('error code ' + error.code + ': ' + error.message);
  };

  filesRemoveOne = (e, file) => {
    this.refs.new_files.removeFile(file);
  };

  render() {
    const {module_info, files, editable, multiple, className} = this.props;
    return (
      <div className={className || `mt-1`}>
        <Choose>
          <When condition={editable}>
            <If condition={module_info.required}>{'* '}</If>
            <If condition={module_info.field_name.length > 0}>
              <span className='mr-2'>{module_info.field_name}:</span>
            </If>
          </When>
          <Otherwise>
            <span className='mr-2'>Файл(и):</span>
          </Otherwise>
        </Choose>
        <If condition={files.length > 0}>
          <NewFilesList files={files} fileRemove={this.filesRemoveOne} />
        </If>
        <If condition={editable}>
          <Files
            ref='new_files'
            className='btn btn-sm btn-outline-secondary'
            // className='files-dropzone-list'
            // style={{height: '100px'}}
            onChange={this.onFilesChange}
            onError={this.onFilesError}
            multiple={multiple}
            maxFiles={10}
            maxFileSize={50000000}
            minFileSize={0}
            clickable
          >
            Додати файл(и)
          </Files>
        </If>
      </div>
    );
  }

  static defaultProps = {
    multiple: true,
    files: [],
    module_info: {
      field_name: 'Додати файли',
      queue: 0,
      required: false,
      additional_info: null
    },
    className: '',
    editable: true
  };
}

export default FilesUpload;
