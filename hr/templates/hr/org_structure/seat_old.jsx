import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import 'css/org_structure.css';
import {Loader} from 'templates/components/loaders';
import TextInput from 'templates/components/form_modules/text_input';

function Seat(props) {
  const [state, setState] = useSetState({
    name: props.seat_name
  });

  function onSeatNameChange(e) {
    setState({name: e.target.value});
  }

  return (
    <>
      <div className='modal-header'>
        <Choose>
          <When condition={window.edit_access}>
            <TextInput
              text={state.name}
              fieldName={'Назва'}
              onChange={onSeatNameChange}
              maxLength={200}
              disabled={!edit_access}
            />
          </When>
          <Otherwise>
            <h4>{state.name}</h4>
          </Otherwise>
        </Choose>
      </div>
      <Choose>
        <When condition={!props.loading}>
          <div className='modal-body'>
            <Choose>
              <When condition={props.files.length > 0}>
                <div>Посадова інструкція:</div>
                <For each='file' index='file_index' of={props.files}>
                  <div key={file_index}>
                    <a href={'../../media/' + file.file} target='_blank'>
                      {file.name}{' '}
                    </a>
                  </div>
                </For>
              </When>
              <Otherwise>
                <div className='font-weight-bold'>Інструкцію не внесено в базу</div>
              </Otherwise>
            </Choose>
            <hr />
            <Choose>
              <When condition={props.employees.length > 0}>
                <div>Співробітники, що займають дану посаду:</div>
                <ul>
                  <For each='emp' index='emp_index' of={props.employees}>
                    <li key={emp_index}>{emp.name}</li>
                  </For>
                </ul>
              </When>
              <Otherwise>
                <div className='font-weight-bold'>Відповідних працівників нема в базі.</div>
              </Otherwise>
            </Choose>
          </div>
          {/*<div className='modal-footer'></div>*/}
        </When>
        <Otherwise>
          <Loader />
        </Otherwise>
      </Choose>
    </>
  );
}

Seat.defaultProps = {
  seat_name: '',
  loading: true,
  files: [],
  employees: []
};

export default Seat;
