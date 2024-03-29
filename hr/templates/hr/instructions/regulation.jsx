'use strict';
import * as React from 'react';
import {Loader} from 'templates/components/loaders';
import TextInput from 'templates/components/form_modules/text_input';
import Files from 'templates/components/form_modules/files';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import DateInput from 'templates/components/form_modules/date_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {notify} from 'templates/components/my_extras';

class Regulation extends React.Component {
  state = {
    loading: true,
    disabled: !window.edit_enabled,
    name: '',
    number: '',
    version: '',
    staff_units: '',
    old_files: [],
    new_files: [],
    department: 0,
    department_name: '',
    dep_chief_seat: 0,
    dep_chief_seat_name: '',
    date_start: '',
    date_revision: ''
  };

  componentDidMount() {
    if (this.props.id !== 0) {
      axiosGetRequest(`get_regulation/${this.props.id}`)
        .then((response) => {
          this.setState({...response});
        })
        .catch((error) => notify(error));
    }
    this.setState({loading: false});
  }

  onChange = (e, field) => {
    this.setState({[field]: e.target.value});
  };

  getDepChiefSeat = (dep_id) => {
    axiosGetRequest('get_dep_chief_seat/' + dep_id + '/')
      .then((response) => {
        this.setState({
          dep_chief_seat: response.id,
          dep_chief_seat_name: response.name
        });
      })
      .catch((error) => console.log(error));
  };

  onDepartmentChange = (e) => {
    this.setState({
      department: e.id,
      department_name: e.name
    });
    this.getDepChiefSeat(e.id);
  };

  postRegulation = () => {
    const {name, number, version, staff_units, old_files, new_files, department, date_start, date_revision} = this.state;

    let formData = new FormData();
    formData.append('name', name);
    formData.append('number', number);
    formData.append('version', version);
    formData.append('staff_units', staff_units);
    formData.append('department', department);
    formData.append('date_start', date_start);
    formData.append('date_revision', date_revision);
    formData.append('old_files', JSON.stringify(old_files));

    if (new_files?.length > 0) {
      new_files.map((file) => {
        formData.append('new_files', file);
      });
    }

    axiosPostRequest(`post_regulation/${this.props.id}`, formData)
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  };

  deactivateRegulation = () => {
    axiosGetRequest(`deact_regulation/${this.props.id}`)
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  };

  deleteFile = (id) => {
    const {old_files} = this.state;
    for (const i in old_files) {
      if (old_files.hasOwnProperty(i) && old_files[i].id === id) {
        old_files[i].status = 'delete';
        break;
      }
    }
    this.setState({old_files});
  };

  render() {
    const {
      loading,
      disabled,
      name,
      number,
      version,
      staff_units,
      old_files,
      new_files,
      department,
      department_name,
      dep_chief_seat_name,
      date_start,
      date_revision
    } = this.state;
    return (
      <Choose>
        <When condition={!loading}>
          <h4>Положення про відділ</h4>
          <hr />
          <SelectorWithFilterAndAxios
            listNameForUrl='deps_for_regulations'
            fieldName='Відділ/служба'
            selectId='department_select'
            value={{name: department_name, id: department}}
            onChange={this.onDepartmentChange}
            disabled={disabled}
          />

          <div>
            Керівник служби/відділу: <span className='font-weight-bold'>{dep_chief_seat_name}</span>
          </div>

          <hr />
          <div className='row'>
            <div className='col-lg-8'>
              <TextInput
                fieldName='Назва документу'
                text={name}
                maxLength={100}
                disabled={disabled}
                onChange={(e) => this.onChange(e, 'name')}
              />
            </div>
            <div className='col-lg-4'>
              <TextInput
                fieldName='Кількість штатних одиниць'
                text={staff_units}
                maxLength={3}
                disabled={disabled}
                onChange={(e) => this.onChange(e, 'staff_units')}
              />
            </div>
          </div>
          <hr />
          <div className='row'>
            <div className='col-lg-3'>
              <TextInput
                fieldName='Номер документу'
                text={number}
                maxLength={12}
                disabled={disabled}
                onChange={(e) => this.onChange(e, 'number')}
              />
            </div>
            <div className='col-lg-3'>
              <TextInput
                fieldName='Номер редакції'
                text={version}
                maxLength={3}
                disabled={disabled}
                onChange={(e) => this.onChange(e, 'version')}
              />
            </div>
            <div className='col-lg-3 col-6'>
              <DateInput
                date={date_start}
                fieldName={'Дата введення в дію'}
                onChange={(e) => this.onChange(e, 'date_start')}
                disabled={disabled}
              />
            </div>
            <div className='col-lg-3 col-6'>
              <DateInput
                date={date_revision}
                fieldName={'Дата наступної ревізії'}
                onChange={(e) => this.onChange(e, 'date_revision')}
                disabled={disabled}
              />
            </div>
          </div>
          <hr />
          <Files
            oldFiles={old_files}
            newFiles={new_files}
            fieldName='Завантажити файл документу'
            onChange={(e) => this.onChange(e, 'new_files')}
            onDelete={this.deleteFile}
            disabled={disabled}
          />
          <hr />
          <If condition={!disabled}>
            <div className='d-flex'>
              <SubmitButton
                className='btn btn-outline-info'
                onClick={() => this.postRegulation()}
                text={'Зберегти'}
                disabled={
                  !department || !name || !number || !version || !staff_units || !date_start || !(old_files.length || new_files.length)
                }
              />
              <SubmitButton className='btn btn-outline-danger ml-auto' onClick={() => this.deactivateRegulation()} text={'Видалити'} />
            </div>
          </If>
        </When>
        <Otherwise>
          <Loader />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    id: 0
  };
}

export default Regulation;
