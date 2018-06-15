'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Select from 'react-validation/build/select';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import {required} from '../validations.js';
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class NewSeat extends React.Component {
    constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    }

    state = {
        seat: '',                   // назва посади для форми
        dep: '',                    // назва відділу для форми
        dep_id: '',                 // id віддлу
        chief: '',                  // керівник відділу для форми
        chief_id: '',               // id керівника відділу
        redirect: false
    };

    deps = window.deps;             // підтягуємо з django необхідні словники
    seats = window.seats;

    styles = {
        textarea_style : {
            width: 400,
            height: 100
        },
    };

    onChange(event) {
         if (event.target.name === 'chief') { // беремо ід керівника із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.state.chief_id = event.target.options[selectedIndex].getAttribute('data-key');
            this.state.chief = event.target.options[selectedIndex].getAttribute('value');
        }
        else if (event.target.name === 'dep') { // беремо ід відділу із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.state.dep_id = event.target.options[selectedIndex].getAttribute('data-key');
            this.state.dep = event.target.options[selectedIndex].getAttribute('value');
        }
        else {
             this.setState({[event.target.name]:event.target.value});
         }
    }


    handleSubmit(e) {               // Оновлює запис у списку відділів
        e.preventDefault();

        // переводимо в null не обрані поля
        let chief_id = this.state.chief_id == 0 ? null : this.state.chief_id;
        let dep_id = this.state.dep_id == 0 ? null : this.state.dep_id;

        axios({
            method: 'post',
            url: '',
            data: querystring.stringify({
                new_seat: '',
                seat: this.state.seat,
                department: dep_id,
                chief: chief_id,
                is_active: true,
            }),
        }).then(function (response) {
            window.location.reload();
            // console.log('responsepost: ' + response);
        })
            .catch(function (error) {
            console.log('errorpost: ' + error);
        });
    }

    render() {
        const { chief, dep } = this.state;   // для <select>

        return (
            <Form onSubmit={this.handleSubmit}>

                    <label>Назва посади:
                            <Input type="text" value={this.state.seat} name='seat' onChange={this.onChange} maxLength={100} size="51" validations={[required]}/>
                        </label><br /><br />

                        <label>Відділ:
                            <Select id='dep-select' name='dep' value={dep} onChange={this.onChange}>
                                <option data-key={0} value='Не внесено'>------------</option>
                                {
                                  this.deps.map(dep => {
                                    return <option key={dep.id} data-key={dep.id}
                                      value={dep.dep}>{dep.dep}</option>;
                                  })
                                }
                            </Select>
                        </label>
                        <br /><br/>

                        <label>Керівник:
                            <Select id='chief-select' name='chief' value={chief} onChange={this.onChange}>
                                <option data-key={0} value='Не внесено'>------------</option>
                                {
                                  this.seats.map(seat => {
                                    return <option key={seat.id} data-key={seat.id}
                                      value={seat.seat}>{seat.seat}</option>;
                                  })
                                }
                            </Select>
                        </label>
                        <br/><br/>

                        <Button className="float-sm-left">Підтвердити</Button>
                </Form>
        )
    }
}

ReactDOM.render(
    <NewSeat />,
    document.getElementById('new_seat')
);