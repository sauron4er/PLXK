'use strict';
import React from 'react';
import DxTable from '../dx_table';
import DocInfo from '../doc_info/doc_info'
import '../my_styles.css'

class DocsList extends React.Component {

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
        { columnName: 'type' },
        { columnName: 'date', width: 100 },
      ],
      work_docs_col_width: [
        { columnName: 'id', width: 70 },
        { columnName: 'type', width: 150 },
        { columnName: 'author' },
      ],

      // seat_docs: [], // список документів, закріплених за конкретною посадою користувача
      row: '',
      doc_info: '',
      carry_out_items: [],
      main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    };

    componentDidMount() {
        this.setState({ main_div_height: this.mainDivRef.clientHeight - 30 });
    }

    // Отримує ref основного div для визначення його висоти і передачі її у DxTable
    getMainDivRef = (input) => {
        this.mainDivRef = input;
    };

    onRowClick = (clicked_row) => {
        this.setState({row:clicked_row});
    };

    // видаляє запис про виділений рядок, щоб очистити компонент DocInfo, передає інфу про закрити й документ в MyDocs
    removeRow = (id, mark_id, author_id) => {
        // видаляємо документ зі списку, якщо реакція не просто коментар чи файл:
        if (mark_id !== 4 && mark_id !== 12) {
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
            case 10:
                answer = 'Резолюції до документу №' + id + ' додано.';
                break;
            case 12:
                answer = 'Файл до документу №' + id + ' додано.';
                break;
        }
        this.setState({
            row: {
                id: 0,
                type: answer,
            },
        });
    };

    render() {
        const {work_docs_columns, my_docs_columns, my_docs_col_width, work_docs_col_width, main_div_height} = this.state;

        return(
            <div className="row css_main_div" ref={this.getMainDivRef}>
                <div className="col-lg-4">Документи в черзі
                    <DxTable
                        rows={this.props.work_docs}
                        columns={work_docs_columns}
                        defaultSorting={[{ columnName: "id", direction: "asc" }]}
                        colWidth={work_docs_col_width}
                        onRowClick={this.onRowClick}
                        height={main_div_height}
                        filter
                    />
                </div><br/>
                <div className="col-lg-4">Створені вами документи
                    <DxTable
                        rows={this.props.my_docs}
                        columns={my_docs_columns}
                        defaultSorting={[{ columnName: "id", direction: "asc" }]}
                        colWidth={my_docs_col_width}
                        onRowClick={this.onRowClick}
                        height={main_div_height}
                        filter
                    />
                </div>
                <div className="col-lg-4 css_height_100">
                    <DocInfo
                        doc={this.state.row}
                        direct_subs={this.props.direct_subs}
                        removeRow={this.removeRow}
                        closed={false}
                    />
                </div>
            </div>
        )
    }
}

export default DocsList;