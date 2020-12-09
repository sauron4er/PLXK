'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import Files from 'react-files';
import 'static/css/files_uploader.css';
import {notify} from 'templates/components/my_extras';
import docInfoStore from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/doc_info_store';

class EditFiles extends React.Component {
  state = {
    files: [...this.props.files],
    new_files: [],
    clear_changes: false,
    comment: ''
  };

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.clear_changes === true) {
      this.setState({
        files: prevProps.files,
        clear_changes: false
      });
    }
  }

  onFilesError = (error, file) => {
    console.log('error code ' + error.code + ': ' + error.message);
  };

  getRowStyle(file) {
    if (file.status === 'delete') {
      return {
        backgroundColor: '#faa4a7'
      };
    } else if (file.status === 'update') {
      return {
        backgroundColor: '#f9fa7b'
      };
    } else if (file.status === 'new') {
      return {
        backgroundColor: '#a0fa95'
      };
    } else {
      return null;
    }
  }

  addFiles = (new_files) => {
    let files = [...this.state.files];
    for (let file of new_files) {
      file.first_path = true;
      file.status = 'new';
      files.push(file);
      docInfoStore.changed_files.new_files.push(file);
    }

    this.setState({files});
  };

  updateFile = (index, new_file) => {
    let files = [...this.state.files];

    if (files[index].name !== new_file.name) {
      notify('Назва оновленого файлу повинна відповідати назві оригіналу.');
    } else {
      const file_name = files[index].name;
      const version = files[index].version;
      const old_id = files[index].id;
      files[index] = new_file; // тут json запис про файл замінються об’єктом File, тому додаткову інфу треба записувати ще раз
      files[index].file_name = file_name;
      files[index].old_id = old_id;
      files[index].first_path = true;
      files[index].status = 'update';
      files[index].version = version;

      docInfoStore.changed_files.updated_files.push(files[index]);
      docInfoStore.changed_files.updated_files_info.push(files[index]);
    }
    this.setState({files});
  };

  deleteFile = (e, index) => {
    let files = [...this.state.files];
    if (files[index].status === 'new') {
      let {new_files} = docInfoStore.changed_files;
      new_files = new_files.filter((file) => file.id !== files[index].id)
      docInfoStore.changed_files.new_files = new_files;
      files.splice(index, 1);
    } else {
      files[index].status = 'delete';
      docInfoStore.changed_files.deleted_files.push(files[index]);
    }
    this.setState({files});
  };

  unchangeFile = (e, index) => {
    // Забираємо файл зі списку на видалення/оновлення
    const file_id = this.state.files[index].id;
    let {deleted_files, updated_files, updated_files_info} = docInfoStore.changed_files;
    deleted_files = deleted_files.filter((file) => file.id !== file_id);
    updated_files = updated_files.filter((file) => file.id !== file_id);
    updated_files_info = updated_files_info.filter((file) => file.id !== file_id);
    docInfoStore.changed_files.deleted_files = deleted_files;
    docInfoStore.changed_files.updated_files = updated_files;
    docInfoStore.changed_files.updated_files_info = updated_files_info;
    console.log(docInfoStore.changed_files);

    // Очищаємо this.state.files, щоб очистити зовнішній вигляд таблиці
    let files = [...this.state.files];
    files[index].status = '';
    this.setState({files});
  };

  onSubmit = () => {
    // Перевіряємо, чи не намагається користувач видалити всі файли:
    if (this.state.files.filter((file) => file.status !== 'delete').length === 0) {
      notify('Не можна видалити всі файли, не буде що погоджувати.');
      // Перевіряємо, чи не намагається користувач підтвердити форму, не внесши жодних змін:
    } else if (this.state.files.filter((file) => file.status !== '').length === 0) {
      notify('Ви нічого не змінили.');
    } else {
      this.props.onSubmit(this.state.comment);
      // this.props.onSubmit(this.state.files, this.state.comment);
    }
  };

  // При закритті модального вікна повертаємо дані з props у компонент (щоб зникли непідтверджені зміни)
  // Компонент з закриттям модального вікна не зникає, тому зберігає дані
  // і при наступному відкритті може показати не збережені дані з попереднього відкриття
  onClose = () => {
    const files = this.state.files.map((item) => (item.status = ''));
    this.setState({
      files: files,
      clear_changes: true
    });
    docInfoStore.clearChangedFiles();
    this.props.onCloseModal();
  };

  render() {
    const {files, comment} = this.state;
    return (
      <>
        <div className='modal-header d-flex justify-content-between'>
          <h5 className='modal-title font-weight-bold'>Оновлення або видалення документів</h5>
          <button className='btn btn-link' onClick={this.onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className='modal-body'>
          <table className='table table-bordered table-hover'>
            <colgroup>
              <col className='col-md-8' />
              <col className='col-md-2' />
              <col className='col-md-2' />
            </colgroup>
            <tbody>
              <For each='file' index='index' of={files}>
                <If condition={file.first_path}>
                  <tr key={index} style={this.getRowStyle(file)}>
                    <td>
                      <a href={'../../media/' + file.name} download>
                        {file.name}{' '}
                      </a>
                      <If condition={file.version}>
                        <span className='text-dark font-weight-bold'>v{file.version}</span>
                      </If>
                    </td>
                    <td className='text-center'>
                      <If condition={['', 'update'].includes(file.status)}>
                        <Files
                          className='btn btn-sm btn-outline-secondary'
                          ref='update_file'
                          onChange={(new_files) => this.updateFile(index, new_files[0])}
                          onError={this.onFilesError}
                          maxFiles={10}
                          maxFileSize={10000000}
                          minFileSize={0}
                          clickable
                          multiple={false}
                        >
                          Оновити
                        </Files>
                      </If>
                    </td>
                    <td className='text-center'>
                      <Choose>
                        <When condition={['delete', 'update'].includes(file.status)}>
                          <button className='btn btn-sm btn-outline-secondary ml-1' onClick={(e) => this.unchangeFile(e, index)}>
                            Відмінити
                          </button>
                        </When>
                        <Otherwise>
                          <button className='btn btn-sm btn-outline-secondary ml-1' onClick={(e) => this.deleteFile(e, index)}>
                            Видалити
                          </button>
                        </Otherwise>
                      </Choose>
                    </td>
                  </tr>
                </If>
              </For>
            </tbody>
          </table>
          <Files
            className='btn btn-sm btn-outline-secondary'
            ref='new_files'
            onChange={this.addFiles}
            onError={this.onFilesError}
            multiple
            maxFiles={10}
            maxFileSize={10000000}
            minFileSize={0}
            clickable
          >
            Додати файл(и)
          </Files>
          <hr />
          <label htmlFor='comment_modal'>Прокоментуйте зміни, будь ласка:</label>
          <textarea
            name='comment'
            className='form-control'
            rows='3'
            id='comment_modal'
            onChange={this.onChange}
            value={comment}
            placeholder='Можна залишити пустим'
          />
        </div>

        <div className='modal-footer'>
          <small>При оновленні прикріплених файлів даний електронний документ буде знов запропоновано на розгляд візуючим</small>
          <button className='btn btn-outline-info ml-1' onClick={this.onSubmit}>
            Зберегти зміни
          </button>
        </div>
      </>
    );
  }

  static defaultProps = {
    onCloseModal: {},
    onSubmit: {},
    files: []
  };
}

export default EditFiles;
