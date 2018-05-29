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
import Textarea from 'react-validation/build/textarea';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import {required} from '../validations.js'
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

// departments table with modal change_dep window
class DepTable extends React.Component {
    constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
     state = {
        open: false,
        id: '',                      // id відділу для форми
        dep: '',                    // назва відділу для форми
        index: '',                  // індекс в масиві відділів для форми
        text: '',                   // опис відділу для форми
        chief: '',                  // керівник відділу для форми
        chief_id: '',               // id керівника відділу
    };

    deps = window.deps;             // підтягуємо з django необхідні словники
    emps = window.emps;


    styles = {
        textarea_style : {
            width: 400,
            height: 100
        },
    };

    onChange(event, id) {
        this.setState({[event.target.name]:event.target.value});
        if (event.target.name === 'chief') { // беремо ід керівника із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.state.chief_id = event.target.options[selectedIndex].getAttribute('data-key');
        }
    }

    handleSubmit(e) {               // Оновлює запис у списку відділів
        e.preventDefault();
        let new_deps = this.deps;   // Отримує значення із форми і змінює масив deps
        new_deps[this.state.index].id = this.state.id;
        new_deps[this.state.index].dep = this.state.dep;
        new_deps[this.state.index].text = this.state.text;
        new_deps[this.state.index].chief = this.state.chief;
        new_deps[this.state.index].chief_id = this.state.chief_id;

        console.log('update');

        this.deps = new_deps;

        axios({
            method: 'post',
            url: 'dep/' + this.state.id + '/',
            data: querystring.stringify({
                id: this.state.id,
                name: this.state.dep,
                text: this.state.text,
                manager: this.state.chief_id,
                is_active: true,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then(function (response) {
            // console.log('responsepost: ' + response);
        })
            .catch(function (error) {
            // console.log('errorpost: ' + error);
        });

        this.setState({ open: false }); // закриває модальне вікно
    }

    onOpenModal = () => {
        this.setState({ open: true });
    };

    onCloseModal = () => {
        this.setState({ open: false });
    };

    handleDelete(e) {                   // робить відділ неактивним
        e.preventDefault();

        let new_deps = this.deps;       // видаляємо запис з масиву
        new_deps.splice(this.state.index, 1);
        this.deps = new_deps;

        console.log('delete');

        axios({
            method: 'post',
            url: 'dep/' + this.state.id + '/',
            data: querystring.stringify({
                id: this.state.id,
                name: this.state.dep,
                text: this.state.text,
                manager: this.state.chief_id,
                is_active: false,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then(function (response) {
            console.log('responsepost: ' + response);
        })
            .catch(function (error) {
            console.log('errorpost: ' + error);
        });

        this.setState({ open: false }); // закриває модальне вікно
    }

    render() {
        const { open } = this.state;    // для модального вікна
        const { chief } = this.state;   // для <select>

        const employees = [];
        this.emps.map((emp) => employees.push({ // формування списка працівників для <select>
            value: emp.id,
            label: emp.emp
        }));

        const columns = [{              // для таблиці
            Header: 'Відділи',
            columns: [
                {
                    Header: 'Назва',
                    accessor: 'dep' // String-based value accessors!
                }, {
                    Header: 'Керівник',
                    accessor: 'chief',
                }
            ]
        }];

        return (
            <div>
                <ReactTable
                    data = {this.deps}
                    columns={columns}
                    defaultPageSize={5}
                    className="-striped -highlight"

                    getTdProps={(state, rowInfo, column, instance) => {
                        return {
                          onClick: (event, handleOriginal) => {
                            this.setState({
                                index: rowInfo.index,
                                id: rowInfo.original.id,
                                dep: rowInfo.original.dep,
                                text: rowInfo.original.text,
                                chief: rowInfo.original.chief,
                                chief_id: rowInfo.original.chief_id,
                            }); // відправляє інформацію про відділ у форму
                            this.onOpenModal();
                            if (handleOriginal) {
                              handleOriginal();
                            }
                          }
                        };
                      }}
                />
                <Modal open={open} onClose={this.onCloseModal} center>
                    <br/>
                    <p>Внесіть зміни при необхідності:</p>

                    <Form onSubmit={this.handleSubmit}>

                        <label>Назва відділу:
                            <Input type="text" value={this.state.dep} name='dep' onChange={this.onChange} maxLength={200} size="51" validations={[required]}/>
                        </label><br /><br />

                            <label>Опис:</label><br />
                            <Textarea value={this.state.text} name='text' onChange={this.onChange} style={this.styles.textarea_style} maxLength={4000}/><br />


                            <label>Керівник:</label><br />
                            <Select id='chief-select' name='chief' value={chief} onChange={this.onChange} validations={[required]}>
                                <option value='Не внесено' disabled>------------</option>
                                {
                                  this.emps.map(emp => {
                                    return <option key={emp.id} data-key={emp.id}
                                      value={emp.emp}>{emp.emp}</option>;
                                  })
                                }
                            </Select>
                        <br/><br/>
                        <Button className="float-sm-left">Підтвердити</Button>
                        <Button className="float-sm-right" onClick={this.handleDelete.bind(this)}>Видалити відділ</Button>
                    </Form>

                </Modal>
            </div>
        )
    }
}


ReactDOM.render(
    <DepTable />,
    document.getElementById('dep_table')
);