'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import DxTable from '../dx_table';
import DocInfo from '../doc_info/doc_info'
import SeatChooser from '../seat_chooser';
import '../my_styles.css'
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';


class SubDocs extends React.Component {

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
        main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    };

    // шукає обрану посаду або обирає першу зі списку і показує відповідні їй документи
    componentDidMount() {

        const seat_id = parseInt(localStorage.getItem('my_seat') ? localStorage.getItem('my_seat') : window.my_seats[0].id);

        this.setState({
            seat_id: seat_id,
            main_div_height: this.mainDivRef.clientHeight - 30
        });

        this.updateLists(seat_id);
    }

    // Отримує ref основного div для визначення його висоти і передачі її у DxTable
    getMainDivRef = (input) => {
        this.mainDivRef = input;
    };

    // Отримує список документів відповідно до обраної посади
    updateLists = (seat_id) => {
        axios({ // отримуємо з бази список документів
            method: 'get',
            url: 'get/' + seat_id + '/',
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
    };

    // функція, яка розділяє загальний список документів на списки відкритих і закритих документів
    docListArrange = (doc_list) => {
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
    };

    // отримує нову посаду з компоненту SeatChooser і відповідно змінює списки
    onSeatChange = (new_seat_id) => {

        this.setState({
            seat_id: new_seat_id
        });

        this.updateLists(new_seat_id);
    };

    // Виклик історії документу
    onRowClick = (clicked_row) => {
        this.setState({row: clicked_row});
    };

    render() {
        const { sub_columns, sub_col_width, main_div_height } = this.state;

        return(
            <div>
                <SeatChooser onSeatChange={this.onSeatChange}/>
                <div className="row css_main_div" ref={this.getMainDivRef} >
                    <div className="col-lg-4">Документи підлеглих у роботі
                        <DxTable
                            rows={this.state.sub_docs}
                            columns={sub_columns}
                            defaultSorting={[{ columnName: "id", direction: "desc" }]}
                            colWidth={sub_col_width}
                            onRowClick={this.onRowClick}
                            height={main_div_height}
                            filter
                        />
                    </div>
                    <div className="col-lg-4">Архів документів підлеглих
                        <DxTable
                            rows={this.state.sub_archive}
                            columns={sub_columns}
                            defaultSorting={[{ columnName: "id", direction: "desc" }]}
                            colWidth={sub_col_width}
                            onRowClick={this.onRowClick}
                            height={main_div_height}
                            filter
                        />
                    </div>
                    <div className="col-lg-4 css_height_100">
                        <DocInfo
                            doc={this.state.row}
                            // my_seat_id={this.state.seat_id}
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