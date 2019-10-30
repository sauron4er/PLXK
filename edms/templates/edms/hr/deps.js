'use strict';
import React, {Fragment} from 'react';
import Modal from 'react-responsive-modal';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Textarea from 'react-validation/build/textarea';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import '../_else/my_styles.css'
import DxTable from '../components/dx_table';
import {required} from '../_else/validations.js';
import {getIndex} from '../_else/my_extras.js';

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

// departments table with modal change_dep window
class Deps extends React.Component {
    constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.newSubmit = this.newSubmit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
  }

    state = {
        open: false,
        new_open: false,
        id: '',                     // id відділу для форми
        dep: '',                    // назва відділу для форми
        text: '',                   // опис відділу для форми
        new_dep: '',                // назва нового відділу
        new_text: '',               // опис нового відділу
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
        let new_deps = this.props.deps;   // Копіюємо масив для мутації
        const index = getIndex(this.state.id, new_deps);  // шукаємо індекс запису, в якому треба внести зміни

        // якщо хоча б одна зміна відбулася:
        if (new_deps[index].dep !== this.state.dep ||
            new_deps[index].text !== this.state.text) {

            new_deps[index].dep = this.state.dep;
            new_deps[index].text = this.state.text;

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
                this.props.changeLists('deps', new_deps);
                window.location.reload();
                // console.log('responsepost: ' + response);
            }).catch((error) => {
                console.log('errorpost: ' + error);
            });
        }
        this.setState({open: false}); // закриває модальне вікно
    }

    handleDelete(e) {                   // робить відділ неактивним
        e.preventDefault();
        const new_deps = this.props.deps.filter(dep => dep.id !== this.state.id);

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
            this.props.changeLists('deps', new_deps);
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

    newSubmit(e) {               // Оновлює запис у списку відділів
        e.preventDefault();

        // let new_deps = this.props.deps;

        axios({
            method: 'post',
            url: '',
            data: querystring.stringify({
                new_dep: '',
                name: this.state.dep,
                text: this.state.text,
                is_active: true,
            }),
        }).then((response) => {
            // TODO розібратись, чому не оновлюється таблиця при доданні нового відділу/посади
            // new_deps.push({
            //     id: response.data,
            //     dep: this.state.dep,
            //     text: this.state.text
            // });
            // this.props.changeLists('deps', new_deps);
            //
            // this.setState({
            //     new_open: false,
            //     dep: '',
            //     text: '',
            // });
            window.location.reload();
            // console.log('responsepost: ' + response);
        }).catch((error) => {
            console.log('errorpost: ' + error);
        });
    }

    onOpenModalNew = () => {
        this.setState({ new_open: true });
    };

    onCloseModalNew = () => {
        this.setState({ new_open: false });
    };

    render() {
        const { open, new_open } = this.state;    // для модального вікна

        return (
          <Fragment>
            <button
              type='button'
              className='btn btn-sm btn-outline-secondary mb-1 float-right'
              onClick={this.onOpenModalNew}
            >
              Додати відділ
            </button>
            <div className='float-left'>
              <DxTable
                rows={this.props.deps}
                columns={[{name: 'dep', title: 'Відділ'}]}
                defaultSorting={[{columnName: 'dep', direction: 'asc'}]}
                onRowClick={this.onRowClick}
                height={this.props.height}
                filter
              />
            </div>
            {/* Модальне вікно для нового відділу*/}
            <Modal open={new_open} onClose={this.onCloseModalNew} center>
              <br />
              <p className='font-weight-bold'>Новий відділ</p>

              <Form onSubmit={this.newSubmit}>
                <label>
                  Назва відділу:
                  <Input
                    className='form-control'
                    type='text'
                    value={this.state.dep}
                    name='dep'
                    onChange={this.onChange}
                    maxLength={200}
                    size='51'
                    validations={[required]}
                  />
                </label>
                <br />
                <br />

                <label className='full_width'>
                  Опис:
                  <Textarea
                    className='form-control full_width'
                    value={this.state.text}
                    name='text'
                    onChange={this.onChange}
                    maxLength={4000}
                  />
                </label>
                <br />
                <br />

                <Button className='btn btn-outline-success float-sm-left' name='new_dep'>
                  Підтвердити
                </Button>
              </Form>
            </Modal>

            {/* Модальне вікно для змін у відділі*/}
            <Modal open={open} onClose={this.onCloseModal} center>
              <Form onSubmit={this.handleSubmit}>
                <label>
                  Назва відділу:
                  <Input
                    className='form-control'
                    type='text'
                    value={this.state.dep}
                    name='dep'
                    onChange={this.onChange}
                    maxLength={200}
                    size='51'
                    validations={[required]}
                  />
                </label>
                <br />
                <br />

                <label className='full_width'>
                  Опис:
                  <Textarea
                    className='form-control full_width'
                    value={this.state.text}
                    name='text'
                    onChange={this.onChange}
                    maxLength={4000}
                  />
                </label>
                <br />
                <br />

                <Button className='float-sm-left btn btn-outline-success mb-1'>
                  Підтвердити
                </Button>
                <Button
                  className='float-sm-right btn btn-outline-secondary mb-1'
                  onClick={this.handleDelete.bind(this)}
                >
                  Видалити відділ
                </Button>
              </Form>
            </Modal>
          </Fragment>
        );
    }
}

export default Deps