'use strict';
import React from 'react';
import Modal from 'react-responsive-modal';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Textarea from 'react-validation/build/textarea';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import {required} from '../validations.js';
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class NewDep extends React.Component {
    constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    }

    state = {
        open: false,
        dep: '',                    // назва відділу для форми
        text: '',                   // опис відділу для форми
        redirect: false,
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
            this.props.addDep({
                id: response.data,
                dep: this.state.dep,
                text: this.state.text
            });

            this.setState({
                dep: '',
                text: '',
                open: false,
            })
            // console.log('responsepost: ' + response);
        }).catch((error) => {
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
        const { open } = this.state;   // для <select>

        return (
            <div>
                <div className="col-lg-4">
                    <button type="button" className="btn btn-outline-secondary mb-1" onClick={this.onOpenModal}>Додати відділ</button>
                </div>

                <Modal open={open} onClose={this.onCloseModal} center>
                    <br/>
                    <p>Новий відділ</p>

                    <Form onSubmit={this.handleSubmit}>

                        <label>Назва відділу:
                            <Input type="text" value={this.state.dep} name='dep' onChange={this.onChange} maxLength={200} size="51" validations={[required]}/>
                        </label><br /><br />

                        <label>Опис:
                            <Textarea value={this.state.text} name='text' onChange={this.onChange} style={this.styles.textarea_style} maxLength={4000}/>
                        </label>
                        <br /><br />

                        <Button className="float-sm-left" name="new_dep">Підтвердити</Button>
                    </Form>
                </Modal>
            </div>

        )
    }
}

export default NewDep;