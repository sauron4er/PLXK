'use strict';
import React from 'react';
import Modal from 'react-responsive-modal';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Textarea from 'react-validation/build/textarea';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import NewDep from './new_dep_form';
import MyTable from '../my_table';
import {required} from '../validations.js';
import {getIndex} from '../my_extras.js';

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

// departments table with modal change_dep window
class DepTable extends React.Component {
    constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.addDep = this.addDep.bind(this);
  }
    state = {
        open: false,
        id: '',                     // id відділу для форми
        dep: '',                    // назва відділу для форми
        index: '',                  // індекс обраного відділу у списку
        text: '',                   // опис відділу для форми
        deps: window.deps,          // підтягуємо з django необхідні словники
    };

    styles = {
        textarea_style : {
            width: 400,
            height: 100
        },
    };

    onChange(event) {
        this.setState({[event.target.name]:event.target.value});
    }

    handleSubmit(e) {               // Оновлює запис у списку відділів
        e.preventDefault();
        let new_deps = this.state.deps;   // Створюємо змінений масив deps, який призначимо this.deps у разі успіху post
        this.state.index = getIndex(this.state.id, this.state.deps);  // шукаємо індекс запису, в якому треба внести зміни

        // якщо хоча б одна зміна відбулася:
        if (new_deps[this.state.index].dep !== this.state.dep ||
            new_deps[this.state.index].text !== this.state.text) {

            new_deps[this.state.index].dep = this.state.dep;
            new_deps[this.state.index].text = this.state.text;

            axios({
                method: 'post',
                url: 'dep/' + this.state.id + '/',
                data: querystring.stringify({
                    id: this.state.id,
                    name: this.state.dep,
                    text: this.state.text,
                    is_active: true,
                }),
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                this.setState({
                    deps: new_deps,
                })
                // console.log('responsepost: ' + response);
            }).catch((error) => {
                console.log('errorpost: ' + error);
            });
        }
        this.setState({open: false}); // закриває модальне вікно
    }

    handleDelete(e) {                   // робить відділ неактивним
        e.preventDefault();

        axios({
            method: 'post',
            url: 'dep/' + this.state.id + '/',
            data: querystring.stringify({
                id: this.state.id,
                name: this.state.dep,
                text: this.state.text,
                is_active: false,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            this.setState(prevState => ({
                deps: prevState.deps.filter(dep => dep.id !== this.state.id)
            }));
            // console.log('responsepost: ' + response);
        }).catch((error) => {
            console.log('errorpost: ' + error);
        });
        this.setState({ open: false }); // закриває модальне вікно
    }

    onRowClick(row) {
        this.setState({        // інформація про натиснутий рядок
            id: row.id,
            dep: row.dep,
            text: row.text,
        });

        this.onOpenModal();
    }

    onOpenModal = () => {
        this.setState({ open: true });
    };

    onCloseModal = () => {
        this.setState({ open: false });
    };

    // Приймає з компоненту NewDepForm новий відділ і додає у state
    addDep(new_dep) {
        this.setState(prevState => ({
            deps: [...prevState.deps, new_dep],
        }));
    }

    render() {
        const { open } = this.state;    // для модального вікна

        const deps_columns = [
            { name: 'dep', title: 'Відділ' },
        ];

        return (
            <div>
                <NewDep addDep={this.addDep}/>
                <MyTable
                    rows={this.state.deps}
                    columns={deps_columns}
                    defaultSorting={[{ columnName: "dep", direction: "asc" }]}
                    onRowClick={this.onRowClick}
                    filter
                />
                <Modal open={open} onClose={this.onCloseModal} center>
                    <br/>
                    <p>Внесіть зміни при необхідності:</p>

                    <Form onSubmit={this.handleSubmit}>

                        <label>Назва відділу:
                            <Input type="text" value={this.state.dep} name='dep' onChange={this.onChange} maxLength={200} size="51" validations={[required]}/>
                        </label><br /><br />

                        <label>Опис:
                            <Textarea value={this.state.text} name='text' onChange={this.onChange} style={this.styles.textarea_style} maxLength={4000}/>
                        </label>
                        <br /><br />

                        <Button className="float-sm-left btn btn-outline-secondary mb-1">Підтвердити</Button>
                        <Button className="float-sm-right btn btn-outline-secondary mb-1" onClick={this.handleDelete.bind(this)}>Видалити відділ</Button>
                    </Form>
                </Modal>
            </div>
        )
    }
}

export default DepTable