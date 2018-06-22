'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import NewDoc from '../my_docs/new_doc';
import DocsList from '../my_docs/docs_list';
import {required} from '../validations.js';
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';


class MyDocs extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.addDoc = this.addDoc.bind(this);
    }

    state = {
        seat_id: '',
        seat_docs: [],
    };

    // вибирає із списка посад першу і показує відповідні їй документи
    componentDidMount() {
        this.setState({seat_id: window.my_seats[0].id});

        window.my_docs.map(doc => {
            if (doc.emp_seat_id === window.my_seats[0].id) {
                this.setState(prevState => ({
                  seat_docs: [...prevState.seat_docs, doc]
                }));
            }
        });
    }

    // При зміні посади змінюється ід посади і список документів
    onChange(event) {
        if (event.target.name === 'my_seat') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.state.seat_id = event.target.options[selectedIndex].getAttribute('value');

            this.state.seat_docs ='';
            window.my_docs.map(doc => {
                if (doc.emp_seat_id == this.state.seat_id) {
                    this.setState(prevState => ({
                      seat_docs: [...prevState.seat_docs, doc]
                    }));
                }
            });
        }
    }

    // Додає новий документ, створений у компоненті NewDoc у списки
    addDoc(id, type, date, seat) {
        const new_doc = {
            id: id,
            type: type,
            date: date,
            emp_seat_id: seat,
        };
        this.setState(prevState => ({
          seat_docs: [...prevState.seat_docs, new_doc]
        }));
        window.my_docs.push(new_doc);
    }

    render() {
        const { my_seat_id } = this.state;
        return(
            <div className="row">
                    <div className="col-lg-3">
                        <label>Оберіть посаду:</label><br/>
                            <select id='my-seat-select' name='my_seat' value={my_seat_id} onChange={this.onChange}>

                                {
                                  window.my_seats.map(seat => {
                                    return <option key={seat.id} data-key={seat.id}
                                      value={seat.id}>{seat.seat}</option>;
                                  })
                                }
                            </select><br/><br/>

                        <NewDoc my_seat_id={this.state.seat_id} addDoc={this.addDoc}/>
                    </div>
                    <div className="col-lg-4">
                        <DocsList my_seat_id={this.state.seat_id} my_docs={this.state.seat_docs} />
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

}

ReactDOM.render(
    <MyDocs/>,
    document.getElementById('my_docs')
);