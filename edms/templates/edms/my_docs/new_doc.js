'use strict';
import React from 'react';
import Modal from 'react-responsive-modal';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Textarea from 'react-validation/build/textarea';
import Select from 'react-validation/build/select';
import { FileUploader } from 'devextreme-react';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import DxTable from '../dx_table';
import {required} from '../validations.js';
import '../my_styles.css'

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';


class NewDoc extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.newFreeTime = this.newFreeTime.bind(this);
        this.newCarryOut = this.newCarryOut.bind(this);
        this.newWorkNote = this.newWorkNote.bind(this);
        this.getCarryOutItems = this.getCarryOutItems.bind(this);
        this.makeForm = this.makeForm.bind(this);
    }

    state = {
        text: '',
        date: '',
        file: [],
        my_seats: window.my_seats,
        checkedGate: '1',
        carry_out_items: [{id: 1, name: '', quantity: '', measurement: '' }],

        carry_out_columns: [
            { name: 'id', title: '№' },
            { name: 'name', title: 'Найменування' },
            { name: 'quantity', title: 'К-сть' },
            { name: 'measurement', title: 'Од. виміру' },
        ],
        carry_out_col_width: [
            { columnName: 'id', width: 70 },
            { columnName: 'name'},
            { columnName: 'quantity', width: 80 },
            { columnName: 'measurement', width: 110 },
        ],
        open: false,
        new_doc_type: 0,

        chief_recipient_id: 0, // ід обраного шефа, кому передавати службову записку
        chief_recipient: '', // ім’я обраного шефа, кому передавати службову записку
        chiefs: '' // список шефів для вибору, кому передавати службову записку
    };

    onChange(event) {
        if (event.target.name === 'my_seat') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.state.my_seat_id = event.target.options[selectedIndex].getAttribute('value');
            this.setState({my_seat_id: event.target.options[selectedIndex].getAttribute('value')});
        }
        else if (event.target.name === 'gate_radio') { // беремо ід посади із <select>
            this.setState({checkedGate: event.target.value});
        }
        else if (event.target.name === 'chief_recipient') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                chief_recipient_id: event.target.options[selectedIndex].getAttribute('data-key'),
                chief_recipient: event.target.options[selectedIndex].getAttribute('value'),
            });
        }
        else {
             this.setState({[event.target.name]:event.target.value});
        }
    }

    // Створює форму для модального вікна в залежності від того, яка кнопка була нажата
    makeForm() {
        switch (this.state.new_doc_type) {
            // 1 - звільнююча
            case 1:
                return (
                    <div className="width_40vh">
                        <h4 className="modal-title">Нова звільнююча</h4>
                        <Form onSubmit={this.newFreeTime}>
                            <div className="modal-body">

                                <label>День дії звільнюючої:
                                    <Input type="date" value={this.state.date} name="date" onChange={this.onChange} validations={[required]}/>
                                </label> <br />

                                <label className="full_width">Куди, з якою метою звільнюєтесь:
                                    <Textarea className="full_width" value={this.state.text} name='text' onChange={this.onChange} maxLength={4000}/>
                                </label> <br />

                            </div>

                            <div className="modal-footer">
                              <Button className="float-sm-left btn btn-outline-secondary mb-1">Підтвердити</Button>
                            </div>
                        </Form>
                    </div>
                );
            // 2 - матпропуск
            case 2:
                return (
                    <div>
                        <h4 className="modal-title">Новий матеріальний пропуск</h4>
                        <Form onSubmit={this.newCarryOut}>
                            <div className="modal-body">

                                <label>День виносу:
                                    <Input type="date" value={this.state.date} name="date" onChange={this.onChange} validations={[required]}/>
                                </label> <br />

                                <label>Виніс через прохідну:</label>
                                <span> </span>
                                <label className="radio-inline"><input type="radio" name="gate_radio" value='1' onChange={this.onChange} checked={this.state.checkedGate==='1'} />№ 1</label>
                                <span> </span>
                                <label className="radio-inline"><input type="radio" name="gate_radio" value='2' onChange={this.onChange} checked={this.state.checkedGate==='2'} />№ 2</label>
                                <br />

                                <label className="full_width">Мета виносу:
                                    <Textarea className="full_width" value={this.state.text} name='text' onChange={this.onChange} maxLength={4000}/>
                                </label> <br />

                                <label>Список матеріальних цінностей:</label>
                                    <DxTable
                                        rows={this.state.carry_out_items}
                                        columns={this.state.carry_out_columns}
                                        colWidth={this.state.carry_out_col_width}
                                        edit
                                        // onRowClick={this.onRowClick}
                                        getData={this.getCarryOutItems}
                                        paging
                                    />
                                 <br /> <br />

                            </div>

                            <div className="modal-footer">
                              <Button className="float-sm-left btn btn-outline-secondary mb-1">Підтвердити</Button>
                            </div>
                        </Form>
                    </div>
                );
            // 3 - службова записка
            case 3:
                const { chief_recipient } = this.state;
                return (
                    <div className="width_40vh">
                        <h4 className="modal-title">Нова службова записка</h4>

                        <Form onSubmit={this.newWorkNote}>
                            <div className="modal-body">

                                <label>Кому:
                                    {/*Список безпосередніх начальників для вибору, кому адресовується службова записка*/}
                                    <Select id='to_chief_select' name='chief_recipient' className="full_width" value={chief_recipient} onChange={this.onChange}>
                                        <option data-key={0} value='Не внесено'>------------</option>
                                        {
                                          this.props.chiefs.map(chief => {
                                            return <option key={chief.id} data-key={chief.id}
                                              value={chief.name}>{chief.name + ', ' + chief.seat}</option>;
                                          })
                                        }
                                    </Select>
                                </label> <br />

                                <label className="full_width">Зміст:
                                    <Textarea className="full_width" value={this.state.text} name='text' onChange={this.onChange} maxLength={4000} validations={[required]}/>
                                </label> <br />

                                <label className="full_width">Додати файл:
                                    <FileUploader
                                        onValueChanged={(e) => {this.setState({file: e.value})}}
                                        uploadMode='useForm'
                                    />
                                </label> <br />
                            </div>

                            <div className="modal-footer">
                              <Button className="float-sm-left btn btn-outline-secondary mb-1">Підтвердити</Button>
                            </div>
                        </Form>
                    </div>
                )
        }
    }

    // Отримує з таблиці новий список матеріалів
    getCarryOutItems(carry_out_items) {
        this.setState({
            carry_out_items: carry_out_items,
        })
    }

    // Додає нову звільнюючу перепустку
    newFreeTime(e) {
        e.preventDefault();

        axios({
            method: 'post',
            url: '',
            data: querystring.stringify({
                document_type: 1,
                free_day: this.state.date,
                text: this.state.text,
                employee_seat: this.props.my_seat_id,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            const today = new Date();
            this.props.addDoc(response.data, 'Звільнююча перепустка', today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear(), this.props.my_seat_id, 1);
        })
          .catch(function (error) {
            console.log('errorpost: ' + error);
        });

        this.onCloseModal();
    }

    // Додає новий матеріальний пропуск
    newCarryOut(e) {
        e.preventDefault();

        if (this.state.carry_out_items.length > 0) {

            axios({
                method: 'post',
                url: '',
                data: querystring.stringify({
                    document_type: 2,
                    employee_seat: this.props.my_seat_id,
                    carry_out_day: this.state.date,
                    gate: this.state.checkedGate,
                    carry_out_items: JSON.stringify(this.state.carry_out_items),
                    text: this.state.text,
                }),
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                const today = new Date();
                this.props.addDoc(response.data, 'Матеріальний пропуск', today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear(), this.props.my_seat_id, 2);
            })
              .catch(function (error) {
                console.log('errorpost: ' + error);
            });

            this.onCloseModal();
        }
    }

    // Додає нову службову записку
    newWorkNote(e) {
        e.preventDefault();

        axios({
            method: 'post',
            url: '',
            data: querystring.stringify({
                document_type: 3,
                employee_seat: this.props.my_seat_id,
                recipient: parseInt(this.state.chief_recipient_id),
                text: this.state.text,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            const today = new Date();
            this.props.addDoc(response.data, 'Службова записка', today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear(), this.props.my_seat_id, 3);
        }).catch(function (error) {
            console.log('errorpost: ' + error);
        });

        this.onCloseModal();
    }

    onOpenModal(doc_type) {
        this.setState({
            new_doc_type: doc_type,
            open: true
        });
    };

    onCloseModal = () => {
        this.setState({
            open: false,
            date: '',
            text: '',
            new_doc_type: '',
        });
    };

    render() {
        const { open } = this.state;
        return(
            <div>

                <div>Створити новий документ:</div>
                <button type="button" className="btn btn-outline-secondary mb-1 w-100" onClick={() => this.onOpenModal(1)}>Звільнююча перепустка</button>
                <button type="button" className="btn btn-outline-secondary mb-1 w-100" onClick={() => this.onOpenModal(2)}>Матеріальний пропуск</button>
                <button type="button" className="btn btn-outline-secondary mb-1 w-100" onClick={() => this.onOpenModal(3)}>Службова записка</button>

                {/*Модальне вікно для форм*/}
                <Modal open={open} onClose={this.onCloseModal} center>
                    {this.makeForm()}
                </Modal>

            </div>
        )
    }
}

export default NewDoc;