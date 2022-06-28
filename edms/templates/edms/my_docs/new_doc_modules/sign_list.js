'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {uniqueArray} from 'templates/components/my_extras';
import {getEmpSeats} from "edms/api/get_emp_seats";
import 'static/css/my_styles.css';
import MultiSelectorWithFilter from "templates/components/form_modules/multi_selector_with_filter";

class SignList extends React.Component {
  state = {
    sign_list: this.props.signList,
    select_sign_id: 0,
    select_sign: '',
    seat_list: JSON.parse(localStorage.getItem('emp_seat_list')) ? JSON.parse(localStorage.getItem('emp_seat_list')) : []
  };

  onChange = (e) => {
    this.setState({
      select_sign_id: e.id,
      select_sign: e.name
    });
    
    this.addNewSign(e.id, e.name);
  };

  // перевіряємо, чи оновився список співробітників з часу останнього візиту
  componentWillMount() {
    const get_emp_seats = getEmpSeats();
    get_emp_seats.then((result) => {
      // Якщо result === 0 - змін у базі не виявлено
      if (result === 0) {
        // Але якщо на сторінці два компоненти запитують про зміни,
        // їх правильно покаже тільки перший, всі наступні будуть показувати result===0,
        // але список не оновлять, тому оновлюємо список самі
        this.state.seat_list.length === 0
          ? this.setState({
              seat_list: JSON.parse(localStorage.getItem('emp_seat_list'))
            })
          : null;
      } else {
        this.setState({
          seat_list: result
        });
      }
    });
  }

  // надсилає новий список у батьківський компонент:
  changeList = (new_list) => {
    const changed_event = {
      target: {
        name: 'sign_list',
        value: new_list
      }
    };
    this.props.onChange(changed_event);
  };

  // додає нову посаду у список
  addNewSign = (id, name) => {
    let sign_list = [...this.state.sign_list];
    sign_list.push({
      id: id,
      emp_seat: name
    });
    const unique_seats = uniqueArray(sign_list);
    this.setState({
      sign_list: unique_seats,
      select_sign_id: '',
      select_sign: ''
    });
    // надсилаємо новий список у батьківський компонент
    this.changeList(unique_seats);
  };

  // видає посаду з списку
  delSign = (e, seat_id) => {
    e.preventDefault();
    // надсилаємо новий список у батьківський компонент
    this.changeList(this.state.sign_list.filter((seat) => seat.id !== seat_id));

    this.setState((prevState) => ({
      sign_list: prevState.sign_list.filter((seat) => seat.id !== seat_id)
    }));
  };

  render() {
    const {seat_list, select_sign, sign_list} = this.state;
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
          
          <small className='text-danger'>{module_info?.additional_info}</small>
          <If condition={sign_list.length > 0}>
            <ul className='mt-1'>
              <For each='seat' index='index' of={sign_list}>
                <div key={index} className='d-flex align-items-start'>
                  <li>{seat.emp_seat}</li>
                  <button
                    className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                    onClick={(e) => this.delSign(e, seat.id)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </For>
            </ul>
          </If>
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
    signList: [],
    module_info: {
      field_name: 'Список отримувачів',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export {SignList as default};
// export default SignList;
