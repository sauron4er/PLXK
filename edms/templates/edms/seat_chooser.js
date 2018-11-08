'use strict';
import React from "react";

class SeatChooser extends React.Component {
    state = {
        my_seat_id: '', // id посади для select
    };

    // отримує посаду з локального сховища, якщо там її нема - записує першу зі списку у window.
    componentDidMount() {
        if (window.my_id != localStorage.getItem('my_id')) {
            this.setState({
                my_seat_id: window.my_seats[0].id,
            });
            localStorage.setItem('my_id', window.my_id);
            localStorage.setItem('my_seat', window.my_seats[0].id);
        }
        else {
            this.setState({
                my_seat_id: localStorage.getItem('my_seat') ? localStorage.getItem('my_seat') : window.my_seats[0].id,
            });
        }
    }

    // призміні ід посади передаємо нове ід у батьківський компонент.
    componentDidUpdate(prevProps, prevState, snapshot) {
        const {my_seat_id} = this.state;
        if (my_seat_id !== prevState.my_seat_id) {
            this.props.onSeatChange(parseInt(my_seat_id));
        }
    }


    // При зміні посади змінює ід посади у компоненті, локальному сховищі та відправляє батьківському компоненту
    onChange = (event) => {
        if (event.target.name === 'my_seat') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            const new_seat_id = event.target.options[selectedIndex].getAttribute('value');
            this.setState({
                my_seat_id: new_seat_id
            });
            // записуємо ід посади у локальне сховище:
            localStorage.setItem('my_seat', new_seat_id);
        }
    };

    render() {
        const {my_seat_id} = this.state;
        return(
            <Choose>
                <When condition = {window.my_seats.length > 1}>
                    <form className="form-inline">
                        <div className="form-group mb-1">
                        <label>Оберіть посаду:<pre> </pre></label>
                        <select className="form-control" id='my-seat-select' name='my_seat' value={my_seat_id} onChange={this.onChange}>
                            {
                                window.my_seats.map(seat => {
                                    return <option key={seat.id} data-key={seat.id}
                                        value={seat.id}>{seat.seat}</option>;
                                })
                            }
                        </select>
                        </div>
                    </form>
                </When>
                <Otherwise>
                    <div>{window.my_seats[0].seat}</div><br/>
                </Otherwise>
            </Choose>
        )
    }
}

export default SeatChooser;