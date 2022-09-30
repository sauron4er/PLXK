import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {uniqueArray} from 'templates/components/my_extras';
import {getEmpSeats} from 'edms/api/get_emp_seats';
import 'static/css/my_styles.css';
import MultiSelectorWithFilter from "templates/components/form_modules/selectors/multi_selector_with_filter";

class ApprovalList extends React.Component {
  state = {
    approval_list: this.props.approvalList,
    select_approval_id: 0,
    select_approval: '',
    seat_list: JSON.parse(localStorage.getItem('emp_seat_list')) ? JSON.parse(localStorage.getItem('emp_seat_list')) : []
  };

  onChange = (e) => {
    this.setState({
      select_approval_id: e.id,
      select_approval: e.name
    });
    this.addNewApproval(e.id, e.name);

    // const selectedIndex = e.target.options.selectedIndex;
    // this.setState({
    //   select_approval_id: e.target.options[selectedIndex].getAttribute('data-key'),
    //   select_approval: e.target.options[selectedIndex].getAttribute('value')
    // });
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
        this.state.seat_list.length === 0 ? this.setState({seat_list: JSON.parse(localStorage.getItem('emp_seat_list'))}) : null;
      } else {
        this.setState({seat_list: result});
      }
    });
  }

  // надсилає новий список у батьківський компонент:
  changeList = (new_list) => {
    const changed_event = {
      target: {
        name: 'approval_list',
        value: new_list
      }
    };
    this.props.onChange(changed_event);
  };

  // додає нову посаду у список
  addNewApproval = (id, name) => {
    let approval_list = [...this.state.approval_list];
    approval_list.push({
      id: id,
      emp_seat: name,
      approve_queue: 1 // Всі обрані користувачем особи ідуть в черзі після автора і перед директором
    });
    const unique_seats = uniqueArray(approval_list);
    this.setState({
      approval_list: unique_seats,
      select_approval_id: '',
      select_approval: ''
    });
    // надсилаємо новий список у батьківський компонент
    this.changeList(unique_seats);
  };

  // видає посаду з списку
  delApproval = (e, seat_id) => {
    e.preventDefault();
    // надсилаємо новий список у батьківський компонент
    this.changeList(this.state.approval_list.filter((seat) => seat.id !== seat_id));

    this.setState((prevState) => ({approval_list: prevState.approval_list.filter((seat) => seat.id !== seat_id)}));
  };

  render() {
    const {seat_list, select_approval, approval_list} = this.state;
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
          {/*<div className='w-75 d-flex align-items-center mt-1'>*/}
          {/*  <label className='flex-grow-1 text-nowrap mr-1' htmlFor='select_approval'>*/}
          {/*    <If condition={module_info.required}>{'* '}</If>*/}
          {/*    {module_info.field_name}:*/}
          {/*  </label>*/}
          {/*  <select className='form-control' id='select_approval' name='select_approval' value={select_approval} onChange={this.onChange}>*/}
          {/*    <option key={0} data-key={0} value='0'>*/}
          {/*      ------------*/}
          {/*    </option>*/}
          {/*    <For each='seat' index='index' of={seat_list}>*/}
          {/*      <option key={index} data-key={seat.id} value={seat.emp + ', ' + seat.seat}>*/}
          {/*        {seat.emp + ', ' + seat.seat}*/}
          {/*      </option>*/}
          {/*    </For>*/}
          {/*  </select>*/}
          {/*  <button*/}
          {/*    className={*/}
          {/*      select_approval*/}
          {/*        ? 'btn btn-sm font-weight-bold ml-1 css_flash_button'*/}
          {/*        : 'btn btn-sm font-weight-bold ml-1 btn-outline-secondary'*/}
          {/*    }*/}
          {/*    onClick={this.addNewApproval}*/}
          {/*  >*/}
          {/*    <FontAwesomeIcon icon={faPlus} />*/}
          {/*  </button>*/}
          {/*</div>*/}
          <small className='text-danger'>{module_info?.additional_info}</small>

          <If condition={approval_list.length > 0}>
            <ul className='mt-1'>
              <For each='seat' index='index' of={approval_list}>
                <div key={index} className='d-flex align-items-start'>
                  <li>{seat.emp_seat}</li>
                  <button
                    className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                    onClick={(e) => this.delApproval(e, seat.id)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </For>
            </ul>
          </If>
          <br />
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
    approvalList: [],
    module_info: {
      field_name: 'Список на погодження',
      queue: 0,
      required: false,
      additional_info: null
    },
    additionalInfo: ''
  };
}

export {ApprovalList as default};
