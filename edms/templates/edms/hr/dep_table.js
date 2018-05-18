'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import Modal from 'react-responsive-modal';


class DepTable extends React.Component {
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
            <div>
                <ReactTable
                    data = {window.deps}
                    columns={columns}
                    defaultPageSize={5}
                    className="-striped -highlight"

                    getTdProps={(state, rowInfo, column, instance) => {
                        return {
                          onDoubleClick: (e, handleOriginal) => {
                            this.onOpenModal();
                            this.clicked = rowInfo.original.dep;
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
    <DepTable />,
    document.getElementById('dep_table')
);