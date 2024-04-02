'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';
import FilesUpload from 'templates/components/files_uploader/files_upload';
import Files from 'react-files';
import NewFilesList from "templates/components/files_uploader/new_files_list";

function BagTestFile(props) {
  // function onChange(e) {
  //   newDocStore.new_document.bag_test_fields[props.name] = e.target.value;
  // }

  function onChange(new_files) {
    newDocStore.new_document.bag_test_fields[props.name] = new_files;
    console.log(newDocStore.new_document);
  }

  function onError(error, file) {
    console.log('error code ' + error.code + ': ' + error.message);
  }

  function fileRemove(e, file) {
    newDocStore.new_document.bag_test_fields[props.name] = []
    // this.refs.new_files.removeFile(file);
  }

  return (
    <div className={`col-md-${props.columns}`}>
      <div className="css_edms_client_requirement">
        <small>{props.label}</small>
        <If condition={props.files.length > 0}>
          <NewFilesList files={props.files} fileRemove={fileRemove} />
        </If>
        <Files
          // ref="new_files"
          className="btn btn-sm btn-outline-secondary"
          // className='files-dropzone-list'
          // style={{height: '100px'}}
          onChange={onChange}
          onError={onError}
          multiple={false}
          maxFileSize={50000000}
          minFileSize={0}
          clickable
        >
          Додати файл(и)
        </Files>
        {/*<FilesUpload*/}
        {/*  onChange={onChange}*/}
        {/*  files={props.files}*/}
        {/*  module_info={{field_name: props.label}}*/}
        {/*/>*/}
      </div>
    </div>
  );
}

BagTestFile.defaultProps = {
  name: '',
  label: '',
  files: [],
  columns: 4
};

export default view(BagTestFile);
