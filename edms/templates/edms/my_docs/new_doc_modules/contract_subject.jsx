'use strict';
import * as React from 'react';
import Select from 'react-select';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import TextInput from 'templates/components/form_modules/text_input';

class ContractSubject extends React.Component {
  state = {
    subjects: [],
    text_area_open: false
  };

  componentDidMount() {
    axiosGetRequest('get_contract_subjects_select')
      .then((response) => {
        this.setState({subjects: response});
      })
      .catch((error) => console.log(error));
  }

  onSelectChange = (e) => {
    newDocStore.new_document.contract_subject = e.id;
    newDocStore.new_document.contract_subject_name = e.name;
    newDocStore.new_document.approval_list = e.approval_list;
    newDocStore.new_document.to_work_list = e.to_work_list;
    newDocStore.new_document.contract_subject_input = ''
    this.setState({text_area_open: false});
  };

  notFromListArea = () => {
    this.setState({text_area_open: true});
    newDocStore.new_document.contract_subject = 0;
    newDocStore.new_document.contract_subject_name = '';
    newDocStore.new_document.approval_list = [];
    newDocStore.new_document.to_work_list = [];
  };

  onInputChange = (e) => {
    newDocStore.new_document.contract_subject_input = e.target.value;
  };

  render() {
    const {module_info} = this.props;
    const {subjects, text_area_open} = this.state;

    return (
      <>
        <label className='mr-1'>
          <If condition={module_info.required}>{'* '}</If>
          {module_info.field_name}:
        </label>
        <div className='d-flex'>
          <div className='flex-grow-1'>
            <Select
              options={subjects}
              onChange={this.onSelectChange}
              value={{
                name: newDocStore.new_document.contract_subject_name,
                id: newDocStore.new_document.contract_subject
              }}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
            />
          </div>
          <button className='btn btn-outline-info ml-1' onClick={this.notFromListArea} disabled={text_area_open}>
            Не зі списку
          </button>
        </div>
        <If condition={text_area_open}>
          <TextInput
            text={newDocStore.new_document.contract_subject_input}
            fieldName='Введіть предмет договору'
            onChange={this.onInputChange}
            maxLength={100}
            disabled={false}
          />
        </If>
        <small>
          Якщо потрібного предмету нема в списку, його можна додати на сторінці{' '}
          <a href={`${window.location.origin}/production/contract_subjects/`} target='_blank'>
            Предмети договорів
          </a>
          . Якщо у вас нема прав на додавання предметів у базу, зверніться до керівника
        </small>
        <small className='text-danger'>{module_info?.additional_info}</small>
      </>
    );
  }

  static defaultProps = {
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default view(ContractSubject);
