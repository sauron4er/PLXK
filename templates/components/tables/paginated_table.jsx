import React from 'react';
import DxTable from 'templates/components/tables/dx_table_for_pagination';
import Paper from '@material-ui/core/Paper';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';

class PaginatedTable extends React.Component {
  state = {
    rows: [],
    pagesCount: 0,
    page: 0,
    loading: true
  };

  componentDidMount() {
    this.getPage(1);
  }

  getPage = (page) => {
    const {url} = this.props;
    if (url.length) {
      axiosGetRequest(url + '/' + page + '/')
        .then((response) => {
          this.setState(
            {
              pagesCount: response.pagesCount,
              rows: response.rows
            },
            () => {
              this.setState({
                loading: false
              });
            }
          );
        })
        .catch((error) => notify(error));
    }
  };

  onChange = (e) => {};

  render() {
    const {columns, defaultSorting, colWidth, onRowClick, height, redRow, filter} = this.props;

    const {rows, pagesCount, loading} = this.state;

    // Таблиця бере висоту з this.props.height, якщо така є
    const paper_height = this.props.height ? this.props.height : '';
  
    return (
      <Paper className='mt-2 full_width' style={{height: paper_height ? paper_height : '100%'}}>
        <Choose>
          <When condition={!loading}>
            <DxTable
              rows={rows}
              columns={columns}
              defaultSorting={defaultSorting}
              colWidth={colWidth}
              onRowClick={onRowClick}
              height={height}
              redRow={redRow}
              filter={filter}
            />
          </When>
          <Otherwise>
            <Loader/>
          </Otherwise>
        </Choose>
      </Paper>
    );
  }

  static defaultProps = {
    url: '',
    columns: [],
    defaultSorting: [],
    colWidth: [],
    onRowClick: () => {},
    height: '100%',
    redRow: '',
    filter: true
  };
}

export default PaginatedTable;
