'use strict';
import React from 'react';

class Info extends React.Component {
    // отримує основну інформацію про документ в масивах doc та info, рендерить її для doc_info

    state = {
        doc: [],
        info: [],
    };

    componentWillMount() {
        this.setState({
            doc: this.props.doc,
            info: this.props.info,
        })
    }

    getResolutions() {
        let path = this.props.info.path;

        if (this.props.doc.expected_mark === 11) {
            let my_resolutions = [];
            path.map(step => {
                if (step.resolutions) {
                    step.resolutions.map(res => {
                        if (res.emp_seat_id === parseInt(localStorage.getItem('my_seat'))) {
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
            return(
                <div key='4' className="css_resolution mt-2">Резолюції для вас:
                    {my_resolutions}
                </div>)
            }
    }

    render() {
        let path = [];
        let first_path = [];
        if (this.props.info.path) {
            path = this.props.info.path;
            first_path = path[path.length-1];
        }

        return <div>
            {/*Перевірка, чи отримав компонент дані від батьківського*/}
            <If condition={this.props.info.path}>
                {/*Початкова інфа про документ:*/}
                <div className="d-flex justify-content-between">
                    <span className="font-weight-bold">{this.props.doc.type}</span>
                    <span>№: {this.props.doc.id}. Дата: {this.props.doc.date}</span>
                </div>
                <div>Автор:
                    <div className="font-italic ml-1">{this.props.doc.author}</div>
                </div>

                {/*Інфа, що відноситься до конкретного виду документу*/}
                <Choose>
                    <When condition={this.props.doc.type_id === 1}>
                        <div>Дата виходу за територію:
                            <div className="font-italic ml-1">{this.props.info.free_time}</div>
                            <div>Куди та з якою метою:</div>
                            <div className="css_note_text font-italic ml-1">{this.props.info.text}</div>
                        </div>
                    </When>
                    <When condition={this.props.doc.type_id === 2}>
                        <div>Дата виносу:
                            <div className="font-italic ml-1">{this.props.info.carry_out_day}</div>
                            <div>Прохідна №: {this.props.info.gate}</div>
                            <div>Куди та з якою метою:</div>
                            <div className="css_note_text font-italic ml-1">{this.props.info.text}</div>
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
                                    <For each='item' index='id' of={this.props.info.carry_out_items}>
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.item_name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.measurement}</td>
                                        </tr>
                                    </For>
                                </tbody>
                            </table>
                        </div>
                    </When>
                    <When condition={this.props.doc.type_id === 3}>
                        <div>Кому:
                            <div className="font-italic ml-1">{this.props.info.recipient}, {this.props.info.recipient_seat}</div>
                            <div>Зміст:</div>
                            <div className="css_note_text ml-1">{this.props.info.text}</div>
                        </div>
                    </When>
                </Choose>

                {/*Файли*/}
                {/*Працює правильно тільки якщо першопочатковий path документа останній у списку (список відсортований за датою)*/}
                <If condition={first_path.files.length > 0}>
                    <div>Файли:</div>
                    <For each='file' index='id' of={first_path.files}>
                        <div key={file.id}><a href={'../../media/' + file.file} download>{file.name}</a></div>
                    </For>
                </If>

                {/*Резолюції керівника*/}
                {this.getResolutions()}
            </If>
        </div>;
    }
}

export default Info;