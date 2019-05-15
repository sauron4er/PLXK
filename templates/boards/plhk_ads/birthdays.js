'use strict';
import React from 'react';
import Fireworks from './fireworks';
import BirthdayCard from './birthday_card';
import './ads_styles.css';

class Birthdays extends React.Component {
  state = {};

  render() {
    return (
      <div>
        <div className='h-100' style={{background: 'black'}}>
          <div className='css_happy_birthday'>Вітаємо з Днем народження!</div>
          <div className='d-flex justify-content-center m-2'>
            <For each='employee' of={window.birthdays}>
              <BirthdayCard key={employee.id} employee={employee} />
            </For>
          </div>
        </div>
        {/*<Fireworks />*/}
      </div>
    );
  }
}

export default Birthdays;
