'use strict';
import React, {Fragment} from 'react';
import Paper from '@material-ui/core/Paper';
import Form from 'react-validation/build/form';
import Button from 'react-validation/build/button';
import Select from 'react-validation/build/select';
import {required} from "../_else/validations";
import axios from 'axios';
import querystring from 'querystring'; // for axios
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

import '../_else/loader_style.css';
import '../_else/my_styles.css';


class DocTypeInfo extends React.Component {

    state = {
        ready_for_render: true, // при false рендериться loader
        doc_type: '', // обраний документ
        active_permissions: '', // Активні дозволи
        new_seat_id: '', // Id посади в новому дозволі
        new_seat: '', // Посада в новому дозволі
        new_mark_id: '', // Id позначки в новому дозволі
        new_mark: '', // Позначка в новому дозволі
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        // при зміні ід типу документа (клік на інший тип документа) - запит інфи з бд, очищення селектів
        if (this.props.doc_type.id !== prevProps.doc_type.id && this.props.doc_type.id !== 0 ) {
            this.setState({
                doc_type: this.props.doc_type,
                new_seat: '',
                new_seat_id: '',
                new_mark: '',
                new_mark_id: '',
            });
            this.getInfo(this.props.doc_type);
        }
    }

    onChange = (event) => {
        if (event.target.name === 'seat') {
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                new_seat_id: event.target.options[selectedIndex].getAttribute('data-key'),
                new_seat: event.target.options[selectedIndex].getAttribute('value'),
            });
        }
        else if (event.target.name === 'mark') {
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                new_mark_id: event.target.options[selectedIndex].getAttribute('data-key'),
                new_mark: event.target.options[selectedIndex].getAttribute('value'),
            });
        }
        else {
            this.setState({[event.target.name]:event.target.value});
        }
    };

    // функція для отримання з бази докладної інфи про документ
    getInfo = (doc_type) => {
        this.setState({
            ready_for_render: false,
        });

        axios({
            method: 'get',
            url: 'get_type_info/' + doc_type.id + '/',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            this.setState({
                active_permissions: response.data,
                ready_for_render: true,
            })
        }).catch((error) => {
            console.log('errorpost: ' + error);
        });

        return 0;
    };

    // додає дозвіл
    addPermission = (e) => {
        e.preventDefault();
        const {doc_type, new_seat_id, new_seat, new_mark_id, new_mark} = this.state;

        axios({
            method: 'post',
            url: '',
            data: querystring.stringify({
                document_type: doc_type.id,
                seat: new_seat_id,
                mark: new_mark_id,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            const new_permission = {
                id: response.data,
                mark: new_mark,
                mark_id: new_mark_id,
                seat: new_seat,
                seat_id: new_seat_id,
            };
            this.setState(prevState => ({
                active_permissions: [...prevState.active_permissions, new_permission]
            }));
            // console.log('responsepost: ' + response);
        }).catch((error) => {
            console.log('errorpost: ' + error);
        });
    };

    // видаляє дозвіл зі списку
    delPermission = (index) => {
        const {active_permissions} = this.state;
        const deleted_permission = active_permissions[index];

        axios({
            method: 'post',
            url: 'deactivate/' + deleted_permission.id + '/',
            data: querystring.stringify({
                is_active: false
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            active_permissions.splice(index, 1);
            this.setState({active_permissions: active_permissions});
            // console.log('responsepost: ' + response);
        }).catch((error) => {
            console.log('errorpost: ' + error);
        });
    };

    render() {
        const {ready_for_render, doc_type, active_permissions, new_seat, new_mark} = this.state;
        const seats = window.seats;
        const marks = window.marks;

        if (ready_for_render === true) {
            if (doc_type !== '' && doc_type.id !== 0) {
                return (
                    <Fragment>
                        <div className='d-flex justify-content-between'>
                            <div className='font-weight-bold'>{doc_type.description}</div>
                            <If condition={doc_type.creator !== ''}>
                                <div className='font-italic'>Автор: {doc_type.creator}</div>
                            </If>
                        </div>
                        <hr/>
                        <div className="row css_height_100">
                            <div className='col-lg-6'>
                                <If condition={active_permissions.length > 0}>
                                    <div className='modal-header'>Активні дозволи:</div>
                                    <div className="modal-body">
                                        <Paper>
                                        <table className='table table-sm table-bordered table-hover css_table_font'>
                                            <thead>
                                                <tr>
                                                    <th>Посада</th>
                                                    <th>Позначка</th>
                                                    <th> </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {active_permissions.map((perm, index) => {
                                                    return <tr key={index}>
                                                       <td>{perm.seat}</td>
                                                       <td>{perm.mark}</td>
                                                       <td>
                                                           <button type="button" className="close" aria-label="Close" onClick={this.delPermission.bind(undefined, index)}>
                                                               <span className='text-danger' aria-hidden="true">&times;</span>
                                                           </button>
                                                       </td>
                                                    </tr>;
                                                })}
                                            </tbody>
                                        </table>
                                    </Paper>
                                    </div>
                                </If>
                            </div>
                            <Form className='col-lg-6' onSubmit={this.addPermission}>
                                <div className='modal-header'>Додати дозволи:</div>
                                <div className="modal-body">
                                    <label className="full_width">Оберіть посаду:
                                        <Select id='seat_select' name='seat' className="form-control full_width" value={new_seat} onChange={this.onChange} validations={[required]}>
                                            <option data-key={0} value='Не внесено'>------------</option>
                                            {
                                              seats.map(seat => {
                                                return <option key={seat.id} data-key={seat.id}
                                                  value={seat.seat}>{seat.seat}</option>;
                                              })
                                            }
                                        </Select>
                                    </label> <br />
                                    <label className="full_width">Оберіть дозвіл:
                                        <Select id='mark_select' name='mark' className="form-control full_width" value={new_mark} onChange={this.onChange} validations={[required]}>
                                            <option data-key={0} value='Не внесено'>------------</option>
                                            {
                                              marks.map(mark => {
                                                return <option key={mark.id} data-key={mark.id}
                                                  value={mark.mark}>{mark.mark}</option>;
                                              })
                                            }
                                        </Select>
                                    </label> <br />
                                </div>
                                <div className="modal-footer">
                                    <Button className="float-sm-left btn btn-outline-success mb-1">Додати</Button>
                                </div>
                            </Form>
                        </div>
                    </Fragment>
                )
            }
            else if (doc_type.id === 0) { //  // повідомлення при внесенні змін
                return (<div className="font-italic">{message}</div>);
            }
            else {  // якщо не вибрано жоден тип документу
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

export default DocTypeInfo;