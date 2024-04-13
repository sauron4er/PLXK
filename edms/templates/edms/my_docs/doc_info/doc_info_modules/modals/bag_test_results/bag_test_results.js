'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import useSetState from 'templates/hooks/useSetState';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import CheckboxInput from 'templates/components/form_modules/checkbox_input';
import FilesUpload from 'templates/components/files_uploader/files_upload';
import {notify} from 'templates/components/my_extras';

function BagTestResults(props) {
  const [state, setState] = useSetState({
    test_date: '',
    meets_tech_specs: false,
    meets_tech_specs_comment: '',
    meets_certificate: false,
    meets_certificate_comment: '',
    meets_dimensions: false,
    meets_dimensions_comment: '',
    meets_dimensions_files: [],
    meets_density: false,
    meets_density_comment: '',
    meets_density_files: [],
    meets_client_requirements: false,
    meets_client_requirements_comment: '',
    tech_conditions_are_in_certificate: false,
    tech_conditions_are_in_certificate_comment: '',
    tech_conditions_are_in_certificate_files: [],
    sample_is_compliant: false,
    sample_is_compliant_comment: '',
    test_report_date: ''
  });

  function onFieldChange(event, field_name) {
    setState({[field_name]: event.target.value});
  }

  function onCheckBoxChange(event, field_name) {
    setState({[field_name]: !state[field_name]});
  }

  function onFilesChange(e, field_name) {
    setState({[field_name]: e.target.value});
  }

  function onClick(e) {
    e.preventDefault();
    if (!state.test_date || !state.test_report_date) {
      notify('Заповніть поля "Дата закінчення тестування" та "Дата оформлення звіту"')
    } else {
      props.onSubmit(state);
    }
  }

  return (
    <>
      <div className='modal-header d-flex justify-content-between'>
        <h5 className='modal-title font-weight-bold'>Внесіть, будь ласка, результати тестування</h5>
        <button className='btn btn-link' onClick={props.onCloseModal}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className='modal-body'>
        <DateInput
          date={state.test_date}
          fieldName={'Дата закінчення попереднього тестування взірця'}
          onChange={(e) => onFieldChange(e, 'test_date')}
          disabled={false}
        />
        <hr />
        <CheckboxInput
          checked={state.meets_tech_specs}
          fieldName={state.meets_tech_specs ? 'Відповідає ТУ У' : 'Не відповідає ТУ У'}
          onChange={(e) => onCheckBoxChange(e, 'meets_tech_specs')}
        />
        <TextInput
          text={state.meets_tech_specs_comment}
          fieldName='Коментар'
          onChange={(e) => onFieldChange(e, 'meets_tech_specs_comment')}
          maxLength={500}
          disabled={false}
        />
        <hr />
        <CheckboxInput
          checked={state.meets_certificate}
          fieldName={
            state.meets_certificate
              ? 'Відповідає показникам сертифікату якості (якість паперу, колір, опір на розрив)'
              : 'Не відповідає показникам сертифікату якості (якість паперу, колір, опір на розрив)'
          }
          onChange={(e) => onCheckBoxChange(e, 'meets_certificate')}
        />
        <TextInput
          text={state.meets_certificate_comment}
          fieldName='Коментар'
          onChange={(e) => onFieldChange(e, 'meets_certificate_comment')}
          maxLength={500}
          disabled={false}
        />
        <hr />
        <CheckboxInput
          checked={state.meets_dimensions}
          fieldName={state.meets_dimensions ? 'Відповідає розмірам' : 'Не відповідає розмірам'}
          onChange={(e) => onCheckBoxChange(e, 'meets_dimensions')}
        />
        <div className='row'>
          <TextInput
            className='col-8'
            text={state.meets_dimensions_comment}
            fieldName='Коментар'
            onChange={(e) => onFieldChange(e, 'meets_dimensions_comment')}
            maxLength={500}
            disabled={false}
          />
          <FilesUpload
            className='col-4 mt-0'
            onChange={(files) => onFilesChange(files, 'meets_dimensions_files')}
            files={state.meets_dimensions_files}
            module_info={{field_name: 'Фото'}}
            multiple={true}
          />
        </div>
        <hr />
        <CheckboxInput
          checked={state.meets_density}
          fieldName={state.meets_density ? 'Відповідає щільності' : 'Не відповідає щільності'}
          onChange={(e) => onCheckBoxChange(e, 'meets_density')}
        />
        <div className='row'>
          <TextInput
            className='col-8'
            text={state.meets_density_comment}
            fieldName='Коментар'
            onChange={(e) => onFieldChange(e, 'meets_density_comment')}
            maxLength={500}
            disabled={false}
          />
          <FilesUpload
            className='col-4 mt-0'
            onChange={(files) => onFilesChange(files, 'meets_density_files')}
            files={state.meets_density_files}
            module_info={{field_name: 'Фото'}}
            multiple={true}
          />
        </div>
        <hr />
        <CheckboxInput
          checked={state.meets_client_requirements}
          fieldName={
            state.meets_client_requirements
              ? 'Відповідає вимогам клієнта (збереження продукції)'
              : 'Не відповідає вимогам клієнта (збереження продукції)'
          }
          onChange={(e) => onCheckBoxChange(e, 'meets_client_requirements')}
        />
        <TextInput
          text={state.meets_client_requirements_comment}
          fieldName='Коментар'
          onChange={(e) => onFieldChange(e, 'meets_client_requirements_comment')}
          maxLength={500}
          disabled={false}
        />
        <hr />
        <CheckboxInput
          checked={state.tech_conditions_are_in_certificate}
          fieldName={
            state.tech_conditions_are_in_certificate
              ? 'Зазначені технічні умови наявні у сертифікаті якості'
              : 'Зазначені технічні умови НЕ наявні у сертифікаті якості'
          }
          onChange={(e) => onCheckBoxChange(e, 'tech_conditions_are_in_certificate')}
        />
        <div className='row'>
          <TextInput
            className='col-8'
            text={state.tech_conditions_are_in_certificate_comment}
            fieldName='Коментар'
            onChange={(e) => onFieldChange(e, 'tech_conditions_are_in_certificate_comment')}
            maxLength={500}
            disabled={false}
          />
          <FilesUpload
            className='col-4 mt-0'
            onChange={(files) => onFilesChange(files, 'tech_conditions_are_in_certificate_files')}
            files={state.tech_conditions_are_in_certificate_files}
            module_info={{field_name: 'Фото'}}
            multiple={true}
          />
        </div>
        <hr />

        <div className='p-2 rounded' style={state.sample_is_compliant ? {background: 'lightgreen'} :  {background: 'pink'}}>
          <CheckboxInput
            checked={state.sample_is_compliant}
            fieldName={state.sample_is_compliant ? 'ВИСНОВОК: Взірець відповідає вимогам' : 'ВИСНОВОК: Взірець НЕ відповідає вимогам'}
            onChange={(e) => onCheckBoxChange(e, 'sample_is_compliant')}
          />
          <div className='row'>
            <TextInput
              className='col-8'
              text={state.sample_is_compliant_comment}
              fieldName='Коментар'
              onChange={(e) => onFieldChange(e, 'sample_is_compliant_comment')}
              maxLength={500}
              disabled={false}
            />
            <DateInput
              className='col-4'
              date={state.test_report_date}
              fieldName={'Дата оформлення звіту'}
              onChange={(e) => onFieldChange(e, 'test_report_date')}
              disabled={false}
            />
          </div>
        </div>
        <hr />
      </div>
      <div className='modal-footer'>
        <button className='btn btn-outline-info' onClick={onClick}>
          Відправити
        </button>
      </div>
    </>
  );
}

BagTestResults.defaultProps = {
  onCloseModal: {},
  onSubmit: {}
};

export default BagTestResults;
