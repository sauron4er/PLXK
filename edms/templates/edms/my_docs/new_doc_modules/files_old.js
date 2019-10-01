'use strict';
import React, {Fragment} from 'react';
import {FileUploader} from 'devextreme-react';
import Files from 'react-files';
import '../_else/files_uploader.css';

class Files extends React.Component {
  onChange = (e) => {
    const changed_event = {
      target: {
        name: 'files',
        value: e.value
      }
    };
    this.props.onChange(changed_event);
  };

  render() {
    const {fieldName, oldFiles} = this.props;
    return (
      <Fragment>
        {fieldName}:
        <If condition={oldFiles}>
          <For each='file' index='id' of={oldFiles}>
            <div key={file.id}>
              <a href={'../../media/' + file.file} download>
                {file.name}
              </a>
            </div>
          </For>
        </If>
        
        <label className='full_width' htmlFor='files'>
          <FileUploader
            id='files'
            name='files'
            onValueChanged={(e) => this.onChange(e)}
            uploadMode='useForm'
            multiple={true}
            allowCanceling={true}
            selectButtonText='Оберіть файл'
            labelText='або перетягніть файл сюди'
            readyToUploadMessage='Готово'
          />
        </label>
      </Fragment>
    );
  }

  static defaultProps = {
    oldFiles: [],
    files: [],
    fieldName: '???'
  };
}

export default Files;
