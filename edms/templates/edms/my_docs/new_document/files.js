'use strict';
import React from 'react';
import {FileUploader} from 'devextreme-react';

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
    const {fieldName} = this.props;
    return (
      <label className='full_width' htmlFor='files'>
        {fieldName}:
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
    );
  }

  static defaultProps = {
    files: [],
    fieldName: '???'
  };
}

export default Files;
