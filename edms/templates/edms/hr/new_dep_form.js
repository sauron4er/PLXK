'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Select from 'react-validation/build/select';
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
        dep: '',                    // назва відділу для форми
        text: '',                   // опис відділу для форми
        chief: '',                  // керівник відділу для форми
        chief_id: '',               // id керівника відділу
        redirect: false
    };

    deps = window.deps;             // підтягуємо з django необхідні словники
    emps = window.emps;

    styles = {
        textarea_style : {
            width: 400,
            height: 100
        },
    };

    onChange(event) {
        if (event.target.name === 'chief') { // беремо ід керівника із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.state.chief_id = event.target.options[selectedIndex].getAttribute('data-key');
            this.state.chief = event.target.options[selectedIndex].getAttribute('value');
        }
        else {
            this.setState({[event.target.name]:event.target.value});
        }
    }


    handleSubmit(e) {               // Оновлює запис у списку відділів
        e.preventDefault();

        // переводимо в null не обрані поля
        let chief_id = this.state.chief_id == 0 ? null : this.state.chief_id;

        axios({
            method: 'post',
            url: '',
            data: querystring.stringify({
                new_dep: '',
                name: this.state.dep,
                text: this.state.text,
                manager: chief_id,
                is_active: true,
            }),
        }).then(function (response) {
            window.location.reload();
            // console.log('responsepost: ' + response);
        })
            .catch(function (error) {
            console.log('errorpost: ' + error);
        });
    }

    render() {
        const { chief, } = this.state;   // для <select>

        return (
            <Form onSubmit={this.handleSubmit}>

                    <label>Назва відділу:
                        <Input type="text" value={this.state.dep} name='dep' onChange={this.onChange} maxLength={200} size="51" validations={[required]}/>
                    </label><br /><br />

                    <label>Опис:
                        <Textarea value={this.state.text} name='text' onChange={this.onChange} style={this.styles.textarea_style} maxLength={4000}/>
                    </label>
                    <br /><br />

                    <label>Керівник:
                        <Select id='chief-select' name='chief' value={chief} onChange={this.onChange}>
                            <option data-key={0} value='Не внесено'>------------</option>
                            {
                              this.emps.map(emp => {
                                return <option key={emp.id} data-key={emp.id}
                                  value={emp.emp}>{emp.emp}</option>;
                              })
                            }
                        </Select>
                    </label>
                    <br/><br/>

                    <Button className="float-sm-left" name="new_dep">Підтвердити</Button>
                </Form>
        )
    }
}

ReactDOM.render(
    <NewDep />,
    document.getElementById('new_dep')
);