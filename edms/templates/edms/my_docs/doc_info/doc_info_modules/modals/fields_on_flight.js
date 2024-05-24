'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from '../doc_info_store';
import TextInput from "templates/components/form_modules/text_input";
import SubmitButton from "templates/components/form_modules/submit_button";

function FieldsOnFlight(props) {
  function onChange(e, index) {
    docInfoStore.info.fields_on_flight[index].text = e.target.value
  }

  function onClick() {
    props.onSubmit();
  }

  function areAllFieldsFilled() {
    for (const field of docInfoStore.info.fields_on_flight) {
      if (field.text === '') return false;
    }
    return true;
  }

  return (
    <>
      <div className='modal-header d-flex justify-content-between'>
        <h5 className='modal-title font-weight-bold'>Додаткові дані</h5>
        <button className='btn btn-link' onClick={props.onCloseModal}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className='modal-body'>
        <For each='field' of={docInfoStore.info.fields_on_flight} index='index'>
          <If condition={parseInt(field.phase_id) === docInfoStore.info.phase_id}>
            <TextInput
              key={index}
              text={field.text}
              fieldName={field.field_name}
              onChange={e => onChange(e, index)}
              maxLength={500}
              disabled={false}
            />
          </If>
        </For>
      </div>
      <div className='modal-footer'>
        <SubmitButton className='btn-info' text='Відправити' onClick={onClick} disabled={!areAllFieldsFilled()} />
      </div>
    </>
  );
}

FieldsOnFlight.defaultProps = {
  onCloseModal: {},
  onSubmit: {}
};

export default view(FieldsOnFlight);
