import React from 'react';
import DxTable from 'templates/components/tables/dx_table_for_pagination';
import Paper from '@material-ui/core/Paper';
import ReactPaginate from 'react-paginate';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import './pagination.css';
import corrStore from '../../../correspondence/templates/correspondence/store';

let delayTimeout;

class PaginatedTable extends React.Component {
  state = {
    rows: [],
    pagesCount: 0,
    page: 0,
    sort_name: '',
    sort_direction: '',
    filtering: [],
    loading: true
  };

  componentDidMount() {
    this.getPage(0);
  }

  getPage = (page) => {
    const {url} = this.props;
    const {sort_name, sort_direction, filtering} = this.state;
    if (url.length) {
      let formData = new FormData();
      formData.append('sort_name', sort_name);
      formData.append('sort_direction', sort_direction);
      formData.append('filtering', JSON.stringify(filtering));

      axiosPostRequest(url + '/' + page + '/', formData)
        .then((response) => {
          this.setState({
            pagesCount: response.pagesCount,
            rows: response.rows,
            loading: false
          });
        })
        .catch((error) => notify(error));
    }
  };

  handlePageClick = (page) => {
    this.getPage(page.selected);
  };

  changeSorting = (column) => {
    this.setState(
      {
        sort_name: column[0].columnName,
        sort_direction: column[0].direction
      },
      () => {
        this.getPage(0);
      }
    );
  };

  changeFiltering = (data) => {
    clearTimeout(delayTimeout);
    delayTimeout = setTimeout(() => {
      this.setState(
        {
          filtering: data
        },
        () => {
          this.getPage(0);
        }
      );
    }, 1000);
  };

  render() {
    const {columns, defaultSorting, colWidth, onRowClick, height, redRow, filter, coloredStatus} = this.props;

    const {rows, pagesCount, loading, page} = this.state;

    // Таблиця бере висоту з this.props.height, якщо така є
    const paper_height = this.props.height ? this.props.height : '';

    const paging = {
      currentPage: page,
      totalPages: pagesCount
    };

    return (
      <Paper className='mt-2 full_width' style={{height: paper_height ? paper_height : '100%'}}>
        <Choose>
          <When condition={!loading}>
            <DxTable
              rows={rows}
              columns={columns}
              colWidth={colWidth}
              onRowClick={onRowClick}
              height={height}
              paging={paging}
              redRow={redRow}
              filter={filter}
              changeSorting={this.changeSorting}
              changeFiltering={this.changeFiltering}
              coloredStatus
            />
            <If condition={pagesCount > 1}>
              <ReactPaginate
                previousLabel={'Назад'}
                nextLabel={'Вперед'}
                breakLabel={'...'}
                breakClassName={'break-me'}
                pageCount={pagesCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={this.handlePageClick}
                containerClassName={'paginator'}
                activeClassName={'active'}
                pageClassName={'btn btn-sm'}
                previousClassName={'btn btn-sm'}
                nextClassName={'btn btn-sm'}
              />
            </If>
          </When>
          <Otherwise>
            <Loader />
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
