'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';
import Files from 'react-files';
import NewFilesList from "templates/components/files_uploader/new_files_list";

function BagTestFile(props) {
  function onChange(new_files) {
    newDocStore.new_document.bag_test_fields[props.name] = new_files;
  }

  function onError(error, file) {
    console.log('error code ' + error.code + ': ' + error.message);
  }

  function fileRemove(e, file) {
    newDocStore.new_document.bag_test_fields[props.name] = []
    // this.refs.new_files.removeFile(file);
  }

  return (
    <div className={`col-md-${props.columns} px-1`}>
      <div className="css_edms_doc_module">
        <small>{props.label}</small>
        <If condition={props.files.length > 0}>
          <NewFilesList files={props.files} fileRemove={fileRemove} />
        </If>
        <If condition={props.files.length === 0}><Files
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
          Додати файл
        </Files></If>
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
