'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import Modal from 'react-responsive-modal';



class UserTable extends React.Component {
    constructor(props) {
    super(props);
    }

    state = {
        open: false,
    };

    onOpenModal = () => {
        this.setState({ open: true });
    };

    onCloseModal = () => {
        this.setState({ open: false });
    };

    render() {
        const { open } = this.state;
        const columns = [{
            Header: 'Співробітники',
            columns: [
                {
                    Header: 'Ф.І.О.',
                    accessor: 'emp' // String-based value accessors!
                },
            ]
        }];

        return (
            <div>
                <ReactTable
                    data = {window.emps}
                    columns={columns}
                    defaultPageSize={14}
                    filterable
                    className="-striped -highlight"

                    getTdProps={(state, rowInfo, column, instance) => {
                        return {
                          onClick: (e, handleOriginal) => {
                            this.onOpenModal();
                            this.clicked = rowInfo.original.emp;
                            if (handleOriginal) {
                              handleOriginal();
                            }
                          }
                        };
                      }}
                />

                <Modal open={open} onClose={this.onCloseModal} center>
                    <br/>
                    <p>{this.clicked}</p>
                    <p>
                        Форма для внесення змін.
                    </p>
                </Modal>
            </div>
        )
    }
}

ReactDOM.render(
    <UserTable />,
    document.getElementById('user_table')
);