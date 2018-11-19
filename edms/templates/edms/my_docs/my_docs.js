'use strict';
import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import '../my_styles.css';
import NewDoc from './new_doc';
import DocsList from '../my_docs/docs_list';
import SeatChooser from '../seat_chooser';
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';


class MyDocs extends React.Component {

    state = {
        chiefs: '',
        direct_subs: '',
        seat_id: 0,
        my_docs: [], // Документи, створені користувачем
        work_docs: [], // Документи, що чекають на реакцію користувача
    };

    getChiefs = (seat_id) => {
        // отримує список шефів, відповідний обраній посаді
        axios({
            method: 'get',
            url: 'get_chiefs/' + seat_id + '/',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            // Передаємо список у state, якщо він є
            if (response.data) {
                this.setState({
                    chiefs: response.data
                })
            }
        }).catch((error) => {
            console.log('errorpost: ' + error);
        });
    };

    getDirectSubs = (seat_id) => {
        // отримує список шефів, відповідний обраній посаді
        axios({
            method: 'get',
            url: 'get_direct_subs/' + seat_id + '/',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            // Передаємо список у state, якщо він є
            if (response.data) {
                this.setState({
                    direct_subs: response.data
                })
            }
        }).catch((error) => {
            console.log('errorpost: ' + error);
        });
    };

    // Оновлює списки документів
    updateLists = (seat_id) => {
        this.state.my_docs =[];
        window.my_docs.map(doc => {
            if (doc.author_seat_id === seat_id) { // сортування по посаді
                this.setState(prevState => ({
                  my_docs: [...prevState.my_docs, doc]
                }));
            }
        });

        this.state.work_docs =[];
        window.work_docs.map(doc => {
            if (doc.emp_seat_id === seat_id) { // сортування по посаді
                this.setState(prevState => ({
                  work_docs: [...prevState.work_docs, doc]
                }));
            }
        });
    };

    // шукає обрану посаду або обирає першу зі списку і показує відповідні їй документи, керівники, підлеглі
    componentDidMount() {

        const seat_id = parseInt(localStorage.getItem('my_seat') ? localStorage.getItem('my_seat') : window.my_seats[0].id);

        this.setState({ seat_id: seat_id });

        this.getChiefs(seat_id);
        this.getDirectSubs(seat_id);
        this.updateLists(seat_id);
    }

    // отримує нову посаду з компоненту SeatChooser і відповідно змінює списки
    onSeatChange = (new_seat_id) => {

        this.setState({ seat_id: new_seat_id });

        this.getChiefs(new_seat_id);
        this.getDirectSubs(new_seat_id);
        this.updateLists(new_seat_id);
    };

    // Додає новий документ, створений у компоненті NewDoc, у список
    addDoc = (id, type, date, seat, type_id) => {
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
    };

    // Видаляє зі списку документ, якому поставили позначку "Закрито" у компоненті Doc_info
    removeDoc = (id, author_id) => {
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
    };

    render() {
        return(
            <Fragment>
                <div className='d-flex justify-content-between'>
                    {/*Якщо є начальники - показуємо кнопки створення нових документів (переробиться при додаванні наказів)*/}
                    <If condition={this.state.chiefs}>
                        <NewDoc my_seat_id={this.state.seat_id} chiefs={this.state.chiefs} addDoc={this.addDoc}/>
                    </If>
                    <SeatChooser onSeatChange={this.onSeatChange}/>
                </div>
                <DocsList
                    my_seat_id={this.state.seat_id}
                    my_docs={this.state.my_docs}
                    work_docs={this.state.work_docs}
                    acting_docs={this.state.acting_docs}
                    removeDoc={this.removeDoc}
                    direct_subs={this.state.direct_subs}
                />
            </Fragment>
        )
    }
}

ReactDOM.render(
    <MyDocs/>,
    document.getElementById('my_docs')
);