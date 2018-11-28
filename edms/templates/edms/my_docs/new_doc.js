'use strict';
import React, {Fragment} from 'react';
import Modal from 'react-awesome-modal';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Textarea from 'react-validation/build/textarea';
import Select from 'react-validation/build/select';
import { FileUploader } from 'devextreme-react';
import axios from 'axios';
import querystring from 'querystring'; // for axios
import DxTable from '../dx_table';
import {required, required_not_0} from '../validations.js';
import '../my_styles.css'

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';


class NewDoc extends React.Component {

    state = {
        name: '',
        text: '',
        date: '',
        files: [],
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
            { columnName: 'id', width: 55 },
            { columnName: 'name'},
            { columnName: 'quantity', width: 70 },
            { columnName: 'measurement', width: 80 },
        ],
        open: false,
        new_doc_type: 0,

        chief_recipient_id: 0, // ід обраного шефа, кому передавати службову записку
        chief_recipient: '', // ім’я обраного шефа, кому передавати службову записку
        chiefs: '', // список шефів для вибору, кому передавати службову записку
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.new_doc_type !== prevState.new_doc_type && this.state.new_doc_type !== 0) {
            this.setState({open: true})
        }
    }

    onChange = (event) => {
        if (event.target.name === 'new_doc_type') { // беремо ід посади із <select>
            this.setState({new_doc_type: parseInt(event.target.value)});
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
    };

    // Створює форму для модального вікна в залежності від того, яка кнопка була нажата
    makeForm() {
        switch (this.state.new_doc_type) {
            // 1 - звільнююча
            case 1:
                return (
                    <Form onSubmit={this.newFreeTime}>
                        <div className="modal-body">
                            <h4 className="modal-title">Нова звільнююча</h4>
                            <br/>
                            <label>День дії звільнюючої:
                                <Input className='form-control' type="date" value={this.state.date} name="date" onChange={this.onChange} validations={[required]}/>
                            </label> <br />
                            <label className="full_width">Куди, з якою метою звільнюєтесь:
                                <Textarea className="form-control full_width" value={this.state.text} name='text' onChange={this.onChange} maxLength={4000} validations={[required]}/>
                            </label> <br />
                        </div>
                        <div className="modal-footer">
                          <Button className="float-sm-left btn btn-outline-success mb-1">Підтвердити</Button>
                        </div>
                    </Form>
                );
            // 2 - матпропуск
            case 2:
                return (
                    <Form onSubmit={this.newCarryOut}>
                        <div className="modal-body">
                            <h4 className="modal-title">Новий матеріальний пропуск</h4>
                            <br/>
                            <label>День виносу:
                                <Input className='form-control' type="date" value={this.state.date} name="date" onChange={this.onChange} validations={[required]}/>
                            </label> <br />

                            <label className='mr-1'>Прохідна №:</label>
                            <input type="radio" name="gate_radio" value='1' onChange={this.onChange} checked={this.state.checkedGate==='1'} /><label className="radio-inline mx-1"> 1</label>
                            <input type="radio" name="gate_radio" value='2' onChange={this.onChange} checked={this.state.checkedGate==='2'} /><label className="radio-inline mx-1"> 2</label>

                            <label className="full_width">Мета виносу:
                                <Textarea className="form-control full_width" value={this.state.text} name='text' onChange={this.onChange} maxLength={4000} validations={[required]}/>
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
                        </div>
                        <div className="modal-footer">
                          <Button className="float-sm-left btn btn-outline-success mb-1">Підтвердити</Button>
                        </div>
                    </Form>
                );
            // 3 - службова записка
            case 3:
                const { chief_recipient } = this.state;
                return (
                    <Form onSubmit={this.newWorkNote}>
                        <div className="modal-body">
                            <h4 className="modal-title">Нова службова записка</h4>
                            <br/>
                            <label>Кому:
                                {/*Список безпосередніх начальників для вибору, кому адресовується службова записка*/}
                                <Select id='to_chief_select' name='chief_recipient' className="form-control full_width" value={chief_recipient} onChange={this.onChange} validations={[required_not_0]}>
                                    <option data-key={0} value='0'>------------</option>
                                    {
                                      this.props.chiefs.map(chief => {
                                        return <option key={chief.id} data-key={chief.id}
                                          value={chief.name}>{chief.name + ', ' + chief.seat}</option>;
                                      })
                                    }
                                </Select>
                            </label> <br />

                            <label className="full_width">Зміст:
                                <Textarea className="form-control full_width" value={this.state.text} name='text' onChange={this.onChange} maxLength={4000} validations={[required]}/>
                            </label> <br />

                            <label className="full_width">Додати файл:
                                <FileUploader
                                    onValueChanged={(e) => this.setState({files: e.value})}
                                    uploadMode='useForm'
                                    multiple={true}
                                    allowCanceling={true}
                                    selectButtonText='Оберіть файл'
                                    labelText='або перетягніть файл сюди'
                                    readyToUploadMessage='Готово'
                                />
                            </label>
                        </div>

                        <div className="modal-footer">
                          <Button className="float-sm-left btn btn-outline-success mb-1">Підтвердити</Button>
                        </div>
                    </Form>
                );
            // 4 - наказ
            case 4:
                return (
                    <Form onSubmit={this.newDecree}>
                        <div className="modal-body">
                            <h4 className="modal-title">Новий проект наказу</h4>
                            <br/>
                            <label className="full_width">Назва:
                                <Textarea className="form-control full_width" value={this.state.name} name='name' onChange={this.onChange} maxLength={4000} validations={[required]}/>
                            </label> <br />
                            <label className="full_width">Преамбула:
                                <Textarea className="form-control full_width" value={this.state.text} name='text' onChange={this.onChange} maxLength={4000} validations={[required]}/>
                            </label> <br />
                            <h3 className='text-center'>НАКАЗУЮ</h3>
                            <label className="full_width">Пункти:
                            </label> <br />
                            <label className="full_width">На погодження:
                            </label> <br />
                            <label className="full_width">Додати файли:
                                <FileUploader
                                    onValueChanged={(e) => this.setState({files: e.value})}
                                    uploadMode='useForm'
                                    multiple={true}
                                    allowCanceling={true}
                                    selectButtonText='Оберіть файл'
                                    labelText='або перетягніть файл сюди'
                                    readyToUploadMessage='Готово'
                                />
                            </label>
                        </div>

                        <div className="modal-footer">
                          <Button className="float-sm-left btn btn-outline-success mb-1">Підтвердити</Button>
                        </div>
                    </Form>
                );
        }
    }

    // Отримує з таблиці новий список матеріалів
    getCarryOutItems = (carry_out_items) => {
        this.setState({
            carry_out_items: carry_out_items,
        })
    };

    // Додає нову звільнюючу перепустку
    newFreeTime = (e) => {
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
    };

    // Додає новий матеріальний пропуск
    newCarryOut = (e) => {
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
    };

    // Додає нову службову записку
    newWorkNote = (e) => {
        e.preventDefault();

        let formData = new FormData();
        if (this.state.files.length > 0) {
            this.state.files.map(file => {
                formData.append("file", file);
            });
        }
        formData.append('document_type', '3');
        formData.append('employee_seat', this.props.my_seat_id);
        formData.append('recipient', this.state.chief_recipient_id);
        formData.append('text', this.state.text);

        axios({
            method: 'post',
            url: '',
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            },
        }).then((response) => {
            const today = new Date();
            this.props.addDoc(response.data, 'Службова записка', today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear(), this.props.my_seat_id, 3);
        }).catch(function (error) {
            console.log('errorpost: ' + error);
        });

        this.onCloseModal();
    };

    // Додає новий наказ
    newDecree = (e) => {};

    onCloseModal = () => {
        this.setState({
            open: false,
            date: '',
            text: '',
            new_doc_type: 0,
        });
    };

    render() {
        const { open, new_doc_type } = this.state;
        return(
            <Fragment>
                <form className="form-inline">
                    <div className="form-group mb-1">
                    <label className='font-weight-bold'>Створити новий документ:<pre> </pre></label>
                    <select className="form-control" id='new-doc-type-select' name='new_doc_type' value={new_doc_type} onChange={this.onChange}>
                        <option key={0} value={0}>---------------------</option>
                        {
                            window.new_docs.map(doc => {
                                return <option key={doc.id} value={doc.id}>{doc.description}</option>;
                            })
                        }
                        {/*<option key={1} value={1}>Звільнююча перепустка</option>*/}
                        {/*<option key={2} value={2}>Матеріальний пропуск</option>*/}
                        {/*<option key={3} value={3}>Службова записка</option>*/}
                        {/*<option key={4} value={4}>Проект наказу</option>*/}
                    </select>
                    </div>
                </form>

                {/*Модальне вікно для форм*/}
                <Modal visible={open} width='45%' effect="fadeInUp" onClickAway={this.onCloseModal} >
                    <div className='css_modal_scroll'>
                        {this.makeForm()}
                    </div>

                    {/*<button type="button" className="close" aria-label="Close" onClick={this.onCloseModal}>*/}
                        {/*<span className='text-danger' aria-hidden="true">&times;</span>*/}
                    {/*</button>*/}
                </Modal>
            </Fragment>
        )
    }
}

export default NewDoc;