'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import Modal from 'react-responsive-modal';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Select from 'react-validation/build/select';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import MyTable from '../my_table';
import {required} from '../validations.js';
import {getIndex} from '../my_extras.js';

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

// seats table with modal change_dep window
class SeatsTable extends React.Component {
    constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
  }
    state = {
        open: false,
        id: '',                     // id посади для форми
        seat: '',                   // назва посади для форми
        index: '',                  // індекс в масиві посад для форми
        dep: '',                    // назва відділу для форми
        dep_id: '',                 // id відділу
        chief: '',                  // керівник посади для форми
        chief_id: '',               // id керівника посади
        is_free_time_chief: false,  // право підписувати звільнюючі
        is_carry_out_chief: false,  // право підписувати мат.пропуски
        is_vacant: true,            // чи є посада вакантною
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
        else if (event.target.name === 'is_free_time_chief') {
            this.setState({
                is_free_time_chief: event.target.checked,
            });
        }
        else if (event.target.name === 'is_carry_out_chief') {
            this.setState({
                is_carry_out_chief: event.target.checked,
            });
        }
        else {
             this.setState({[event.target.name]:event.target.value});
         }
    }

    handleSubmit(e) {               // Оновлює запис у списку відділів
        e.preventDefault();
        let success = false;
        let new_seats = this.seats;    // Створюємо змінений масив seats, який призначимо this.seats у разі успіху post
        this.state.index = getIndex(this.state.id, this.seats);  // шукаємо індекс запису, в якому треба внести зміни
        new_seats[this.state.index].id = this.state.id;
        new_seats[this.state.index].seat = this.state.seat;
        new_seats[this.state.index].dep = this.state.dep;
        new_seats[this.state.index].dep_id = this.state.dep_id;
        new_seats[this.state.index].chief = this.state.chief;
        new_seats[this.state.index].chief_id = this.state.chief_id;

        // переводимо в null не обрані поля
        let chief_id = this.state.chief_id == 0 ? null : this.state.chief_id;
        let dep_id = this.state.dep_id == 0 ? null : this.state.dep_id;

        axios({
            method: 'post',
            url: 'seat/' + this.state.id + '/',
            data: querystring.stringify({
                id: this.state.id,
                seat: this.state.seat,
                is_free_time_chief: this.state.is_free_time_chief,
                is_carry_out_chief:this.state.is_carry_out_chief,
                department: dep_id,
                chief: chief_id,
                is_active: true,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then(function (response) {
            success = true;
            // console.log('responsepost: ' + response);
        }).catch(function (error) {
            console.log('errorpost: ' + error);
        });

        if (success === true) {
            this.seats = new_seats;
        }

        this.setState({ open: false }); // закриває модальне вікно
    }

    handleDelete(e) {                   // робить відділ неактивним
        e.preventDefault();
        let success = false;
        let new_seats = this.seats;       // видаляємо запис з масиву
        this.state.index = getIndex(this.state.id, this.seats);  // шукаємо індекс запису, в якому треба внести зміни
        new_seats.splice(this.state.index, 1);

        // переводимо в null не обрані поля
        let chief_id = this.state.chief_id == 0 ? null : this.state.chief_id;
        let dep_id = this.state.dep_id == 0 ? null : this.state.dep_id;

        axios({
            method: 'post',
            url: 'seat/' + this.state.id + '/',
            data: querystring.stringify({
                id: this.state.id,
                seat: this.state.seat,
                is_free_time_chief: this.state.is_free_time_chief,
                is_carry_out_chief:this.state.is_carry_out_chief,
                department: dep_id,
                chief: chief_id,
                is_active: false,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then(function (response) {
            success = true;
            // console.log('responsepost: ' + response);
        }).catch(function (error) {
            console.log('errorpost: ' + error);
        });
        if (success === true) {
            this.seats = new_seats;
            window.location.reload();
        }

        this.setState({ open: false }); // закриває модальне вікно
    }

    onRowClick(row) {
        this.setState({         // інформація про натиснутий рядок
            id: row.id,
            seat: row.seat,
            dep: row.dep,
            dep_id: row.dep_id,
            chief: row.chief,
            chief_id: row.chief_id,
            is_free_time_chief: row.is_free_time_chief === 'true',
            is_carry_out_chief: row.is_carry_out_chief === 'true',
            is_vacant: row.is_vacant === 'true',
        });
        this.onOpenModal();
    }

    onOpenModal = () => {
        this.setState({ open: true });
    };

    onCloseModal = () => {
        this.setState({ open: false });
    };

    render() {
        const { open, chief, dep } = this.state;

        const seats_columns = [
            { name: 'seat', title: 'Посада' },
            { name: 'dep', title: 'Відділ' },
        ];

        return (
            <div>
                <MyTable
                    rows={this.seats}
                    columns={seats_columns}
                    defaultSorting={[{ columnName: "seat", direction: "asc" }]}
                    onRowClick={this.onRowClick}
                    redRow="is_vacant"
                    filter
                />
                <Modal open={open} onClose={this.onCloseModal} center>
                    <br/>
                    <p>Внесіть зміни при необхідності:</p>

                    <Form onSubmit={this.handleSubmit}>

                        <label>Назва посади:
                            <Input type="text" value={this.state.seat} name='seat' onChange={this.onChange} maxLength={100} size="51" validations={[required]}/>
                            <div className="d-flex">
                                <Input name='is_free_time_chief' onChange={this.onChange} type="checkbox" checked={this.state.is_free_time_chief} id="is_free_time_chief" />
                                <label htmlFor="is_free_time_chief"> право підписувати звільнюючі заяви підлеглих</label>
                            </div>
                            <div className="d-flex">
                                <Input name='is_carry_out_chief' onChange={this.onChange} type="checkbox" checked={this.state.is_carry_out_chief} id="is_carry_out_chief" />
                                <label htmlFor="is_carry_out_chief"> право підписувати мат.пропуски</label>
                            </div>
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

                        <Button className="float-sm-left btn btn-outline-secondary mb-1">Підтвердити</Button>
                        <Button className="float-sm-right btn btn-outline-secondary mb-1" onClick={this.handleDelete}>Видалити посаду</Button>
                    </Form>
                </Modal>
            </div>
        )
    }
}

ReactDOM.render(
    <SeatsTable />,
    document.getElementById('seats_table')
);