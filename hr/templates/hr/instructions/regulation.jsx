'use strict';
import * as React from 'react';
import {Loader} from 'templates/components/loaders';
import TextInput from 'templates/components/form_modules/text_input';
import Files from 'templates/components/form_modules/files';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selector_with_filter_and_axios';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import DateInput from 'templates/components/form_modules/date_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {notify} from 'templates/components/my_extras';

class Regulation extends React.Component {
  state = {
    loading: true,
    disabled: true,
    name: '',
    number: '',
    version: '',
    staff_units: '',
    old_files: [],
    new_files: [],
    department: 0,
    department_name: '',
    dep_chief_seat: '',
    date_start: '',
    revision_date: ''
  };

  componentDidMount() {
    if (this.props.id === 0) {
      this.setState({
        loading: false,
        disabled: false
      });
    }
  }

  onChange = (e, field) => {
    this.setState({[field]: e.target.value});
  };

  getDepChiefSeat = (dep_id) => {
    axiosGetRequest('get_dep_chief_seat/' + dep_id + '/')
      .then((response) => {
        this.setState({dep_chief_seat: response});
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
    const {name, number, version, staff_units, old_files, new_files, department, date_start, revision_date} = this.state;

    let formData = new FormData();
    formData.append('name', name);
    formData.append('number', number);
    formData.append('version', version);
    formData.append('staff_units', staff_units);
    formData.append('department', department);
    formData.append('date_start', date_start);
    formData.append('revision_date', revision_date);

    if (new_files?.length > 0) {
      new_files.map((file) => {
        formData.append('new_files', file);
      });
    }

    if (old_files?.length > 0) {
      old_files.map((file) => {
        formData.append('old_files', file);
      });
    }

    axiosPostRequest(`post_regulation/${this.props.id}`, formData)
      .then((response) => {
        console.log(response);
        // location.reload();
      })
      .catch((error) => notify(error));
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
      dep_chief_seat,
      date_start,
      revision_date
    } = this.state;
    return (
      <Choose>
        <When condition={!loading}>
          <h4>Нове положення про відділ</h4>
          <hr />
          <SelectorWithFilterAndAxios
            listNameForUrl='departments'
            fieldName='Відділ/служба'
            selectId='department_select'
            value={{name: department_name, id: department}}
            onChange={this.onDepartmentChange}
            disabled={disabled}
          />
          <If condition={dep_chief_seat}>
            <div>
              Керівник служби/відділу: <span className='font-weight-bold'>{dep_chief_seat}</span>
            </div>
          </If>
          <hr />
          <div className='row'>
            <div className='col-lg-6'>
              <TextInput
                fieldName='Назва документу'
                text={name}
                maxLength={100}
                disabled={disabled}
                onChange={(e) => this.onChange(e, 'name')}
              />
            </div>
            <div className='col-lg-3'>
              <TextInput
                fieldName='Номер документу'
                text={number}
                maxLength={3}
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
          </div>
          <hr />
          <div className='row'>
            <div className='col-lg-6'>
              <TextInput
                fieldName='Кількість штатних одиниць'
                text={staff_units}
                maxLength={3}
                disabled={disabled}
                onChange={(e) => this.onChange(e, 'staff_units')}
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
                date={revision_date}
                fieldName={'Дата наступної ревізії'}
                onChange={(e) => this.onChange(e, 'revision_date')}
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
            disabled={disabled}
          />
          <hr />
          <SubmitButton className='btn btn-outline-info' onClick={() => this.postRegulation()} text={'Зберегти'} disabled={false} />
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
