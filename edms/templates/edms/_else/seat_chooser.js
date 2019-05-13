'use strict';
import React from 'react';

class SeatChooser extends React.Component {
  state = {
    my_seat_id: '',
    my_chief: ''
  };

  compareById = (a, b) => {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id) {
        return false;
      }
    }
    return true;
  };

  getChief = () => {
    for (let i = 0; i < window.my_seats.length; i++) {
      if (window.my_seats[i].id === parseInt(localStorage.getItem('my_seat'))) {
        this.setState({
          my_chief: window.my_seats[i].chief
        });
      }
    }
  };

  // отримує посаду з локального сховища, якщо там її нема - записує першу зі списку у window.
  componentDidMount() {
    if (
      JSON.parse(localStorage.getItem('my_seats')) == null ||
      !this.compareById(window.my_seats, JSON.parse(localStorage.getItem('my_seats')))
    ) {
      this.setState({
        my_seat_id: window.my_seats[0].id
      });
      localStorage.setItem('my_seats', JSON.stringify(window.my_seats));
      localStorage.setItem('my_seat', window.my_seats[0].id);
    } else {
      this.setState({
        my_seat_id: localStorage.getItem('my_seat')
          ? localStorage.getItem('my_seat')
          : window.my_seats[0].id
      });
    }
    this.getChief();
  }

  // при зміні ід посади передаємо нове ід у батьківський компонент.
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.my_seat_id !== JSON.parse(localStorage.getItem('my_seat'))) {
      const {my_seat_id} = this.state;
      if (my_seat_id !== prevState.my_seat_id) {
        this.getChief();
        this.props.onSeatChange(parseInt(my_seat_id));
      }
    }
  }

  // При зміні посади змінює ід посади у компоненті, локальному сховищі та відправляє батьківському компоненту
  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    const new_seat_id = event.target.options[selectedIndex].getAttribute('value');
    this.setState({
      my_seat_id: new_seat_id
    });
    // записуємо ід посади у локальне сховище:
    localStorage.setItem('my_seat', new_seat_id);
  };

  render() {
    const {my_seat_id, my_chief} = this.state;
    return (
      <Choose>
        <When condition={window.my_seats.length > 1}>
          <div className='form-group'>
            <div className='form-inline justify-content-end'>
              <div className='form-group mb-1'>
                <label>
                  Оберіть посаду:<pre> </pre>
                </label>
                <select
                  className='form-control'
                  id='my-seat-select'
                  name='my_seat'
                  value={my_seat_id}
                  onChange={this.onChange}
                >
                  {window.my_seats.map((seat) => {
                    return (
                      <option key={seat.id} data-key={seat.id} value={seat.id}>
                        {seat.seat}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <If condition={my_chief}>
              <small className='float-right'>Керівник: {my_chief}</small>
              <br />
            </If>
          </div>
        </When>
        <Otherwise>
          <form className='form-inline justify-content-end'>
            <div className='form-control'>{window.my_seats[0].seat}</div>
            <br />
          </form>
        </Otherwise>
      </Choose>
    );
  }
}

export default SeatChooser;
