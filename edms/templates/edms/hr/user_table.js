'use strict';
import React from 'react';
import Modal from 'react-responsive-modal';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Select from 'react-validation/build/select';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import DxTable from '../dx_table';
import {getIndex} from '../my_extras.js';

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
        this.onRowClick = this.onRowClick.bind(this);
    }

    state = {

        open: false,
        index: '',                  // індекс обраного співробітника у списку
        id: '',                     // id співробітника для форми
        emp: '',                    // ім’я співробітника для форми
        on_vacation: '',            // статус відпустки
        acting: '',                 // ід співробітника, що заміняє даного на час відпустки
        acting_id: '',              // id в.о посади

        seat: '',                   // назва посади для форми
        seat_id: '',                // id посади

        emp_seat: '',               // обрана посада співробітника
        emp_seat_id: '',            // ід запису посади співробітника
        emp_seats_list: [],         // список посад співробітника

        vacation_checked: '',       // чи позначений чекбокс "у відпустці" (для відображення списку людей для в.о.)

        today: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate(),   // сьогоднішня дата

        new_emp_seat_button_label: 'Прийняти на посаду',
        del_emp_seat_button_label: 'Звільнити з посади',

        new_emp: '', // нова людина на посаду замість звільненої
        new_emp_id: '',
        new_emp_is_acting: false,   // чи нова людина оформляється як в.о.
        new_emp_form: <div> </div>,
        new_emp_is_acting_checked: false,

    };

    onChange(event) {
        if (event.target.name === 'acting') { // беремо ід в.о. із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                acting_id: event.target.options[selectedIndex].getAttribute('data-key'),
                acting: event.target.options[selectedIndex].getAttribute('value'),
            });
        }
        else if (event.target.name === 'seat') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                seat_id: event.target.options[selectedIndex].getAttribute('data-key'),
                seat: event.target.options[selectedIndex].getAttribute('value'),
            });
        }
        else if (event.target.name === 'emp_seat') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                emp_seat_id: event.target.options[selectedIndex].getAttribute('value'),
                emp_seat: event.target.options[selectedIndex].getAttribute('data-key'),
            })
        }
        else if (event.target.name === 'new_emp') {
            const selectedIndex = event.target.options.selectedIndex;
            this.state.new_emp_id = event.target.options[selectedIndex].getAttribute('data-key');
            this.state.new_emp = event.target.options[selectedIndex].getAttribute('value');
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
        else if (event.target.name === 'new_emp_is_acting') {
            this.setState({
                new_emp_is_acting: event.target.checked,
                new_emp_is_acting_checked: !this.state.new_emp_is_acting_checked,
            });
            // якщо знімаємо галочку - видалити в.о.
            if (!event.target.checked) {
                this.state.new_emp_seat_id = 0;
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

        axios({
            method: 'post',
            url: '',
            data: querystring.stringify({
                new_emp_seat: '',
                employee: this.state.id,
                seat: this.state.seat_id,
                end_date: null,
                is_active: true,
                is_main: true,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            const new_emp_seat = {
                id: response.data,
                emp_id: this.state.id,
                seat_id: this.state.seat_id,
                emp_seat: this.state.seat,
            };
            this.setState(prevState => ({
                emp_seats_list: [...prevState.emp_seats_list, new_emp_seat],
            }));
            this.setState({
                seat: 0,
                new_emp_seat_button_label: 'Посаду додано...',
            });
            setTimeout(function() { // повертаємо початковий напис на кнопці через 3 сек.
                    this.setState({new_emp_seat_button_label: 'Прийняти на посаду'});
                }.bind(this),3000
            );
        }).catch((error) => {
            console.log('errorpost: ' + error);
        });
    }

    // видаляє обрану посаду співробітника
    delEmpSeat(e) {
        e.preventDefault();

        axios({
            method: 'post',
            url: 'emp_seat/' + this.state.emp_seat_id + '/',
            data: querystring.stringify({
                employee: this.state.id,
                seat: this.state.emp_seat,
                end_date: this.state.today,
                successor_id: this.state.new_emp_id,
                is_active: false,
                is_main: true,
                new_is_main: !this.state.new_emp_is_acting
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            this.setState(prevState => ({
                emp_seats_list: prevState.emp_seats_list.
                filter(emp_seat => emp_seat.id != this.state.emp_seat_id)
            }));
            this.setState({
                emp_seat_id: 0,
                del_emp_seat_button_label: 'З посади звільнено...',
                new_emp_form: <div> </div>,
                new_emp: 0,
            });
            setTimeout(function() { // повертаємо початковий напис на кнопці через 3 сек.
                this.setState({del_emp_seat_button_label: 'Звільнити з посади'});
            }.bind(this),3000);

        }).catch((error) => {
            if (error.response.data === 'active flow') {
                this.props.message('У даного співробітника є документи у роботі. Призначте, будь ласка, на посаду в.о. або нового працівника');
                this.setState({
                    new_emp_form:
                        <div>
                            <div>Прийняти на посаду іншу людину:</div>
                            <div className="d-flex justify-content-between">
                                <Select id='emp-select' name='new_emp' value={this.state.new_emp} onChange={this.onChange}>
                                    <option data-key={0} value='Не внесено'>------------</option>
                                    {
                                        this.props.emps.map(emp => {
                                            return <option key={emp.id} data-key={emp.id}
                                            value={emp.emp}>{emp.emp}</option>;
                                        })
                                    }
                                </Select>

                                <Input className="mx-1" name='new_emp_is_acting' onChange={this.onChange} type="checkbox" checked={this.state.new_emp_is_acting} id="vacation" />
                                <label htmlFor="vacation"> в.о.</label>
                            </div>
                        </div>
                })
            }
        });
    }

    handleSubmit(e) {               // Оновлює запис у списку відділів
        e.preventDefault();
        // TODO реалізувати можливість прийняти людину відразу в статусі в.о., тепер вона заступає на посаду як основну

        // переводимо в null не обрані поля
        let acting_id = this.state.acting_id == 0 ? null : this.state.acting_id;

        let new_emps = this.props.emps;   // клонуємо масив для внесення змін
        this.state.index = getIndex(this.state.id, this.props.emps);  // шукаємо індекс запису, в якому треба внести зміни

        // якщо хоча б одна зміна відбулася:

        if (new_emps[this.state.index].on_vacation !== this.state.on_vacation ||
            new_emps[this.state.index].acting_id !== this.state.acting_id) {

            new_emps[this.state.index].on_vacation = this.state.on_vacation ? 'true' : 'false';
            new_emps[this.state.index].acting_id = parseInt(this.state.acting_id);
            new_emps[this.state.index].acting = this.state.acting;

            axios({
                method: 'post',
                url: 'emp/' + this.state.id + '/',
                data: querystring.stringify({
                    pip: this.state.emp,
                    on_vacation: this.state.on_vacation,
                    acting: acting_id,
                    is_active: true,
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                this.props.changeLists('emps', new_emps);
            }).catch((error) => {
                console.log('errorpost: ' + error);
            });
        }

        this.setState({ open: false }); // закриває модальне вікно
    }

    handleDelete(e) {                   // робить співробітника неактивним
        e.preventDefault();

        if (this.state.emp_seats_list.length > 0) {
            this.props.message('Спочатку звільніть співробітника з усіх посад.');
        }
        else {
            // переводимо в null не обрані поля
            let acting_id = this.state.acting == 0 ? null : this.state.acting_id;

            axios({
                method: 'post',
                url: 'emp/' + this.state.id + '/',
                data: querystring.stringify({
                    pip: this.state.emp,
                    user: this.state.id,
                    on_vacation: this.state.on_vacation,
                    acting: acting_id,
                    is_active: false,
                }),
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                this.props.changeLists('emps', this.props.emps.filter(emp => emp.id !== this.state.id));
            }).catch((error) => {
                console.log('errorpost: ' + error);
            });

            this.setState({ open: false }); // закриває модальне вікно
        }
    }

    onRowClick(row) {
        this.setState({         // інформація про натиснутий рядок
            id: row.id,
            emp: row.emp,
            on_vacation: row.on_vacation === 'true',
            acting: row.acting,
            acting_id: row.acting_id,
            vacation_checked: row.on_vacation === 'true',
        });

        axios({
            method: 'get',
            url: 'get_emp_seats/' + row.id + '/',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            this.setState({
                emp_seats_list: response.data,
            })
        }).then(() => {
            this.onOpenModal();
        }).catch(function (error) {
            console.log('errorpost: ' + error);
        });
    }

    onOpenModal = () => {
        this.setState({ open: true });
    };

    onCloseModal = () => {
        this.setState({ open: false });
    };

    render() {
        const { open, acting, seat, emp_seat_id, new_emp_form } = this.state;

        const users_columns = [
            { name: 'emp', title: 'Співробітники' },
        ];

        const acting_select = this.state.vacation_checked  // відображення селекту для в.о.
        ? <div className="d-flex">
            <label htmlFor="acting-select"> В.о.:</label>
            <Select id='acting-select' name='acting' value={acting} onChange={this.onChange}>
                <option data-key={0} value=''>------------</option>
                {
                    this.props.emps.map(emp => {
                        return <option key={emp.id} data-key={emp.id}
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
            <div style={{height: '100%'}}>
                <button type="button" className="btn btn-outline-secondary mb-1 invisible">Співробітники:</button>
                <DxTable
                    rows={this.props.emps}
                    columns={users_columns}
                    defaultSorting={[{ columnName: "emp", direction: "asc" }]}
                    onRowClick={this.onRowClick}
                    filter
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
                                      this.props.seats.map(seat => {
                                        return <option key={seat.id} data-key={seat.id}
                                          value={seat.seat}>{seat.seat}</option>;
                                      })
                                    }
                                </Select>
                                <Button className="btn btn-outline-secondary mt-1" onClick={this.newUserSeat.bind(this)}>{this.state.new_emp_seat_button_label}</Button>
                            </label>
                        </div>
                        <br/>

                        <div>
                            <label>Посади користувача:
                                <Select id='emp-seat-select' name='emp_seat' value={emp_seat_id} onChange={this.onChange}>
                                    <option data-key={0} value=''>------------</option>
                                    {
                                      this.state.emp_seats_list.map(empSeat => {
                                        return <option key={empSeat.id} data-key={empSeat.seat_id}
                                          value={empSeat.id}>{empSeat.emp_seat}</option>;
                                      })
                                    }
                                </Select>

                                {new_emp_form}

                                <Button className="btn btn-outline-secondary mt-1" onClick={this.delEmpSeat.bind(this)}>{this.state.del_emp_seat_button_label}</Button>
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

export default UserTable;