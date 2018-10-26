'use strict';
import React from 'react';
import axios from 'axios';
import querystring from 'querystring'; // for axios
import Form from 'react-validation/build/form';
import Button from 'react-validation/build/button';
import { ToastContainer, toast } from 'react-toastify'; // спливаючі повідомлення:
import 'react-toastify/dist/ReactToastify.min.css';

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

import './doc_info.css';
import '../loader_style.css';

class DocInfo extends React.Component {
    constructor(props) {
        super(props);
        this.newMark = this.newMark.bind(this);
        this.onChange = this.onChange.bind(this);
        this.getInfo = this.getInfo.bind(this);
        this.arrangeRenderInfo = this.arrangeRenderInfo.bind(this);
        this.Resolutions = this.Resolutions.bind(this);
        this.addResolution = this.addResolution.bind(this);
        this.postResolutions = this.postResolutions.bind(this);
    }

    state = {
        comment: '',
        type_info: [],
        flow: [],
        path: [],
        free_time: '',
        text: '',
        carry_out_day: '',
        gate: '',
        carry_out_items: '',
        buttons: [],
        recipient: '',
        recipient_seat: '',

        render_flow: '',
        render_path: '',

        sub: '', // для select підлеглих для резолюції
        sub_id: '0',
        resolution_text: '',
        resolutions: [],

        ready_for_render: true, // при false рендериться loader
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.doc.id !== prevProps.doc.id && this.props.doc.id !== 0 ) {
            this.getInfo(this.props.doc);
        }
        if (this.state.path !== prevState.path) {
            this.arrangeRenderInfo();
        }
    }

    onChange(event) {
        if (event.target.name === 'sub') { // беремо ід керівника із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                sub_id: event.target.options[selectedIndex].getAttribute('data-key'),
                sub: event.target.options[selectedIndex].getAttribute('value'),
            });
        }
        else {
            this.setState({[event.target.name]:event.target.value});
        }
    }

    // Спливаюче повідомлення
    notify = (message) => toast.error( message,
        {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        }
    );

    // функція для отримання з бази докладної інфи про документ
    getInfo(doc) {
        this.setState({
            ready_for_render: false,
        });

        axios({
            method: 'get',
            url: 'get_doc/' + doc.id + '/',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {

            // Отримуємо інформацію щодо конкретних видів документів
            if (doc.type_id === 1) {
                this.setState({
                    free_time: response.data.free_time,
                })
            }
            else if (doc.type_id === 2) {
                this.setState({
                    carry_out_day: response.data.carry_out_day,
                    gate: response.data.gate,
                    carry_out_items: response.data.items,
                })
            }
            else if (doc.type_id === 3) {
                this.setState({
                    recipient: response.data.recipient,
                    recipient_seat: response.data.recipient_seat,
                })
            }

            // flow i path є завжди
            this.setState({
                path: response.data.path,
                flow: response.data.flow,
                text: response.data.text,
                ready_for_render: true,
            });
        }).catch((error) => {
            console.log('errorpost: ' + error);
        });

        return 0;
    }

    // опрацьовуємо нажаття кнопок реагування
    newMark(e, mark_id) {
        e.preventDefault();
        const doc_id = this.props.doc.id;
        const author_id = this.props.doc.author_seat_id;
        const removeRow = this.props.removeRow;

        // Якщо це не пустий коментар, відправляємо дані у бд, інакше виводимо текст помилки
        if (mark_id !== 4 || this.state.comment !== '') {
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
            }).then((response) => {
                // направляємо документ на видалення з черги, якщо це не коментар
                removeRow(doc_id, mark_id, author_id);
            }).catch((error) => {
                console.log('errorpost: ' + error);
            });
        }
        else {
            this.notify('Введіть текст коментарю.')
        }
    };

    // постить резолюції у бд
    postResolutions() {
        if (this.state.resolutions.length > 0) {
            const doc_id = this.props.doc.id;
            const author_id = this.props.doc.author_seat_id;
            const removeRow = this.props.removeRow;
            const today = new Date();

            axios({
                method: 'post',
                url: 'resolution/',
                data: querystring.stringify({
                    document: this.props.doc.id,
                    employee_seat: this.props.my_seat_id,
                    flow_id: this.props.doc.flow_id,
                    comment: this.state.comment,
                    resolutions: JSON.stringify(this.state.resolutions),
                    timestamp: today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate(),
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                // направляємо документ на видалення з черги, якщо це не коментар
                removeRow(doc_id, 10, author_id);
            }).catch((error) => {
                console.log('errorpost: ' + error);
            });
        }
    }

    // додає резолюцію у список резолюцій
    addResolution() {
        if (this.state.sub_id === '0' || this.state.resolution_text === '') {
            this.notify('Оберіть адресата та введіть текст резолюції.')
        }
        else {
            const new_resolution = {
              recipient_id: this.state.sub_id,
              sub: this.state.sub,
              comment: this.state.resolution_text,
            };
            this.setState(prevState => ({
              resolutions: [...prevState.resolutions, new_resolution]
            }));
            this.setState({
                sub_id: '0',
                sub: '',
                resolution_text: '',
            })
        }
    }

    // компонент для створення резолюцій на документ
    Resolutions(require) {
        // TODO розібратись, чому в цьому компоненті не працюють Select i Textarea з react-validation
        if (this.props.direct_subs.length > 0) {
            if (require === 'button') {
                return <button key={10} type="button" className="btn btn-secondary mr-1 mb-1" data-toggle="collapse"
                    data-target="#collapseExample" aria-expanded="false"
                    aria-controls="collapseExample">Резолюції
                </button>
            }
            else if (require === 'content') {
                const { sub, resolution_text } = this.state;
                return <div className="collapse" id="collapseExample">
                    <div className="card card-body mt-1 p-2">
                        <div>Додати резолюцію:</div>
                        <div>Кому:</div>
                        <select className='full_width' id='sub-select' name='sub' value={sub} onChange={this.onChange}>
                            <option data-key={0} value='Не внесено'>------------</option>
                            {
                              this.props.direct_subs.map(sub => {
                                return <option key={sub.id} data-key={sub.id}
                                  value={sub.name}>{sub.name}, {sub.seat}</option>;
                              })
                            }
                        </select>
                        <label className='css_full_width'>Текст:
                            <textarea className='css_full_width' value={resolution_text} name='resolution_text' onChange={this.onChange} maxLength={1000}/>
                        </label>
                        <button className="btn btn-outline-secondary float-sm-left" onClick={this.addResolution}>Додати</button>
                        <If condition={this.state.resolutions.length > 0}>
                            <div className='mt-1'>Створені резолюції:</div>
                            <ol>
                               {
                                   this.state.resolutions.map((res, index) => {
                                       return <li key={index}>
                                           <div className="font-italic">{res.sub}</div>
                                           <div>{res.comment}</div>
                                        </li>;
                                    })
                                }
                            </ol>
                            <button className="btn btn-success" onClick={this.postResolutions}>Відправити</button>
                        </If>


                    </div>
                </div>
            }
        }
    }

    // Розбирається, яку інфу і які кнопки показувати
    arrangeRenderInfo() {
        if (this.props.doc !== '' && this.props.doc.id !== 0 && this.props.my_seat_id == this.props.doc.emp_seat_id) {    // Якщо рядок вибрано і посада не змінилася:

            // Інфа, що є тільки у деяких видів документів (switch-перебір по типу документа):
            let type_info = [];
            switch(this.props.doc.type_id) {
                case 1:
                    type_info.push(
                        <div key='1'>Дата виходу за територію:
                            <div className="font-italic ml-1">{this.state.free_time}</div>
                            <div>Куди та з якою метою:</div>
                            <div className="css_note_text font-italic ml-1">{this.state.text}</div>
                        </div>
                    );
                    break;
                case 2:
                    type_info.push(
                        <div key='1'>Дата виносу:
                            <div className="font-italic ml-1">{this.state.carry_out_day}</div>
                            <div>Прохідна №: {this.state.gate}</div>
                            <div>Куди та з якою метою:</div>
                            <div className="css_note_text font-italic ml-1">{this.state.text}</div>
                            <table className="table table-bordered mt-2">
                                <thead>
                                    <tr>
                                        <th>№</th>
                                        <th>Найменування</th>
                                        <th>К-сть</th>
                                        <th>Од. виміру</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.carry_out_items.map((item, index) => (
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
                    );
                    break;
                case 3:
                    type_info.push(
                        <div key='1'>Кому:
                            <div className="font-italic ml-1">{this.state.recipient}, {this.state.recipient_seat}</div>
                            <div>Зміст:</div>
                            <div className="css_note_text ml-1">{this.state.text}</div>
                        </div>
                    );
                    break;
                default:
                    type_info.push(<div key='1'> </div>)
            }
            // Додаємо в type_info резолюцію керівника, якщо така є:
            if (this.props.doc.expected_mark === 11) {
                let my_resolutions = [];
                this.state.path.map(step => {
                    if (step.resolutions) {
                        step.resolutions.map(res => {
                            if (res.emp_seat_id === this.props.my_seat_id) {
                                my_resolutions.push(
                                    <div key={res.id} className='mb-1'>
                                        <div className="font-italic">Автор:</div>
                                        <div>{step.emp}</div>
                                        <div className="font-italic">Текст:</div>
                                        <div>{res.comment}</div>
                                        <hr/>
                                    </div>
                                )
                            }
                        })
                    }
                });
                type_info.push(
                    <div key='2' className="css_resolution mt-2">Резолюції для вас:
                        {my_resolutions}
                    </div>)
            }

            // Список користувачів, у яких стоїть у черзі документ:
            const doc_flow = [];
            if (this.state.flow) {
                this.state.flow.map(flow => {
                    doc_flow.push(
                        <div key={flow.id} className="css_flow p-2 mt-1 mr-1">
                            <div className="font-weight-bold">{flow.emp}</div>
                            <div>{flow.seat}</div>
                        </div>);
                });
            }

            // Список користувачів, які вже відреагували на документ:
            const doc_path = [];
            if (this.state.path) {
                this.state.path.map(path => {
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
                            <If condition={path.resolutions}>
                                <ol className="list-group mt-1" >
                                   {
                                       path.resolutions.map((res, index) => {
                                           return <li className="list-group-item" key={index}>
                                               <div className="font-italic">{res.emp}, {res.seat}</div>
                                               <div>{res.comment}</div>
                                            </li>;
                                        })
                                    }
                                </ol>
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
                                <button key={6} type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.newMark(e, 6)}>Не заперечую</button>,
                                <button key={3} type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.newMark(e, 3)}>Відмовити</button>
                            );
                            // якщо документ - не звільнююча, додаємо кнопку "На доопрацювання"
                            if (this.props.doc.type_id !== 1) {
                                buttons.push(
                                    <button key={5} type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.newMark(e, 5)}>На доопрацювання</button>,
                                );
                            }
                            break;
                        case 2: // 2 - Погоджено
                            buttons.push(
                                <button key={2} type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.newMark(e, 2)}>Погодити</button>,
                                <button key={3} type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.newMark(e, 3)}>Відмовити</button>
                            );
                            // якщо документ - не звільнююча, додаємо кнопку "На доопрацювання"
                            if (this.props.doc.type_id !== 1) {
                                buttons.push(
                                    <button key={5} type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.newMark(e, 5)}>На доопрацювання</button>,
                                );
                            }
                            // якщо документ - службова записка, додаємо кнопку "Резолюції"
                            if (this.props.doc.type_id === 3) {
                                buttons.push(
                                    <button key={10} type="button" className="btn btn-secondary mr-1 mb-1" data-toggle="collapse"
                                        data-target="#collapseExample" aria-expanded="false"
                                        aria-controls="collapseExample">Резолюції
                                    </button>,
                                );
                            }
                            break;
                        case 8: // 8 - Ознайомлений
                            buttons.push(
                                <button key={8} type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.newMark(e, 8)}>Ознайомлений</button>
                            );
                            break;
                        case 11: // 11 - Виконано
                            buttons.push(
                                <button key={11} type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.newMark(e, 11)}>Виконано</button>,
                            );
                            // додаємо кнопку "Резолюції" (якщо є підлеглі)
                            buttons.push(
                                this.Resolutions('button'),
                            );
                            break;
                    }
                }
                // Якщо автор я, є кнопка "Закрити"
                else {
                    // TODO не показувати кнопку "Закрити", якщо документ підписаний вищим керівництвом.
                    buttons.push(
                        <button key={7} type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.newMark(e, 7)}>Закрити</button>
                    )
                }
                // В будь-якому випадку додаємо кнопку "Коментар":
                buttons.push(
                    <button key={4} type="button" className="btn btn-secondary mr-1 mb-1" onClick={(e) => this.newMark(e, 4)}>Коментар</button>
                );
            }

            this.setState({
                type_info: type_info,
                render_flow: doc_flow,
                render_path: doc_path,
                buttons: buttons,
            })
        }
        return 0;
    }

    render() {
        const {type_info, render_flow, render_path, buttons } = this.state;

        if (this.state.ready_for_render === true) {
            if (this.props.doc !== '' && this.props.doc.id !== 0 && this.props.my_seat_id == this.props.doc.emp_seat_id) {
                return (
                    <div className="css_main">Обраний документ:
                        {/*Початкова інфа про документ:*/}
                        <div className="css_border bg-light p-2 mt-2 mr-1">
                            <div className="d-flex justify-content-between">
                                <span className="font-weight-bold">{this.props.doc.type}</span>
                                <span>№: {this.props.doc.id}. Дата: {this.props.doc.date}</span>
                            </div>
                            <div>Автор:
                                <div className="font-italic ml-1">{this.props.doc.author}</div>
                            </div>
                            <div>{type_info}</div>
                        </div>

                        <If condition={this.props.closed === false}>
                            <div className="mt-3">Відреагувати:</div>
                            <div className="css_border bg-light p-2 mt-1 mr-1">
                                {buttons}
                                {this.Resolutions('content')}
                                <div>
                                    <label htmlFor="comment">Текст коментарю:</label>
                                    <textarea name="comment" className="form-control" rows="3" id="comment" onChange={this.onChange} />
                                </div>
                            </div>

                            <div className="mt-3">Документ на черзі у:
                                {render_flow}
                            </div>
                        </If>

                        <div className="mt-3">Історія:
                            {render_path}
                        </div>

                        {/*Вспливаюче повідомлення*/}
                        <ToastContainer />
                    </div>
                )
            }
            else if (this.props.doc.id === 0) { //  // повідомлення при додаванні позначки
                return (<div className="font-italic">{this.props.doc.type}</div>);
            }
            else {  // якщо не вибрано жоден документ
                return (
                    <div> </div>
                )
            }
        }
        else {
            return (
                <div className="css_loader">
                    <div className="loader" id="loader-1" > </div>
                </div>
            )
        }

    }
}

export default DocInfo;