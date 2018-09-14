'use strict';
import React from 'react';
import axios from 'axios';
import querystring from 'querystring'; // for axios
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

import './doc_info.css';


class DocInfo extends React.Component {
    constructor(props) {
        super(props);
        this.newMark = this.newMark.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    state = {
        comment: '',
    };

    onChange(event) {
        this.setState({[event.target.name]:event.target.value});
    }

    // опрацьовуємо нажаття кнопок реагування
    newMark(e, mark_id) {
        e.preventDefault();
        const doc_id = this.props.doc.id;
        const author_id = this.props.doc.author_seat_id;
        const removeRow = this.props.removeRow;

        axios({
            method: 'post',
            url: 'mark/',
            data: querystring.stringify({
                document: this.props.doc.id,
                employee_seat: this.props.my_seat_id,
                mark: mark_id,
                comment: this.state.comment,
                flow_id: this.props.doc.flow_id,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then(function (response) {
            // console.log('responsepost: ' + response);
            // направляємо документ на видалення з черги, якщо це не коментар
            removeRow(doc_id, mark_id, author_id);
        }).catch(function (error) {
            console.log('errorpost: ' + error);
        });
    };



    render() {                                   // id = 0 якщо ми щойно закрили документ
        if (this.props.doc !== '' && this.props.doc.id !== 0 && this.props.my_seat_id == this.props.doc.emp_seat_id) {    // Якщо рядок вибрано і посада не змінилася:

            // Інфа, що є тільки у деяких видів документів (switch-перебір по типу документа):
            const type_info = {
                // Звільнююча перепустка
                1: (
                    <div>Дата виходу за територію:
                        <div className="font-italic ml-1">{this.props.doc_info.free_time}</div>
                        <div>Куди та з якою метою:</div>
                        <div className="font-italic ml-1">{this.props.doc_info.destination}</div>
                    </div>
                ),
                // Матеріальний пропуск
                2: (
                    <div>Дата виносу:
                        <div className="font-italic ml-1">{this.props.doc_info.carry_out_day}</div>
                        <div>Прохідна №: {this.props.doc_info.gate}</div>
                        <div>Куди та з якою метою:</div>
                        <div className="font-italic ml-1">{this.props.doc_info.destination}</div>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>Найменування</th>
                                    <th>К-сть</th>
                                    <th>Од. виміру</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.carry_out_items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.item_name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.measurement}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ),
                default: (
                    <div> </div>
                )
            }[this.props.doc.type_id];

            // Список користувачів, у яких стоїть у черзі документ:
            const doc_flow = [];
            if (this.props.doc_info !== '') {
                this.props.doc_info.flow.map(flow => {
                    doc_flow.push(
                        <div key={flow.id} className="css_flow p-2 mt-1 mr-1">
                            <div className="font-weight-bold">{flow.emp}</div>
                            <div>{flow.seat}</div>
                        </div>);
                });
            }

            // Список користувачів, які вже відреагували на документ:
            const doc_path = [];
            if (this.props.doc_info !== '') {
                this.props.doc_info.path.map(path => {
                    doc_path.push(
                        <div key={path.id} className="css_path p-2 my-1 mr-1">
                            <div className="d-flex justify-content-between">
                                <span className="font-weight-bold">{path.emp}</span>
                                <span>{path.time}</span>
                            </div>
                            <div>{path.seat}</div>
                            <div className="css_mark">{path.mark}</div>
                            <If condition = {path.comment !== '' && path.comment !== null}>
                                <div className="text-right">Коментар:</div>
                                <div className="css_comment">{path.comment}</div>
                            </If>
                        </div>
                    );
                })
            }

            // Список кнопок, які показуються користувачу для реагування на документ:
            const buttons = [];
            // Якщо документ активний:
            if (this.props.closed === false) {
                // Якщо автор не я:
                if (this.props.doc.author_seat_id !== this.props.my_seat_id) {
                    // Дивимось, яку позначку очікує flow і показуємо відповідні кнопки
                    // (позначку "6 - Не заперечую" очікуємо від безпосереднього керівництва)
                    // (позначку "2 - Погоджено" очікуємо від найвищого керівництва)
                    switch (this.props.doc.expected_mark) {
                        case 6: // 6 - Не заперечую
                            buttons.push(
                                <button key={6} type="button" className="btn btn-secondary" onClick={(e) => this.newMark(e, 6)}>Не заперечую</button>,
                                <button key={3} type="button" className="btn btn-secondary" onClick={(e) => this.newMark(e, 3)}>Відмовити</button>
                            );
                            // якщо документ - не звільнююча, додаємо кнопку "На доопрацювання"
                            if (this.props.doc.type_id !== 1) {
                                buttons.push(
                                    <button key={5} type="button" className="btn btn-secondary" onClick={(e) => this.newMark(e, 5)}>На доопрацювання</button>,
                                );
                            }
                            break;
                        case 2: // 2 - Погоджено
                            buttons.push(
                                <button key={2} type="button" className="btn btn-secondary" onClick={(e) => this.newMark(e, 2)}>Погодити</button>,
                                <button key={3} type="button" className="btn btn-secondary" onClick={(e) => this.newMark(e, 3)}>Відмовити</button>
                            );
                            // якщо документ - не звільнююча, додаємо кнопку "На доопрацювання"
                            if (this.props.doc.type_id !== 1) {
                                buttons.push(
                                    <button key={5} type="button" className="btn btn-secondary"
                                            onClick={(e) => this.newMark(e, 5)}>На доопрацювання</button>,
                                );
                            }
                            break;
                        case 8: // 8 - Ознайомлений
                            buttons.push(
                                <button key={8} type="button" className="btn btn-secondary" onClick={(e) => this.newMark(e, 8)}>Ознайомлений</button>
                            );
                            break;
                    }
                }
                // Якщо автор я, є кнопка "Закрити"
                else {
                    // TODO не показувати кнопку "Закрити", якщо документ підписаний вищим керівництвом.
                    buttons.push(
                        <button key={7} type="button" className="btn btn-secondary" onClick={(e) => this.newMark(e, 7)}>Закрити</button>
                    )
                }
                // В будь-якому випадку додаємо кнопку "Коментар":
                buttons.push(
                    <button key={4} type="button" className="btn btn-secondary" onClick={(e) => this.newMark(e, 4)}>Коментар</button>
                );
            }


            return (
                <div className="css_main">
                    {/*Початкова інфа про документ:*/}
                    <div className="css_border bg-light p-2 mt-2 mr-1">
                        <div className="d-flex justify-content-between">
                            <span className="font-weight-bold">{this.props.doc.type}</span>
                            <span>№: {this.props.doc.id}. Дата: {this.props.doc.date}</span>
                        </div>
                        <div>{type_info}</div>
                    </div>

                    <If condition={this.props.closed === false}>
                        <div className="mt-3">Відреагувати:</div>
                        <div className="css_border bg-light p-2 mt-1 mr-1">
                            <div className="btn-group" role="group" aria-label="Basic example">{buttons}</div>
                            <div>
                                <label htmlFor="comment">Коментар:</label>
                                <textarea name="comment" className="form-control" rows="3" id="comment" onChange={this.onChange} />
                            </div>
                        </div>

                        <div className="mt-3">Документ на черзі у:
                            {doc_flow}
                        </div>
                    </If>

                    <div className="mt-3">Історія:
                        {doc_path}
                    </div>



                </div>
            )
        }
        else if (this.props.doc.id === 0) { //  // повідомлення при додаванні позначки
            return (<div className="font-italic">{this.props.doc.type}</div>);
        }
        else {  // якщо не вибрано жоден документ
            return (<div> </div>)
        }
    }
}

export default DocInfo;