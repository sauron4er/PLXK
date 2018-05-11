'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css';

class UserTable extends React.Component {
    constructor(props) {
    super(props);
  }

    render() {
        const columns = [{
            Header: 'Співробітники',
            columns: [
                {
                    Header: 'Ф.І.О.',
                    accessor: 'emp' // String-based value accessors!
                }, {
                    Header: 'Відділ',
                    accessor: 'department',
                }
            ]
        }];

        return (
            <ReactTable
                data = {window.emps}
                columns={columns}
                defaultPageSize={15}
                className="-striped -highlight"

                getTdProps={(state, rowInfo, column, instance) => {
                    return {
                      onDoubleClick: (e, handleOriginal) => {
                        console.log(rowInfo.row.emp);

                        // IMPORTANT! React-Table uses onClick internally to trigger
                        // events like expanding SubComponents and pivots.
                        // By default a custom 'onClick' handler will override this functionality.
                        // If you want to fire the original onClick handler, call the
                        // 'handleOriginal' function.
                        if (handleOriginal) {
                          handleOriginal();
                        }
                      }
                    };
                  }}
            />
        )
    }
}

ReactDOM.render(
    <UserTable />,
    document.getElementById('user_table')
);