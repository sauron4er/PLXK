'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css';

class SeatsTable extends React.Component {
    constructor(props) {
    super(props);
  }

    render() {
        const columns = [{
            Header: 'Посади',
            columns: [
                {
                    Header: 'Відділ',
                    accessor: 'department' // String-based value accessors!
                }, {
                    Header: 'Назва',
                    accessor: 'seat',
                }, {
                    Header: 'Керівник',
                    accessor: 'chief',
                }
            ]
        }];

        return (
            <ReactTable
                data = {window.seats}
                columns={columns}
                defaultPageSize={5}
                className="-striped -highlight"
            />
        )
    }
}

ReactDOM.render(
    <SeatsTable />,
    document.getElementById('seats_table')
);