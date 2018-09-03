'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import MyTable from '../my_table';
import DocInfo from '../my_docs/doc_info';

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';


class SubDocs extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onRowClick = this.onRowClick.bind(this);
        this.docListArrange = this.docListArrange.bind(this);
    }

    state = {
        seat_id: 0,
        sub_docs: [],
        sub_archive: [],
        row: '',
        doc_info: '',

        // налаштування колонок для таблиць
        sub_columns: [
        { name: 'id', title: '№' },
        { name: 'type', title: 'Тип' },
        { name: 'author', title: 'Ініціатор' },
        { name: 'dep', title: 'Відділ' },
        { name: 'date', title: 'Дата' },
      ],
        sub_col_width: [
        { columnName: 'id', width: 70 },
        { columnName: 'type', width: 110 },
        { columnName: 'author', width: 180 },
        { columnName: 'dep', width: 110 },
        { columnName: 'date', width: 100 },
      ],
    };

    // функція, яка розділяє загальний список документів на списки відкритих і закритих документів
    docListArrange(doc_list) {
        this.setState({sub_docs:[], sub_archive:[]});

        doc_list.map(doc => {
            if (doc.closed === true) {
                this.setState(prevState => ({
                  sub_archive: [...prevState.sub_archive, doc]
                }));
            }
            else {
                this.setState(prevState => ({
                  sub_docs: [...prevState.sub_docs, doc]
                }));
            }
        })
    }

    // вибирає із списка посад першу і показує відповідні їй документи
    componentDidMount() {

        this.setState({
            seat_id: window.my_seats[0].id
        });

        axios({ // отримуємо з бази список документів
            method: 'get',
            url: 'get/' + window.my_seats[0].id + '/',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            // console.log(response);
            // розносимо документи у списки закритих та відкритих
            this.docListArrange(response.data);
            // this.setState({sub_docs: response.data});
        }).catch(function (error) {
            console.log('errorpost: ' + error);
        });
    }

    // При зміні посади змінюється ід посади і списки документів
    onChange(event) {
        if (event.target.name === 'my_seat') { // беремо ід посади із <select>
            const selectedIndex = event.target.options.selectedIndex;
            this.setState({
                seat_id: parseInt(event.target.options[selectedIndex].getAttribute('value'))
            });

            axios({ // отримуємо з бази список документів
                method: 'get',
                url: 'get/' + parseInt(event.target.options[selectedIndex].getAttribute('value')) + '/',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                // console.log(response);
                // розносимо документи у списки закритих та відкритих
                this.docListArrange(response.data);
                // this.setState({sub_docs: response.data});
            }).catch(function (error) {
                console.log('errorpost: ' + error);
            });
        }
    }

    // Виклик історії документу
    onRowClick(clicked_row) {
        this.setState({row:clicked_row});
        axios({
            method: 'get',
            url: 'get_doc/' + clicked_row.id + '/',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {
            console.log(response);
            this.setState({
                doc_info: {
                    free_time: response.data.free_time,
                    path: response.data.path,
                    flow: response.data.flow,
                    destination: response.data.destination,
                }
            })
        }).catch(function (error) {
            console.log('errorpost: ' + error);
        });
    }

    render() {
        const { seat_id, sub_columns, sub_col_width, } = this.state;

        return(
            <div>
                {/* Якщо посад більше, ніж одна, дає можливість обрати необхідну */}
                <Choose>
                        <When condition = {window.my_seats.length > 1}>
                            <label>Оберіть посаду:</label><br/>
                            <select id='my-seat-select' name='my_seat' value={seat_id} onChange={this.onChange}>
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
                <div className="row">
                    <div className="col-lg-4">
                        <div>Документи підлеглих у роботі</div>
                        <MyTable
                            rows={this.state.sub_docs}
                            columns={sub_columns}
                            defaultSorting={[{ columnName: "id", direction: "desc" }]}
                            colWidth={sub_col_width}
                            onRowClick={this.onRowClick}
                            filter
                        />
                    </div>
                    <div className="col-lg-4">
                        <div>Архів документів підлеглих</div>
                        <MyTable
                            rows={this.state.sub_archive}
                            columns={sub_columns}
                            defaultSorting={[{ columnName: "id", direction: "desc" }]}
                            colWidth={sub_col_width}
                            onRowClick={this.onRowClick}
                            filter
                        />
                    </div>
                    <div className="col-lg-4">
                        <DocInfo doc={this.state.row} my_seat_id={this.state.seat_id} doc_info={this.state.doc_info} closed={true}/>
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <SubDocs/>,
    document.getElementById('sub_docs')
);