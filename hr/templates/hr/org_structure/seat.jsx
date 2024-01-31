import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import 'css/org_structure.css';
import {Loader} from 'templates/components/loaders';
import TextInput from 'templates/components/form_modules/text_input';
import { axiosGetRequest } from "templates/components/axios_requests";
import { notify } from "templates/components/my_extras";

function Seat(props) {
  const [state, setState] = useSetState({
    name: props.seat_name,
    employees: [],
    instruction_files: [],
    is_dep_chief: false,
    chief: {
      id: 0, name: ''
    },
    loading: true
  });

  useEffect(() => {
    getSeat()
  }, [])

  function onSeatNameChange(e) {
    setState({name: e.target.value});
  }

  function getSeat() {
    axiosGetRequest(`get_seat/${props.id}`)
      .then((response) => {
        setState({
          employees: response.employees,
          instruction_files: response.instruction_files,
          is_dep_chief: response.is_dep_chief,
          chief: response.chief,
          loading: false
        });
      })
      .catch((error) => notify(error));
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
            <div><h4>{state.name}</h4>
              <div>{state.is_dep_chief ? "Начальник відділу" : ""}</div>
              <div>{state.chief.name ? "Керівник: " + state.chief.name : "Керівника для посади не обрано"}</div>
            </div>
          </Otherwise>
        </Choose>
      </div>
      <Choose>
        <When condition={!state.loading}>
          <div className='modal-body'>
            <Choose>
              <When condition={state.instruction_files.length > 0}>
                <div>Посадова інструкція:</div>
                <For each='file' index='file_index' of={state.instruction_files}>
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
              <When condition={state.employees.length > 0}>
                <div>Співробітники, що займають дану посаду:</div>
                <ul>
                  <For each='emp' index='emp_index' of={state.employees}>
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
  id: 0,
  seat_name: ''
};

export default Seat;
