'use strict';
import React from 'react';
import ReactDOM from 'react-dom';

import MyTable from '../my_table';
import DocInfo from '../my_docs/doc_info';


class Archive extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onRowClick = this.onRowClick.bind(this);
    }

    state = {
        seat_id: 0, // посада
        my_archive: [], // список моїх документів
        work_archive: [],   // список документів, що були в роботі
        row: '',    // вибраний документ
        doc_info: '',   // отримана з бд інфа про вибраний документ
        carry_out_items: [],

        // налаштування колонок для таблиць
        my_archive_columns: [
        { name: 'id', title: '№' },
        { name: 'type', title: 'Тип' },
        { name: 'date', title: 'Дата' },
      ],
        my_archive_col_width: [
        { columnName: 'id', width: 70 },
        { columnName: 'type' },
        { columnName: 'date', width: 90 },
      ],
        work_archive_columns: [
        { name: 'id', title: '№' },
        { name: 'type', title: 'Тип' },
        { name: 'author', title: 'Ініціатор' },
      ],
        work_archive_col_width: [
        { columnName: 'id', width: 70 },
        { columnName: 'type', width: 150 },
        { columnName: 'author' },
      ],
    };

    // вибирає із списка посад першу і показує відповідні їй документи
    componentDidMount() {
        this.setState({
            seat_id: window.my_seats[0].id
        });

        window.my_archive.map(doc => {
            if (doc.author_seat_id === window.my_seats[0].id) { // сортування по посаді
                this.setState(prevState => ({
                  my_archive: [...prevState.my_archive, doc]
                }));
            }
        });

        window.work_archive.map(doc => {
            if (doc.emp_seat_id === window.my_seats[0].id) { // сортування по посаді
                this.setState(prevState => ({
                  work_archive: [...prevState.work_archive, doc]
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

            this.state.my_archive =[];
            window.my_archive.map(doc => {
                if (doc.author_seat_id === parseInt(event.target.options[selectedIndex].getAttribute('value'))) {
                    this.setState(prevState => ({
                      my_archive: [...prevState.my_archive, doc]
                    }));
                }
            });

            this.state.work_archive =[];
            window.work_archive.map(doc => {
                if (doc.emp_seat_id === parseInt(event.target.options[selectedIndex].getAttribute('value'))) {
                    this.setState(prevState => ({
                      work_archive: [...prevState.work_archive, doc]
                    }));
                }
            });
        }
    }


    onRowClick(clicked_row) {
        this.setState({row:clicked_row});
    }

    render() {
        const { seat_id, my_archive_columns, my_archive_col_width, work_archive_columns, work_archive_col_width } = this.state;

        return(
            <div className="row css_height p-2">
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

                <div className="row mt-3" style={{height: '100%'}}>
                    <div className="col-lg-4">
                        <div>Створені мною документи</div>
                        <MyTable
                            rows={this.state.my_archive}
                            columns={my_archive_columns}
                            defaultSorting={[{ columnName: "date", direction: "desc" }]}
                            colWidth={my_archive_col_width}
                            onRowClick={this.onRowClick}
                            filter
                        />
                    </div>
                    <div className="col-lg-4">
                        <div>Документи, що були у роботі</div>
                        <MyTable
                            rows={this.state.work_archive}
                            columns={work_archive_columns}
                            defaultSorting={[{ columnName: "id", direction: "asc" }]}
                            colWidth={work_archive_col_width}
                            onRowClick={this.onRowClick}
                            filter
                        />
                    </div>
                    <div className="col-lg-4" style={{height: '100%'}}>
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
    <Archive/>,
    document.getElementById('archive')
);