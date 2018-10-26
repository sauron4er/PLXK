'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import DxTable from '../dx_table';
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
        carry_out_items: [],

        // налаштування колонок для таблиць
        sub_columns: [
        { name: 'id', title: '№' },
        { name: 'type', title: 'Тип' },
        { name: 'author', title: 'Ініціатор' },
        // { name: 'dep', title: 'Відділ' },
        { name: 'date', title: 'Дата' },
      ],
        sub_col_width: [
        { columnName: 'id', width: 70 },
        { columnName: 'type', width: 120 },
        { columnName: 'author' },
        // { columnName: 'dep', width: 70 },
        { columnName: 'date', width: 90 },
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
            // розносимо документи у списки закритих та відкритих
            if (response.data) {
                this.docListArrange(response.data);
            }
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
    // TODO створити окремий компонент для отримання через нього інфи про документ з різних сторінок сайту.
    onRowClick(clicked_row) {
        this.setState({row: clicked_row});
    }

    render() {
        const { seat_id, sub_columns, sub_col_width, } = this.state;

        return(
            <div  className="css_height" >
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

                <div className="row css_height_100">
                    <div className="col-lg-4">
                        <div>Документи підлеглих у роботі</div>
                        <DxTable
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
                        <DxTable
                            rows={this.state.sub_archive}
                            columns={sub_columns}
                            defaultSorting={[{ columnName: "id", direction: "desc" }]}
                            colWidth={sub_col_width}
                            onRowClick={this.onRowClick}
                            filter
                        />
                    </div>
                    <div className="col-lg-4 css_height_100">
                        <DocInfo
                            doc={this.state.row}
                            my_seat_id={this.state.seat_id}
                            closed={true}
                        />
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