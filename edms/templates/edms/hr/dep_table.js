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
import Textarea from 'react-validation/build/textarea'

import {required} from '../validations.js'
import CSRFToken from '../csrftoken';

// departments table with modal change_dep window
class DepTable extends React.Component {
    constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
     state = {
        open: false,
        dep: '',                    // назва відділу для форми
        index: '',                  // індекс в масиві відділів для форми
        text: '',                   // опис відділу для форми
        chief: '',                  // керівник відділу для форми
    };

    deps = window.deps;             // підтягуємо з django необхідні словники
    emps = window.emps;

    styles = {
        textarea_style : {
            width: 400,
            height: 100
        },
    };


    onChange(event) {               // onChange для полів форми крім <select>
        this.setState({[event.target.name]:event.target.value});
    }

    handleChange = (chief) => {     // onChange для <select>
        this.setState({ chief });
    };


    handleSubmit(e) {
        e.preventDefault();

        let new_deps = this.deps;   // Отримує значення із форми і змінює масив deps
        new_deps[this.state.index].dep = this.state.dep;
        new_deps[this.state.index].text = this.state.text;
        new_deps[this.state.index].chief = this.state.chief;
        this.setState({deps: new_deps});

    }

    onOpenModal = () => {
        this.setState({ open: true });
    };

    onCloseModal = () => {
        this.setState({ open: false });
    };

    render() {
        const { open } = this.state;    // для модального вікна
        const { chief } = this.state;   // для <select>

        const employees = [];
        this.emps.map((emp) => employees.push({ // формування списка працівників для <select>
            value: emp.emp,
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
                                dep: rowInfo.original.dep,
                                text: rowInfo.original.text,
                                chief: rowInfo.original.chief,
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
                        <CSRFToken />

                        <label>Назва:
                            <Input type="text" value={this.state.dep} name='dep' onChange={this.onChange} maxLength={200} validations={[required]}/>
                        </label><br /><br />

                            <label>Опис:</label><br />
                            <Textarea value={this.state.text} name='text' onChange={this.onChange} style={this.styles.textarea_style} maxLength={4000}/><br /><br />


                            <label>Керівник:</label><br />
                            {/*<select ref="chiefInput" name='chief' defaultValue={this.state.chief}>*/}
                                {/*<option value='Не внесено' disabled>------------</option>*/}
                                {/*{*/}
                                  {/*this.emps.map(user => {*/}
                                    {/*return <option key={user.id}*/}
                                      {/*value={user.emp}>{user.emp}</option>;*/}
                                  {/*})*/}
                                {/*}*/}
                            {/*</select>*/}

                            <Select name='chief' value={chief} onChange={this.onChange} validations={[required]}>
                                <option value='Не внесено' disabled>------------</option>
                                {
                                  this.emps.map(emp => {
                                    return <option key={emp.id}
                                      value={emp.emp}>{emp.emp}</option>;
                                  })
                                }
                            </Select>
                        <br/><br/>
                        <Button>Підтвердити</Button>
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