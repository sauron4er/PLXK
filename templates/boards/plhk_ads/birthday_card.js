'use strict';
import React from 'react';

class BirthdayCard extends React.Component {
  state = {};

  getPhoto = () => {
    const {employee} = this.props;
    if (employee.photo) {
      const filename = employee.photo.substring(employee.photo.lastIndexOf('/') + 1);
      const name = filename
        .split('.')
        .slice(0, -1)
        .join('.');
      return require(`../../../files/media/images/users/${name}.jpg`);
    }
  };

  render() {
    const {employee} = this.props;
    return (
      <div className='card mr-2 css_birthday_card'>
        <If condition={employee.photo}>
          <img className='card-img-top' src={this.getPhoto()} alt='Фотографія' />
        </If>
        <div className='card-body'>
          <h5 className='card-title'>{employee.name}</h5>
          <p className='card-text'>{employee.seat}</p>
        </div>
      </div>
    );
  }

  static defaultProps = {
    employee: []
  };
}

export default BirthdayCard;
