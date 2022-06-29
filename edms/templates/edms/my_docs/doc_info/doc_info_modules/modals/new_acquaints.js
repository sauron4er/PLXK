'use strict';
import * as React from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {notify, uniqueArray} from 'templates/components/my_extras';
import {axiosGetRequest} from 'templates/components/axios_requests';
import MultiSelectorWithFilter from 'templates/components/form_modules/multi_selector_with_filter';

class NewAcquaints extends React.Component {
  state = {
    emp_seats: [],
    acquaints: [],
    emp_seat_id: '0',
    emp_seat: ''
  };

  componentWillMount() {
    axiosGetRequest(`get_emp_seats`)
      .then((response) => {
        this.setState({emp_seats: response});
      })
      .catch((error) => notify(error));
  }

  onChange = (e) => {
    this.setState({
      emp_seat_id: e.id,
      emp_seat: e.name
    });
    this.addAcquaint(e.id, e.name);
  };

  addAcquaint = (id, name) => {
    let acquaint_list = [...this.state.acquaints];
    acquaint_list.push({
      emp_seat_id: id,
      emp_seat: name
    });
    const unique_seats = uniqueArray(acquaint_list);
    this.setState({
      acquaints: unique_seats,
      emp_seat_id: '',
      emp_seat: ''
    });
    // надсилаємо новий список у батьківський компонент
    this.changeList(unique_seats);
  };

  delAcquaint = (index) => {
    let acquaints = this.state.acquaints;
    acquaints.splice(index, 1);
    this.setState({acquaints: acquaints});
  };
  
  // заставляє батьківський компонент запостити позначку
  onClick = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state.acquaints);
  };

  render() {
    const {acquaints, emp_seats} = this.state;
    const {onCloseModal} = this.props;
    return (
      <div style={{minHeight: '400px', minWidth: '600px'}}>
        <div className='modal-header d-flex justify-content-between'>
          <h5 className='modal-title font-weight-bold'>Створення списку на ознайомлення</h5>
          <button className='btn btn-link' onClick={onCloseModal}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <Choose>
          <When condition={emp_seats.length > 0}>
            <div className='modal-body'>
              <MultiSelectorWithFilter
                fieldName='На ознайомлення'
                list={emp_seats}
                onChange={this.onChange}
                getOptionLabel={(option) => option.emp + ', ' + option.seat}
                getOptionValue={(option) => option.id}
                disabled={false}
              />

              <If condition={acquaints.length > 0}>
                <ul className='mt-1'>
                  {acquaints.map((acquaint, index) => {
                    return (
                      <div key={index} className='d-flex align-items-start'>
                        <li>{acquaint.emp_seat}</li>
                        <button
                          className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                          onClick={this.delAcquaint.bind(undefined, index)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    );
                  })}
                </ul>
                <button className='btn btn-info' onClick={this.onClick}>
                  Відправити
                </button>
              </If>
            </div>
          </When>
          <Otherwise>
            <div className='mt-4 loader-small' id='loader-1'>
              {' '}
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }

  static defaultProps = {
    resolutions: []
  };
}

export default NewAcquaints;
