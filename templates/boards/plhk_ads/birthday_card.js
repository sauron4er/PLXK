'use strict';
import React from 'react';

class BirthdayCard extends React.Component {
  state = {};

  render() {
    const {employee} = this.props;
    return (
      <div className="card mr-2 css_birthday_card">
        <img className="card-img-top" src={'images/users/' + employee.photo} alt="Фотографія" />
          <div className="card-body">
            <h5 className="card-title">{employee.name}</h5>
            <p className="card-text">{employee.seat}</p>
          </div>
      </div>
    );
  }
  
  static defaultProps = {
    employee: []
  }
}

export default BirthdayCard;
