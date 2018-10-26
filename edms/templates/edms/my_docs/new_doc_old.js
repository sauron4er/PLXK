'use strict';
import React from 'react';
import Modal from 'react-responsive-modal';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Textarea from 'react-validation/build/textarea';
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
        this.getForm = this.getForm.bind(this);
    }

    state = {
        text: '',
        date: '',
        my_seats: window.my_seats,
        checkedGate: '1',
        carry_out_items: [{id: 1, name: '', quantity: '', measurement: '' }],
        carry_out_text: '',
        work_note_text: '',

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
        doc_type: 0,
    };

    onChange(event) {
        if (event.target.name === 'my_seat') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.state.my_seat_id = event.target.options[selectedIndex].getAttribute('value');
            this.setState({my_seat_id: event.target.options[selectedIndex].getAttribute('value')});
        }
        if (event.target.name === 'gate_radio') { // беремо ід посади із <select>
            this.setState({checkedGate: event.target.value});
        }
        else {
             this.setState({[event.target.name]:event.target.value});
        }
    }

    // Створює форму для модального вікна в залежності від того, яка кнопка була нажата
    getForm() {
        switch (this.state.doc_type) {
            // 1 - звільнююча
            case 1:
                return (
                    <div>
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
                              <Button className="float-sm-left btn btn-outline-secondary mb-1" onClick={this.onCloseModal}>Підтвердити</Button>
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
                                    <Textarea className="full_width" value={this.state.carry_out_text} name='carry_out_text' onChange={this.onChange} maxLength={4000}/>
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
                              <Button className="float-sm-left btn btn-outline-secondary mb-1" onClick={this.onCloseModal}>Підтвердити</Button>
                            </div>
                        </Form>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h4 className="modal-title">Нова службова записка</h4>

                        <Form onSubmit={this.newCarryOut}>
                            <div className="modal-body">

                                <label>Кому:
                                    {/*Список безпосередніх начальників для вибору, кому адресовується службова записка*/}
                                </label> <br />

                                <label className="full_width">Зміст:
                                    <Textarea className="full_width" value={this.state.work_note_text} name='work_note_text' onChange={this.onChange} maxLength={4000}/>
                                </label> <br />

                            </div>

                            <div className="modal-footer">
                              <Button className="float-sm-left btn btn-outline-secondary mb-1" onClick={this.onCloseModal}>Підтвердити</Button>
                            </div>
                        </Form>
                    </div>
                )
        }
    }

    // Додає нову звільнюючу перепустку
    newFreeTime(e) {
        e.preventDefault();

        axios({
            method: 'post',
            url: '',
            data: querystring.stringify({
                new_free_time: '',
                document_type: 1,
                free_day: this.state.date,
                text: this.state.text,
                employee_seat: this.props.my_seat_id,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => { // закриваємо і очищаємо модальне вікно, відправляємо дані нового документа в MyDocs
            document.getElementById("modal_freetime_close").click();

            const today = new Date();
            this.setState({
                date:'',
                text:'',
            });

            this.props.addDoc(response.data, 'Звільнююча перепустка', today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear(), this.props.my_seat_id, 1);
        })
          .catch(function (error) {
            console.log('errorpost: ' + error);
        });
    }

    // Додає новий матеріальний пропуск
    newCarryOut(e) {
        e.preventDefault();

        if (this.state.carry_out_items.length > 0) {

            axios({
                method: 'post',
                url: '',
                data: querystring.stringify({
                    new_carry_out: '',
                    document_type: 2,
                    employee_seat: this.props.my_seat_id,
                    carry_out_day: this.state.date,
                    gate: this.state.checkedGate,
                    carry_out_items: JSON.stringify(this.state.carry_out_items),
                    text: this.state.carry_out_text,
                }),
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => { // закриваємо і очищаємо модальне вікно, відправляємо дані нового документа в MyDocs
                document.getElementById("modal_carryout_close").click();

                const today = new Date();
                this.setState({
                    date:'',
                    carry_out_text:'',
                });

                this.props.addDoc(response.data, 'Матеріальний пропуск', today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear(), this.props.my_seat_id, 2);
            })
              .catch(function (error) {
                console.log('errorpost: ' + error);
            });
        }
    }

    // Додає нову службову записку
    newWorkNote(e) {
        e.preventDefault();

        // axios({
        //     method: 'post',
        //     url: '',
        //     data: querystring.stringify({
        //         new_carry_out: '',
        //         document_type: 2,
        //         employee_seat: this.props.my_seat_id,
        //         carry_out_day: this.state.date,
        //         gate: this.state.checkedGate,
        //         carry_out_items: JSON.stringify(this.state.carry_out_items),
        //         text: this.state.carry_out_text,
        //     }),
        //     headers: {
        //       'Content-Type': 'application/x-www-form-urlencoded'
        //     },
        // }).then((response) => { // закриваємо і очищаємо модальне вікно, відправляємо дані нового документа в MyDocs
        //     document.getElementById("modal_carryout_close").click();
        //
        //     const today = new Date();
        //     this.setState({
        //         date:'',
        //         carry_out_text:'',
        //     });
        //
        //     this.props.addDoc(response.data, 'Матеріальний пропуск', today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear(), this.props.my_seat_id, 2);
        // })
        //   .catch(function (error) {
        //     console.log('errorpost: ' + error);
        // });

    }

    // Отримує з таблиці новий список матеріалів
    getCarryOutItems(carry_out_items) {
        this.setState({
            carry_out_items: carry_out_items,
        })
    }

    onOpenModal(doc_type) {
        this.setState({
            doc_type: doc_type,
            open: true
        });
    };

    onCloseModal = () => {
        this.setState({
            open: false,
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
                    {this.getForm()}
                </Modal>

            </div>
        )
    }
}

// NewDoc.propTypes = {
//       addDoc: PropTypes.func
//     };

export default NewDoc;