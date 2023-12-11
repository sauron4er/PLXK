'use strict';
import * as React from 'react';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Modal from 'react-responsive-modal';
import EmployeePAM from 'boards/templates/boards/phones/employee_pam';
import PhonesIn from "boards/templates/boards/phones/phones_in";
import PhonesOut from "boards/templates/boards/phones/phones_out";

class Phones extends React.Component {
  state = {
    type: 'in' // , 'out'
  };

  onTypeChange = (e) => {
    this.setState({type: e.target.value});
  };

  render() {
    const {type} = this.state;

    return (
      <div className='mt-3' style={{margin: 'auto', height: '90%', width: '95%', position: 'absolute'}}>
        <div className='d-flex justify-content-between'>
          <h4>Телефонний та поштовий довідник</h4>
          <div>
            <input type='radio' name='type_radio' value='in' id='in' onChange={this.onTypeChange} checked={type === 'in'} />
            <label className='radio-inline mx-1' htmlFor={'in'}>
              {' '}
              Внутрішні номери
            </label>
            <input type='radio' name='type_radio' value='out' id='out' onChange={this.onTypeChange} checked={type === 'out'} />
            <label className='radio-inline mx-1' htmlFor={'out'}>
              {' '}
              Зовнішні номери
            </label>
          </div>
        </div>
        <Choose>
          <When condition={type==='in'}>
            <PhonesIn />
          </When>
          <Otherwise>
            <PhonesOut />
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

export default Phones;
