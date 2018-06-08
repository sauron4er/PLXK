'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import Form from 'react-validation/build/form';
import Button from 'react-validation/build/button';
import Select from 'react-validation/build/select';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import {required, first_option} from '../validations.js';
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class NewUser extends React.Component {
    constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    }

    state = {
        new_users: window.new_users,
        seats: window.seats,
        new_user_id: '',
        new_user: '',
        seat_id: '',
        seat: '',
    };

    onChange(event) {   // при зміні вибору у <select>
        const selectedIndex = event.target.options.selectedIndex;
        if (event.target.name === 'new_user') { // беремо ід керівника із <select>
            this.state.new_user = event.target.options[selectedIndex].getAttribute('value');
            this.state.new_user_id = event.target.options[selectedIndex].getAttribute('data-key');
        }
        if (event.target.name === 'seat') { // беремо ід посади із <select>
            this.state.seat = event.target.options[selectedIndex].getAttribute('value');
            this.state.seat_id = event.target.options[selectedIndex].getAttribute('data-key');
        }
    }


    handleSubmit(e) {               // Оновлює запис у списку відділів
        e.preventDefault();

        // axios({
        //     method: 'post',
        //     url: 'dep/' + this.state.id + '/',
        //     data: querystring.stringify({
        //         id: this.state.id,
        //         name: this.state.dep,
        //         text: this.state.text,
        //         manager: chief_id,
        //         is_active: true,
        //     }),
        //     headers: {
        //       'Content-Type': 'application/x-www-form-urlencoded'
        //     },
        // }).then(function (response) {
        //     // console.log('responsepost: ' + response);
        // })
        //     .catch(function (error) {
        //     console.log('errorpost: ' + error);
        // });
        //
        // this.setState(prevState => ({   // видаляємо із списку нових юзерів того, якому щойно створили профіль.
        //     new_users: prevState.new_users.filter(el => el != this.state.new_user_id )
        // }));
    }

    render() {
        const { new_user, seat, } = this.state;   // для <select>

        return (
            <Form onSubmit={this.handleSubmit}>
                <label>Оберіть користувача зі списку:
                    <Select id='new-user-select' name='new_user' value={new_user} onChange={this.onChange} validations={[required]}>
                        <option data-key={0} value='' disabled>------------</option>
                        {
                          this.state.new_users.map(new_user => {
                            return <option key={new_user.id} data-key={new_user.id}
                              value={new_user.name}>{new_user.name}</option>;
                          })
                        }
                    </Select>
                </label><br /><br />

                <label>Оберіть посаду:
                    <Select id='seat-select' name='seat' value={seat} onChange={this.onChange} select_name="посаду" validations={[first_option]}>
                        <option data-key={0} value='' disabled>------------</option>
                        {
                          this.state.seats.map(seat => {
                            return <option key={seat.id} data-key={seat.id}
                              value={seat.seat}>{seat.seat}</option>;
                          })
                        }
                    </Select>
                </label><br /><br />

                <Button className="float-sm-left">Підтвердити</Button>
            </Form>
        )
    }
}

ReactDOM.render(
    <NewUser />,
    document.getElementById('new_user')
);