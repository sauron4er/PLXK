'use strict';
import * as React from 'react';

class NewFilesList extends React.Component {
  render() {
    const {files, fileRemove} = this.props;

    return (
      <div className='files-list mb-3'>
        <ul>
          {files.map((file) => (
            <li className='files-list-item mt-1' key={file.id}>
              <div className='files-list-item-preview'>
                {file.preview.type === 'image' ? (
                  <img className='files-list-item-preview-image' src={file.preview.url} />
                ) : (
                  <div className='files-list-item-preview-extension'>{file.extension}</div>
                )}
              </div>
              <div className='files-list-item-content'>
                <div className='files-list-item-content-item files-list-item-content-item-1'>
                  {file.name}
                </div>
                <div className='files-list-item-content-item files-list-item-content-item-2'>
                  {file.sizeReadable}
                </div>
              </div>
              <div
                id={file.id}
                className='files-list-item-remove'
                onClick={e => {fileRemove(e, file)}}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  static defaultProps = {
    fileRemove: {},
    files: [],
  };
}

export default NewFilesList;
