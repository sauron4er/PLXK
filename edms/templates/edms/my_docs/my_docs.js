'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import NewDoc from '../my_docs/new_doc';
import DocsList from '../my_docs/docs_list';
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';


class MyDocs extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.addDoc = this.addDoc.bind(this);
        this.removeDoc = this.removeDoc.bind(this);
    }

    state = {
        seat_id: 0,
        my_docs: [], // Документи, створені користувачем
        work_docs: [], // Документи, що чекають на реакцію користувача
        acting_docs: [], // Документи, які перейшли користувачу, бо він в.о.
    };

    // вибирає із списка посад першу і показує відповідні їй документи
    componentDidMount() {
        this.setState({
            seat_id: window.my_seats[0].id
        });

        window.my_docs.map(doc => {
            if (doc.author_seat_id === window.my_seats[0].id) { // сортування по посаді
                this.setState(prevState => ({
                  my_docs: [...prevState.my_docs, doc]
                }));
            }
        });

        window.work_docs.map(doc => {
            if (doc.emp_seat_id === window.my_seats[0].id) { // сортування по посаді
                this.setState(prevState => ({
                  work_docs: [...prevState.work_docs, doc]
                }));
            }
        });
    }

    // При зміні посади змінюється ід посади і списки документів
    onChange(event) {
        if (event.target.name === 'my_seat') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                seat_id: parseInt(event.target.options[selectedIndex].getAttribute('value'))
            });

            this.state.my_docs =[];
            window.my_docs.map(doc => {
                if (doc.author_seat_id === parseInt(event.target.options[selectedIndex].getAttribute('value'))) {
                    this.setState(prevState => ({
                      my_docs: [...prevState.my_docs, doc]
                    }));
                }
            });

            this.state.work_docs =[];
            window.work_docs.map(doc => {
            if (doc.emp_seat_id === parseInt(event.target.options[selectedIndex].getAttribute('value'))) {
                this.setState(prevState => ({
                  work_docs: [...prevState.work_docs, doc]
                }));
            }
        });
        }
    }

    // Додає новий документ, створений у компоненті NewDoc, у список
    addDoc(id, type, date, seat, type_id) {
        const new_doc = {
            author_seat_id: seat,
            date: date,
            emp_seat_id: this.state.seat_id,
            id: id,
            type: type,
            type_id: type_id
        };

        this.setState(prevState => ({
          my_docs: [...prevState.my_docs, new_doc]
        }));
        window.my_docs.push(new_doc);
    }

    // Видаляє зі списку документ, якому поставили позначку "Закрито" у компоненті Doc_info
    removeDoc(id, author_id) {
        // якщо автор я:
        if (author_id === this.state.seat_id) {
            this.setState(prevState => ({
                my_docs: prevState.my_docs.filter(doc => doc.id !== id)
            }));
            window.my_docs = window.my_docs.filter(doc => doc.id !== id);
            // видаляємо і зі списку документів в черзі, бо туди потрапляють повернуті керівництвом документи
            this.setState(prevState => ({
                work_docs: prevState.work_docs.filter(doc => doc.id !== id)
            }));
            window.work_docs = window.work_docs.filter(doc => doc.id !== id);
        }
        // якщо автор не я:
        else {
            this.setState(prevState => ({
                work_docs: prevState.work_docs.filter(doc => doc.id !== id)
            }));
            window.work_docs = window.work_docs.filter(doc => doc.id !== id);
        }
    }

    render() {
        const { my_seat_id } = this.state;
        return(
            <div className="row css_height">
                <div className="col-lg-3">
                    {/* Якщо посад більше, ніж одна, дає можливість обрати необхідну */}
                    <Choose>
                        <When condition = {window.my_seats.length > 1}>
                            <label>Оберіть посаду:</label><br/>
                            <select id='my-seat-select' name='my_seat' value={my_seat_id} onChange={this.onChange}>
                                {
                                  window.my_seats.map(seat => {
                                    return <option key={seat.id} data-key={seat.id}
                                      value={seat.id}>{seat.seat}</option>;
                                  })
                                }
                            </select><br/><br/>
                        </When>
                        <Otherwise>
                            <div>{window.my_seats[0].seat}</div><br/>
                        </Otherwise>
                    </Choose>

                    <NewDoc my_seat_id={this.state.seat_id} addDoc={this.addDoc}/>
                </div>
                <div className="col-lg-9">
                    <DocsList my_seat_id={this.state.seat_id}
                              my_docs={this.state.my_docs}
                              work_docs={this.state.work_docs}
                              acting_docs={this.state.acting_docs}
                              removeDoc={this.removeDoc}
                    />
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <MyDocs/>,
    document.getElementById('my_docs')
);