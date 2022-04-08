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
import SelectorWithFilter from 'templates/components/form_modules/selector_with_filter';

class Instruction extends React.Component {
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
    dep_chief_seat: 0,
    dep_chief_seat_name: '',
    dep_seats: [],
    all_seats: [],
    seat: 0,
    seat_name: '',
    chief_seat: 0,
    chief_seat_name: '',
    date_start: '',
    date_revision: ''
  };

  componentDidMount() {
    if (this.props.id === 0) {
      this.setState({
        loading: false,
        disabled: false
      });
    } else {
      axiosGetRequest(`get_instruction/${this.props.id}`)
        .then((response) => {
          this.setState({
            instruction: response,
            loading: false
          });
        })
        .catch((error) => notify(error));
    }
  }

  onChange = (e, field) => {
    this.setState({[field]: e.target.value});
  };

  getDepChiefSeat = (dep_id) => {
    axiosGetRequest('get_dep_chief_seat/' + dep_id + '/')
      .then((response) => {
        this.setState({
          dep_chief_seat: response.id,
          dep_chief_seat_name: response.name,
        });
      })
      .catch((error) => console.log(error));
  };

  onDepartmentChange = (e) => {
    axiosGetRequest(`get_dep_seats/${e.id}`)
      .then((response) => {
        this.setState({dep_seats: response});
      })
      .catch((error) => notify(error));

    this.setState({
      department: e.id,
      department_name: e.name
    });
    this.getDepChiefSeat(e.id);
  };

  onSeatChange = (e) => {
    const {dep_chief_seat, dep_seats} = this.state;
    if (e.id === dep_chief_seat) {
      axiosGetRequest(`get_seats_for_select`)
      .then((response) => {
        this.setState({all_seats: response});
      })
      .catch((error) => notify(error));
    } else {
      this.setState({all_seats: dep_seats})
    }
    
    this.setState({
      seat: e.id,
      seat_name: e.name
    });
  };

  onChiefSeatChange = (e) => {
    this.setState({
      chief_seat: e.id,
      chief_seat_name: e.name
    });
  };

  postInstruction = () => {
    const {name, number, version, staff_units, old_files, new_files, department, seat, chief_seat, date_start, date_revision} = this.state;

    let formData = new FormData();
    formData.append('name', name);
    formData.append('number', number);
    formData.append('version', version);
    formData.append('staff_units', staff_units);
    formData.append('department', department);
    formData.append('seat', seat);
    formData.append('chief_seat', chief_seat);
    formData.append('date_start', date_start);
    formData.append('date_revision', date_revision);

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

    axiosPostRequest(`post_instruction/${this.props.id}`, formData)
      .then((response) => {
        location.reload();
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
      dep_seats,
      all_seats,
      seat,
      seat_name,
      chief_seat,
      chief_seat_name,
      dep_chief_seat,
      dep_chief_seat_name,
      date_start,
      date_revision
    } = this.state;
    return (
      <Choose>
        <When condition={!loading}>
          <h4>Нова посадова інструкція</h4>
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
              Керівник служби/відділу: <span className='font-weight-bold'>{dep_chief_seat_name}</span>
            </div>
          </If>
          <hr />
          <div className='row'>
            <div className='col-lg-6'>
              <SelectorWithFilter
                list={dep_seats}
                fieldName='Посада'
                selectId='seat_select'
                value={{name: seat_name, id: seat}}
                onChange={this.onSeatChange}
                disabled={!department}
              />
            </div>
            <div className='col-lg-6'>
              <SelectorWithFilter
                list={all_seats}
                fieldName='Безпосередній керівник'
                selectId='chief_seat_select'
                value={{name: chief_seat_name, id: chief_seat}}
                onChange={this.onChiefSeatChange}
                disabled={!seat}
              />
            </div>
          </div>
          <hr />
          <TextInput
            fieldName='Назва документу'
            text={name}
            maxLength={100}
            disabled={disabled}
            onChange={(e) => this.onChange(e, 'name')}
          />
          <hr />
          <div className='row'>
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
            disabled={disabled}
          />
          <hr />
          <SubmitButton
            className='btn btn-outline-info'
            onClick={() => this.postRegulation()}
            text={'Зберегти'}
            disabled={!department || !name || !number || !version || !staff_units || !date_start || !(old_files.length || new_files.length)}
          />
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

export default Instruction;
