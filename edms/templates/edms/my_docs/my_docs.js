'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import {Grid, Table, TableHeaderRow} from '@devexpress/dx-react-grid-material-ui';

class MyDocs extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
      my_docs: window.my_docs,
      columns: [
        { name: '№', title: '№' },
        { name: 'type', title: 'Тип' },
        { name: 'date', title: 'Дата' },
      ],
    };

    render() {
        const { my_docs, columns } = this.state;
        return(
            <div>Мої документи в роботі:
                <Grid
                  rows={my_docs}
                  columns={columns}
                >
                  <Table />
                  <TableHeaderRow />
                </Grid>
            </div>

        )
    }
}

ReactDOM.render(
    <MyDocs />,
    document.getElementById('my_docs')
);