'use strict';
import * as React from 'react';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import SelectorWithFilter from 'templates/components/form_modules/selectors/selector_with_filter';
import { axiosGetRequest } from "templates/components/axios_requests";
import { notify } from "templates/components/my_extras";
import useSetState from "templates/hooks/useSetState";
import newDocStore from './new_doc_store';

function DepAndSeatChoose(props) {
  const [state, setState] = useSetState({
      department: 0,
      department_name: '',
      dep_chief_seat: 0,
      dep_chief_seat_name: '',
      seats: [],
      seat: 0,
      seat_name: '',
      chief_seat_name: '',
  })

  function onDepartmentChange(e) {
    getDepSeats(e.id);
    setState({
      department: e.id,
      department_name: e.name,
      seat: 0,
      seat_name: '',
      chief_seat_name: ''
    });
    getDepChiefSeat(e.id);
  }

  function getDepSeats(dep_id) {
    axiosGetRequest(`get_dep_seats/${dep_id}`)
      .then((response) => {
        setState({seats: response});
      })
      .catch((error) => notify(error));
  }

  function getDepChiefSeat(dep_id) {
    axiosGetRequest('get_dep_chief_seat/' + dep_id + '/')
      .then((response) => {
        setState({
          dep_chief_seat: response.id,
          dep_chief_seat_name: response.name
        });
      })
      .catch((error) => console.log(error));
  }

  function onSeatChange (e) {
    setState({
      seat: e.id,
      seat_name: e.name,
      chief_seat_name: e.chief_seat_name
    });
    newDocStore.new_document.dep_seat = {
      department: state.department,
      seat: state.seat
    }
  }

  return (
    <div className='row'>
      <div className='col-lg-6'>
        <SelectorWithFilterAndAxios
          listNameForUrl='departments/all'
          fieldName='Відділ/служба'
          selectId='department_select'
          value={{name: state.department_name, id: state.department}}
          onChange={onDepartmentChange}
          disabled={false}
        />
        <div>
          Керівник відділу: <span className='font-weight-bold'>{state.dep_chief_seat_name}</span>
        </div>
      </div>
      <div className='col-lg-6'>
        <SelectorWithFilter
          list={state.seats}
          fieldName='Посада'
          selectId='seat_select'
          value={{name: state.seat_name, id: state.seat}}
          onChange={onSeatChange}
          disabled={!state.department}
        />
        <div>
          Безпосередній начальник: <span className='font-weight-bold'>{state.chief_seat_name}</span>
        </div>
      </div>
    </div>
  );
}

DepAndSeatChoose.defaultProps = {

};

export default DepAndSeatChoose;
