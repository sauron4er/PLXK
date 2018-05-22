'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import Modal from 'react-responsive-modal';

class SeatsTable extends React.Component {
    constructor(props) {
    super(props);
  }

    state = {
        open: false,
        clicked: null,
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
            <div>
                <ReactTable
                    data = {window.seats}
                    columns={columns}
                    defaultPageSize={5}
                    className="-striped -highlight"

                    getTdProps={(state, rowInfo, column, instance) => {
                        return {
                          onClick: (e, handleOriginal) => {
                            this.onOpenModal();
                            this.clicked = rowInfo.original.seat;
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
                            Форма для внесення змін
                        </p>
                </Modal>
            </div>
        )
    }
}

ReactDOM.render(
    <SeatsTable />,
    document.getElementById('seats_table')
);