'use strict';
import React from 'react';

import MyTable from '../my_table';
import DocInfo from '../my_docs/doc_info';


class DocsList extends React.Component {
    constructor(props) {
        super(props);

        this.changeSelection = selection => this.setState({ selection });
        this.onRowClick = this.onRowClick.bind(this);
        this.removeRow = this.removeRow.bind(this);
    }

    state = {
      my_docs_columns: [
        { name: 'id', title: '№' },
        { name: 'type', title: 'Тип' },
        { name: 'date', title: 'Дата' },
      ],
      work_docs_columns: [
        { name: 'id', title: '№' },
        { name: 'type', title: 'Тип' },
        { name: 'author', title: 'Ініціатор' },
      ],
      my_docs_col_width: [
        { columnName: 'id', width: 70 },
        { columnName: 'type', width: 240 },
        { columnName: 'date', width: 100 },
      ],
      work_docs_col_width: [
        { columnName: 'id', width: 70 },
        { columnName: 'type', width: 180 },
        { columnName: 'author', width: 160 },
      ],

      // seat_docs: [], // список документів, закріплених за конкретною посадою користувача
      row: '',
      doc_info: '',
      carry_out_items: [],
    };

    onRowClick(clicked_row) {
        this.setState({row:clicked_row});
    }

    // видаляє запис про виділений рядок, щоб очистити компонент DocInfo, передає інфу про закрити й документ в MyDocs
    removeRow(id, mark_id, author_id) {
        // видаляємо документ зі списку, якщо реакція не просто коментар:
        if (mark_id !== 4) {
            this.props.removeDoc(id, author_id);
        }
        // рендеримо відповідь на подію:
        let answer = '';
        switch(mark_id) {
            case 2:
                answer = 'Документ №' + id + ' погоджено та повернуто ініціатору.';
                break;
            case 3:
                answer = 'У виконанні документу №' + id + ' відмовлено.';
                break;
            case 4:
                answer = 'Коментар до документу №' + id + ' опубліковано.';
                break;
            case 5:
                answer = 'Документ №' + id + ' відправлено автору на доопрацювання.';
                break;
            case 6:
                answer = 'Документ №' + id + ' погоджено та відправлено в подальшу роботу.';
                break;
            case 7:
                answer = 'Документ №' + id + ' закрито та відправлено в архів.';
                break;
            case 8:
                answer = 'Позначка "Ознайомлений" додана до документу №' + id + '.';
                break;
        }
        this.setState({
            row: {
                id: 0,
                type: answer,
            },
        });
    }

    render() {
        const { work_docs_columns, my_docs_columns, my_docs_col_width, work_docs_col_width } = this.state;

        return(
            <div className="row">
                <div className="col-lg-5">
                    <div>Документи в черзі:
                        <MyTable
                            rows={this.props.work_docs}
                            columns={work_docs_columns}
                            defaultSorting={[{ columnName: "id", direction: "asc" }]}
                            colWidth={work_docs_col_width}
                            onRowClick={this.onRowClick}
                            pageSize={5}
                            filter
                        />
                    </div><br/>
                    <div>Створені мною документи:
                        <MyTable
                            rows={this.props.my_docs}
                            columns={my_docs_columns}
                            defaultSorting={[{ columnName: "date", direction: "desc" }]}
                            colWidth={my_docs_col_width}
                            onRowClick={this.onRowClick}
                            pageSize={5}
                            filter
                        />
                    </div>
                </div>
                <div className="col-lg-7">Обраний документ:
                    <DocInfo
                        doc={this.state.row}
                        my_seat_id={this.props.my_seat_id}
                        removeRow={this.removeRow}
                        closed={false}
                    />
                </div>
            </div>
        )
    }
}

export default DocsList;