'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
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


class NewDoc extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    state = {
        text: '',
        date: '',
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
        let success = false;
        let new_doc_id = '';

        const {my_docs} = this.state;



        // Треба обновити my_docs у сусідньому компоненті, а не тут!!







        axios({
            method: 'post',
            url: '',
            data: querystring.stringify({
                new_free_time: '',
                document_type: 1,
                free_day: this.state.date,
                text: this.state.text,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then(function (response) {
            document.getElementById("modal_freetime_close").click();
            success = true;
            new_doc_id = response.data;
            // console.log('responsepost: ' + response.data);
        })
            .catch(function (error) {
            console.log('errorpost: ' + error);
        });
        if (success = true) {
            this.setState({date:'',
                text:'',
                my_docs: [...this.state.my_docs, new_doc_id]
            });

        }

    }

    render() {
        return(
            <div>
                <div>Створити новий документ:</div>
                <button type="button" className="btn btn-outline-secondary mb-1 w-100" data-toggle="modal" data-target="#modalNewFreePass" id="button_new_free_pass">Звільнююча перепустка</button>

                {/*форма нової звільнюючої:*/}
                <div className="container">
                  <div className="modal fade" id="modalNewFreePass">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                      <div className="modal-content">

                        <div className="modal-header">
                          <h4 className="modal-title">Нова звільнююча</h4>
                          <button type="button" className="close" data-dismiss="modal" id="modal_freetime_close">&times;</button>
                        </div>

                        <Form onSubmit={this.handleSubmit}>
                            <div className="modal-body">

                                <label>День дії звільнюючої:
                                    <Input type="date" value={this.state.date} name="date" onChange={this.onChange} validations={[required]}/>
                                </label> <br /> <br />

                                <label>Куди, з якою метою звільнюєтесь:
                                    <Textarea value={this.state.text} name='text' onChange={this.onChange} style={this.styles.textarea_style} maxLength={4000}/>
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
            </div>
        )
    }
}

ReactDOM.render(
    <NewDoc />,
    document.getElementById('new_doc')
);