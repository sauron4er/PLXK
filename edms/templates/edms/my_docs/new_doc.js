'use strict';
import React from 'react';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Textarea from 'react-validation/build/textarea';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import MyTable from '../my_table';
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
        this.getCarryOutItems = this.getCarryOutItems.bind(this);
    }

    state = {
        text: '',
        date: '',
        my_seats: window.my_seats,
        checkedGate: '1',
        carry_out_items: [{id: 1, name: '', quantity: '', measurement: '' }],
        carry_out_text: '',
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

                this.props.addDoc(response.data, 'Матеріальний пропуск', today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear(), this.props.my_seat_id, 1);
            })
              .catch(function (error) {
                console.log('errorpost: ' + error);
            });
        }
    }

    // Отримує з таблиці новий список матеріалів
    getCarryOutItems(carry_out_items) {
        this.setState({
            carry_out_items: carry_out_items,
        })
    }

    render() {
        return(
            <div>

                <div>Створити новий документ:</div>
                <button type="button" className="btn btn-outline-secondary mb-1 w-100" data-toggle="modal" data-target="#modalNewFreePass" id="button_new_free_pass">Звільнююча перепустка</button>
                <button type="button" className="btn btn-outline-secondary mb-1 w-100" data-toggle="modal" data-target="#modalNewCarryOut" id="button_new_carry_out">Матеріальний пропуск</button>

                {/*форма нової звільнюючої*/}
                <div className="container">
                  <div className="modal fade" id="modalNewFreePass">
                    <div className="modal-dialog modal-md modal-dialog-centered">
                      <div className="modal-content">

                        <div className="modal-header">
                          <h4 className="modal-title">Нова звільнююча</h4>
                          <button type="button" className="close" data-dismiss="modal" id="modal_freetime_close">&times;</button>
                        </div>

                        <Form onSubmit={this.newFreeTime}>
                            <div className="modal-body">

                                <label>День дії звільнюючої:
                                    <Input type="date" value={this.state.date} name="date" onChange={this.onChange} validations={[required]}/>
                                </label> <br /> <br />

                                <label className="full_width">Куди, з якою метою звільнюєтесь:
                                    <Textarea className="full_width" value={this.state.text} name='text' onChange={this.onChange} maxLength={4000}/>
                                </label> <br /> <br />

                            </div>

                            <div className="modal-footer">
                              <Button className="float-sm-left btn btn-outline-secondary mb-1">Підтвердити</Button>
                            </div>
                        </Form>

                      </div>
                    </div>
                  </div>
                </div>

                {/*форма нового матеріального пропуску*/}
                <div className="container">
                  <div className="modal fade" id="modalNewCarryOut">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                      <div className="modal-content">

                        <div className="modal-header">
                          <h4 className="modal-title">Новий матеріальний пропуск</h4>
                          <button type="button" className="close" data-dismiss="modal" id="modal_carryout_close">&times;</button>
                        </div>

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
                                    <MyTable
                                        rows={this.state.carry_out_items}
                                        columns={[
                                            { name: 'id', title: '№' },
                                            { name: 'name', title: 'Найменування' },
                                            { name: 'quantity', title: 'К-сть' },
                                            { name: 'measurement', title: 'Од. виміру' },
                                        ]}
                                        colWidth={[
                                            { columnName: 'id', width: 60 },
                                            { columnName: 'name', width: 290 },
                                            { columnName: 'quantity', width: 80 },
                                            { columnName: 'measurement', width: 110 },
                                        ]}
                                        edit
                                        // onRowClick={this.onRowClick}
                                        getData={this.getCarryOutItems}
                                    />
                                 <br /> <br />

                            </div>

                            <div className="modal-footer">
                              <Button className="float-sm-left btn btn-outline-secondary mb-1">Підтвердити</Button>
                            </div>
                        </Form>

                      </div>
                    </div>
                  </div>
                </div>
            </div>
        )
    }
}

// NewDoc.propTypes = {
//       addDoc: PropTypes.func
//     };

export default NewDoc;