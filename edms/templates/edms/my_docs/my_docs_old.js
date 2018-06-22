'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Textarea from 'react-validation/build/textarea';
import axios from 'axios';
import querystring from 'querystring'; // for axios
import {Grid, Table, TableHeaderRow} from '@devexpress/dx-react-grid-material-ui';

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
        new_doc: '',
        my_seats: window.my_seats,
        my_seat_id: '',
    };

    styles = {
        textarea_style : {
            width: 400,
            height: 100
        },
    };

    componentWillMount() {  // вибирає із списка посад першу і показує її у селекті та this.state
        this.setState({my_seat_id: this.state.my_seats[0].id});
        mySeatDocs(this.state.my_seat_id);
    }

    onChange(event) {
        if (event.target.name === 'my_seat') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.state.my_seat_id = event.target.options[selectedIndex].getAttribute('value');
            this.setState({my_seat_id: event.target.options[selectedIndex].getAttribute('value')});
        }
        else {
             this.setState({[event.target.name]:event.target.value});
        }
    }

    handleSubmit(e) {               // Оновлює запис у списку відділів
        e.preventDefault();

        axios({
            method: 'post',
            url: '',
            data: querystring.stringify({
                new_free_time: '',
                document_type: 1,
                free_day: this.state.date,
                text: this.state.text,
                employee_seat: this.state.my_seat_id,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => { // закриваємо і очищаємо модальне вікно, забираємо із респонса ід нового документа
            document.getElementById("modal_freetime_close").click();
            newDoc(response.data, this.date, 'Звільнююча перепустка');
            this.setState({
                date:'',
                text:'',
                new_doc_id: response.data,
            });
        })
          .catch(function (error) {
            console.log('errorpost: ' + error);
        });
    }

    render() {
        const { my_seat_id } = this.state;

        return(
            <div>
                <label>Оберіть посаду:
                    <select id='my-seat-select' name='my_seat' value={my_seat_id} onChange={this.onChange}>

                        {
                          this.state.my_seats.map(seat => {
                            return <option key={seat.id} data-key={seat.id}
                              value={seat.id}>{seat.seat}</option>;
                          })
                        }
                    </select>
                </label>

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

// змінює список документів у компоненті my_docs
function newDoc(new_doc_id, new_date, new_type) {
    let new_doc = [{'date': new_date, 'type': new_type, 'id': new_doc_id}];
    console.log('new id: ' + new_doc);
}

// вибирає із списка документів тільки ті, які відносяться до конкретної посади користувача
function mySeatDocs(my_seat_id) {
    window.my_docs.map(doc => {
        if (doc.emp_seat_id === my_seat_id) {
            this.setState(prevState => ({
              seat_docs: [...prevState.seat_docs, doc]
            }));
        }
    });
}

class MyDocs extends React.Component {
    constructor(props) {
        super(props);

        newDoc = newDoc.bind(this);
        mySeatDocs = mySeatDocs.bind(this)
    }

    state = {
      my_docs: window.my_docs,
      columns: [
        { name: 'id', title: 'id' },
        { name: 'type', title: 'Тип' },
        { name: 'date', title: 'Дата' },
      ],
      seat_docs: [], // список документів, закріплених за конкретною посадою користувача
    };

    render() {
        const { my_docs, columns } = this.state;
        const seat_docs = [];



        return(
            <div>Мої документи в роботі:
                <Grid
                  rows={seat_docs}
                  columns={columns}
                >
                  <Table />
                  <TableHeaderRow />
                </Grid>
            </div>

        )
    }
}

ReactDOM.render(
    <div className="row">
            <div className="col-lg-3">
                <NewDoc />
            </div>
            <div className="col-md-4">
                <MyDocs />
            </div>
    </div>,
    document.getElementById('my_docs')
);