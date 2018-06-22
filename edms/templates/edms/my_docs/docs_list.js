'use strict';
import React from 'react';
import axios from 'axios';
import querystring from 'querystring'; // for axios
import Paper from '@material-ui/core/Paper';
import {Grid, Table, TableHeaderRow} from '@devexpress/dx-react-grid-material-ui';

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';


// внутрішні настройки ReactGrid для реакції рядка на клік
const TableRow = ({ row, ...restProps }) => (
  <Table.Row
    {...restProps}
    // eslint-disable-next-line no-alert
    onClick={() => alert(JSON.stringify(row))}
    style={{
      cursor: 'pointer',
      // ...styles[row.sector.toLowerCase()],
    }}
  />
);


class DocsList extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
      columns: [
        { name: 'id', title: '№' },
        { name: 'type', title: 'Тип' },
        { name: 'date', title: 'Дата' },
      ],
      seat_docs: [], // список документів, закріплених за конкретною посадою користувача
      tableColumnExtensions: [  // ширина стовбців
        { columnName: 'id', width: 70 },
        { columnName: 'type', width: 250 },
        { columnName: 'date', width: 100 },
      ],
    };

    render() {
        const { columns, tableColumnExtensions } = this.state;

        return(
            <div>Мої документи в роботі:
                <Paper className="mt-2">
                    <Grid
                      rows={this.props.my_docs}
                      columns={columns}
                    >
                      <Table rowComponent={TableRow} columnExtensions={tableColumnExtensions} />
                      <TableHeaderRow />
                    </Grid>
                </Paper>
            </div>

        )
    }
}

export default DocsList;