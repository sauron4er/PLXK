'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css';

class DepTable extends React.Component {
    constructor(props) {
    super(props);
  }

    render() {
        const columns = [{
            Header: 'Відділи',
            columns: [
                {
                    Header: 'Назва',
                    accessor: 'dep' // String-based value accessors!
                }, {
                    Header: 'Керівник',
                    accessor: 'manager',
                }
            ]
        }];

        return (
            <ReactTable
                data = {window.deps}
                columns={columns}
                defaultPageSize={5}
                className="-striped -highlight"
            />
        )
    }
}

ReactDOM.render(
    <DepTable />,
    document.getElementById('dep_table')
);