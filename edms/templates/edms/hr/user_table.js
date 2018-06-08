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

import {required} from '../validations.js';
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class UserTable extends React.Component {
    constructor(props) {
    super(props);

    // щоб мати доступ до this. із функції треба її прив’язати:
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onTableClick = this.onTableClick.bind(this);
    // this.onEmpSeatClick = this.onEmpSeatClick.bind(this);
    }

    state = {
        emps: window.emps,
        seats: window.seats,
        emps_seats: window.emps_seats,

        open: false,
        index: '',                  // індекс в масиві співробітників для форми
        emp_id: '',                 // id пспівробітника для форми
        emp: '',                    // ім’я співробітника для форми
        on_vacation: '',            // статус відпустки
        acting: '',                 // ід співробітника, що заміняє даного на час відпустки
        acting_id: '',              // id в.о посади

        seat: '',                   // назва посади для форми
        seat_id: '',                // id посади

        emp_seat: '',               // обрана посада співробітника
        emp_seat_id: '',            // ід запису посади співробітника
        emp_seats_list: [],         // список посад співробітника
        emp_seat_selected: 0,      // обраний у селекті запис

        vacation_checked: '',       // чи позначений чекбокс "у відпустці" (для відображення списку людей для в.о.)

        today: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate(),   // сьогоднішня дата
    };

    styles = {
        checkbox_style: {
            display:'flex',
            justifyContent: 'space-between',
        },
    };

    onChange(event) {
        if (event.target.name === 'acting') { // беремо ід в.о. із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.state.acting_id = event.target.options[selectedIndex].getAttribute('data-key');
            this.state.acting = event.target.options[selectedIndex].getAttribute('value');
        }
        else if (event.target.name === 'seat') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.state.seat_id = event.target.options[selectedIndex].getAttribute('data-key');
            this.state.seat = event.target.options[selectedIndex].getAttribute('value');
        }
        else if (event.target.name === 'emp_seat') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.state.emp_seat_selected = selectedIndex - 1;
            this.state.emp_seat_id = event.target.options[selectedIndex].getAttribute('data-key');
            this.state.emp_seat = event.target.options[selectedIndex].getAttribute('value');
        }
        else if (event.target.name === 'on_vacation') {
            this.setState({
                on_vacation: event.target.checked,
                vacation_checked: !this.state.vacation_checked,
            });
            // якщо знімаємо галочку - видалити в.о.
            if (!event.target.checked) {
                this.state.acting_id = 0;
            }
        }
        else {
             this.setState({
                [event.target.name]:event.target.value,
             });
        }
    }

    newUserSeat(e) {               // Оновлює запис у списку відділів
        e.preventDefault();
        // let success = false;

        axios({
            method: 'post',
            url: '',
            data: querystring.stringify({
                new_emp_seat: '',
                employee: this.state.emp_id,
                seat: this.state.seat_id,
                end_date: null,
                is_active: true,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then(function (response) {
            window.location.reload();
            // success = true;
            // console.log('responsepost: ' + response);
        })
            .catch(function (error) {
            console.log('errorpost: ' + error);
        });

        // if (success === true) {
        //     this.state.emps_seats = new_seatUser;
        // }
    }

    delEmpSeat(e) {               // Оновлює запис у списку відділів
        e.preventDefault();
        // let success = false;
        // let new_emp_seats = this.state.emp_seats_list;       // видаляємо запис з масиву
        // new_emp_seats.splice(this.state.emp_seat_selected, 1);

        axios({
            method: 'post',
            url: 'emp_seat/' + this.state.emp_seat_id + '/',
            data: querystring.stringify({
                employee: this.state.emp_id,
                seat: this.state.emp_seat,
                end_date: this.state.today,
                is_active: false,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then(function (response) {
            window.location.reload();
            // success = true;
            // console.log('responsepost: ' + response);
        })
            .catch(function (error) {
            console.log('errorpost: ' + error);
        });

        // if (success === true) {
        //     this.state.emp_seats_list = new_emp_seats;
        // }
    }

    handleSubmit(e) {               // Оновлює запис у списку відділів
        e.preventDefault();
        let success = false;
        let new_emps = this.state.emps;    // Створюємо змінений масив seats, який призначимо this.seats у разі успіху post
        new_emps[this.state.index].profile_id = this.state.emp_id;
        new_emps[this.state.index].emp = this.state.emp;
        new_emps[this.state.index].on_vacation = this.state.on_vacation;
        new_emps[this.state.index].acting = this.state.acting;
        new_emps[this.state.index].acting_id = this.state.acting_id;

        // переводимо в null не обрані поля
        let acting_id = this.state.acting_id == 0 ? null : this.state.acting_id;

        axios({
            method: 'post',
            url: 'emp/' + this.state.emp_id + '/',
            data: querystring.stringify({
                id: this.state.emp_id,
                pip: this.state.emp,
                on_vacation: this.state.on_vacation,
                acting: acting_id,
                is_active: true,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then(function (response) {
            success = true;
            window.location.reload();
            // console.log('responsepost: ' + response);
        })
            .catch(function (error) {
            console.log('errorpost: ' + error);
        });

        if (success === true) {
            this.state.emps = new_emps;

        }

        this.setState({ open: false }); // закриває модальне вікно
    }

    handleDelete(e) {                   // робить відділ неактивним
        e.preventDefault();
        let success = false;
        let new_emps = this.state.emps;       // видаляємо запис з масиву
        new_emps.splice(this.state.index, 1);

        // переводимо в null не обрані поля
        let acting_id = this.state.acting == 0 ? null : this.state.acting_id;

        axios({
            method: 'post',
            url: 'emp/' + this.state.emp_id + '/',
            data: querystring.stringify({
                pip: this.state.emp,
                user: this.state.emp_id,
                on_vacation: this.state.on_vacation,
                acting: acting_id,
                is_active: false,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then(function (response) {
            success = true;
            // console.log('responsepost: ' + response);
        })
            .catch(function (error) {
            console.log('errorpost: ' + error);
        });

        if (success === true) {
            this.state.emps = new_emps;
        }

        this.setState({ open: false }); // закриває модальне вікно
    }

    onTableClick(rowInfo) {
        if (rowInfo !== null) {
            this.setState({         // інформація про натиснутий рядок
                index: rowInfo.index,
                emp_id: rowInfo.original.emp_id,
                emp: rowInfo.original.emp,
                on_vacation: rowInfo.original.on_vacation === 'true',
                acting: rowInfo.original.acting,
                acting_id: rowInfo.original.acting_id,
                vacation_checked: rowInfo.original.on_vacation === 'true',
            });

            this.state.emp_seats_list = [];         // створюємо список посад конкретного користувача
            this.state.emps_seats.map(emp_seat => {
               if (emp_seat.emp_id === rowInfo.original.emp_id) {
                    this.state.emp_seats_list = [...this.state.emp_seats_list, emp_seat];
               }
            });
        }

        // axios({                 // запрошуємо у сервера список посад користувача
        //     method: 'get',
        //     url: 'emp/' + rowInfo.original.emp_id + '/',
        //     headers: {
        //       'Content-Type': 'application/x-www-form-urlencoded'
        //     },
        // }).then((response) => {
        //     this.setState({emp_seats_list: response.data});
        //     // for (i = 1; i<=this.state.emp_seats_list.length; i++) {
        //     //
        //     // }
        //     // console.log('responsepost: ' + response);
        // })
        //   .catch(function (error) {
        //       console.log('errorpost: ' + error);
        // });
    }

    // onEmpSeatClick(rowInfo, data) {          // для таблиці EmpSeat
    //     this.setState({selected_emp_seat: rowInfo.original.seat});
    //     console.log(this.state.selected_emp_seat);
    // }

    onOpenModal = () => {
        this.setState({ open: true });
    };

    onCloseModal = () => {
        this.setState({ open: false });
    };

    render() {
        const { open, acting, seat, emp_seat_id } = this.state;
        const columns = [{
            columns: [
                {
                    Header: 'Співробітники',
                    accessor: 'emp' // String-based value accessors!
                },
            ]
        }];
        const emp_seats_columns = [{
            columns: [
                {
                    Header: 'Посади',
                    accessor: 'emp_seat' // String-based value accessors!
                },
            ]
        }];

        const acting_select = this.state.vacation_checked  // відображення селекту для в.о.
        ? <div className="d-flex">
            <label htmlFor="acting-select"> В.о.:</label>
            <Select id='acting-select' name='acting' value={acting} onChange={this.onChange}>
                <option data-key={0} value=''>------------</option>
                {
                    this.state.emps.map(emp => {
                        return <option key={emp.emp_id} data-key={emp.emp_id}
                            value={emp.emp}>{emp.emp}</option>;
                    })
                }
            </Select>
            <br/><br/>
          </div>
        : <div>
            <br/> <br/>
          </div>;

        return (
            <div>
                <ReactTable
                    data = {this.state.emps}
                    columns={columns}
                    defaultPageSize={16}
                    filterable
                    className="-striped -highlight"

                    getTdProps={(state, rowInfo, column, instance) => {
                        return {
                          onClick: (e, handleOriginal) => {
                            this.onTableClick(rowInfo);
                            this.onOpenModal();
                            if (handleOriginal) {
                              handleOriginal();
                            }
                          }
                        };
                      }}
                />

                <Modal open={open} onClose={this.onCloseModal} center>
                    <p> </p>
                    <Form onSubmit={this.handleSubmit}>
                        <div>
                            <p>{this.state.emp}</p>
                        </div>
                        <div className="d-flex">
                            <Input name='on_vacation' onChange={this.onChange} type="checkbox" checked={this.state.on_vacation} id="vacation" />
                            <label htmlFor="vacation"> у відпустці</label>
                        </div>

                        {acting_select}

                        <div>
                            <label>Нова посада:
                                <Select id='seat-select' name='seat' value={seat} onChange={this.onChange}>
                                    <option data-key={0} value='Не внесено'>------------</option>
                                    {
                                      this.state.seats.map(seat => {
                                        return <option key={seat.id} data-key={seat.id}
                                          value={seat.seat}>{seat.seat}</option>;
                                      })
                                    }
                                </Select>
                                <Button className="mt-1" onClick={this.newUserSeat.bind(this)}>Прийняти на посаду</Button>
                            </label>
                        </div>
                        <br/>

                        <div>
                            <label>Посади користувача__:
                                <Select id='emp-seat-select' name='emp_seat' value={emp_seat_id} onChange={this.onChange}>
                                    <option data-key={0} value=''>------------</option>
                                    {
                                      this.state.emp_seats_list.map(empSeat => {
                                        return <option key={empSeat.id} data-key={empSeat.id}
                                          value={empSeat.emp_seat_id}>{empSeat.emp_seat}</option>;
                                      })
                                    }
                                </Select>
                                {/*<ReactTable        // таблиця EmpSeat*/}
                                    {/*data = {this.state.emp_seats_list}*/}
                                    {/*columns={emp_seats_columns}*/}
                                    {/*defaultPageSize={3}*/}
                                    {/*className="-striped -highlight"*/}
                                    {/*showPageSizeOptions={false}*/}
                                    {/*// showPageJump={false}*/}

                                    {/*getTdProps={(state, rowInfo, column, instance) => {*/}
                                        {/*return {*/}
                                          {/*onClick: (e, handleOriginal) => {*/}
                                            {/*this.onEmpSeatClick(rowInfo);*/}
                                            {/*if (handleOriginal) {*/}
                                              {/*handleOriginal();*/}
                                            {/*}*/}
                                          {/*}*/}
                                        {/*};*/}
                                      {/*}}*/}
                                {/*/>*/}
                                <Button className="mt-1" onClick={this.delEmpSeat.bind(this)}>Звільнити з посади</Button>
                            </label>
                        </div>
                        <br/>

                        <Button className="float-sm-left btn btn-outline-secondary mb-1">Підтвердити</Button>
                        <Button className="float-sm-right btn btn-outline-secondary mb-1" onClick={this.handleDelete.bind(this)}>Звільнити співробітника</Button>
                    </Form>
                </Modal>
            </div>
        )
    }
}

ReactDOM.render(
    <UserTable />,
    document.getElementById('user_table')
);