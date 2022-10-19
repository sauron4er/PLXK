'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {uniqueArray} from 'templates/components/my_extras';
// import {getEmpSeats} from 'edms/api/get_emp_seats';
import 'static/css/my_styles.css';
import MultiSelectorWithFilter from 'templates/components/form_modules/selectors/multi_selector_with_filter';
import newDocStore from "edms/templates/edms/my_docs/new_doc_modules/new_doc_store";

class AcquaintList extends React.Component {
  state = {
    acquaint_list: this.props.acquaintList,
    select_acquaint_id: 0,
    select_acquaint: '',
    seat_list: JSON.parse(localStorage.getItem('emp_seat_list')) ? JSON.parse(localStorage.getItem('emp_seat_list')) : []
  };
  
  // перевіряємо, чи оновився список співробітників з часу останнього візиту
  componentWillMount() {
    this.setState({seat_list: newDocStore.emps_seats_from_local_storage})
    
    // const get_emp_seats = getEmpSeats();
    // get_emp_seats.then((result) => {
    //   // Якщо result === 0 - змін у базі не виявлено
    //   if (result === 0) {
    //     // Але якщо на сторінці два компоненти запитують про зміни,
    //     // їх правильно покаже тільки перший, всі наступні будуть показувати result===0,
    //     // але список не оновлять, тому оновлюємо список самі
    //     this.state.seat_list.length === 0 ? this.setState({seat_list: JSON.parse(localStorage.getItem('emp_seat_list'))}) : null;
    //   } else {
    //     this.setState({seat_list: result});
    //   }
    // });
  }

  onChange = (e) => {
    this.setState({
      select_acquaint_id: e.id,
      select_acquaint: e.name
    });
    this.addNewAcquaint(e.id, e.name)
  };
  
    // додає нову посаду у список
  addNewAcquaint = (id, name) => {
    let acquaint_list = [...this.state.acquaint_list];
    acquaint_list.push({
      id: id,
      emp_seat: name
    });
    const unique_seats = uniqueArray(acquaint_list);
    console.log(unique_seats);
    this.setState({
      acquaint_list: unique_seats,
      select_acquaint_id: '',
      select_acquaint: ''
    });
    // надсилаємо новий список у батьківський компонент
    this.changeList(unique_seats);
  };

  // надсилає новий список у батьківський компонент:
  changeList = (new_list) => {
    const changed_event = {
      target: {
        name: 'acquaint_list',
        value: new_list
      }
    };
    this.props.onChange(changed_event);
  };

  // видає посаду з списку
  delAcquaint = (e, seat_id) => {
    e.preventDefault();
    // надсилаємо новий список у батьківський компонент
    this.changeList(this.state.acquaint_list.filter((seat) => seat.id !== seat_id));

    this.setState((prevState) => ({
      acquaint_list: prevState.acquaint_list.filter((seat) => seat.id !== seat_id)
    }));
  };

  render() {
    const {seat_list, select_acquaint, acquaint_list} = this.state;
    const {module_info} = this.props;
    return (
      <Choose>
        <When condition={seat_list.length > 0}>
          <MultiSelectorWithFilter
            fieldName={module_info.required ? `* ${module_info.field_name}` : module_info.field_name}
            list={seat_list}
            onChange={this.onChange}
            getOptionLabel={(option) => option.emp + ', ' + option.seat}
            getOptionValue={(option) => option.id}
            disabled={false}
          />
          
          <If condition={acquaint_list.length > 0}>
            <ul className='mt-1'>
              <For each='seat' index='index' of={acquaint_list}>
                <div key={index} className='d-flex align-items-start'>
                  <li>{seat.emp_seat}</li>
                  <button
                    className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                    onClick={(e) => this.delAcquaint(e, seat.id)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </For>
            </ul>
          </If>
          {/*<br />*/}
        </When>
        <Otherwise>
          <div className='mt-3 loader-small' id='loader-1'>
            {' '}
          </div>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    acquaintList: [],
    module_info: {
      field_name: 'Список отримувачів',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export {AcquaintList as default};
// export default AcquaintList;
