'use strict';
import React, {Fragment} from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

export default class Table extends React.Component {
  state = {
    selected: null,
    data: this.props.data,
    columns: [...this.props.columns],
    height: this.props.height,
    pageSize: this.props.height / 40 // Висоту контейнера ділимо на висоту рядку = к-сть рядків
  };

  componentWillMount() {
    // якщо таблиця editable - рендерить ячейки як input та додає кнопки видалення
    if (this.props.editable) {
      let {columns} = this.state;
      for (let column in columns) {
        columns[column].Cell = this.cellEditable;
      }

      columns.push({
        Header: '',
        accessor: '',
        width: 30,
        Cell: (cellInfo) => {
          return (
            <div id='del_button'>
              <button className='btn btn-sm btn-danger' onClick={(e) => this.delRow(e, cellInfo)}>
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
          );
        }
      });
      this.setState({
        columns
      });
    }
  }

  componentDidMount() {
    if (this.props.editable) {
      this.setState({
        height: this.props.height - document.getElementById('add_button').offsetHeight
      });
    }
  }

  handleInputChange = (cellInfo, event) => {
    let data = [...this.state.data];
    data[cellInfo.index][cellInfo.column.id] = event.target.value;

    this.setState({data});
  };

  cellEditable = (cellInfo) => {
    const cellValue = this.state.data[cellInfo.index][cellInfo.column.id];

    return (
      <input
        name='input'
        type='text'
        className='form-control full_width'
        onChange={this.handleInputChange.bind(null, cellInfo)}
        value={cellValue}
      />
    );
  };

  addRow = (e) => {
    e.preventDefault();
    let data = [...this.state.data];
    const columns = [...this.state.columns];
    let new_row = {};

    for (const column in columns) {
      // accessor = '' для кнопки видалення рядка
      if (columns[column].accessor !== '') {
        new_row[columns[column].accessor] = '';
      }
    }

    data.push(new_row);
    this.props.onTableChange(data);
    this.setState({data});
  };

  delRow = (e, cellInfo) => {
    e.preventDefault();
    let data = [...this.state.data];
    data.splice(cellInfo.index, 1);
    this.props.onTableChange(data);
    this.setState({data});
  };

  // Налаштування рядка:
  getTrProps = (state, rowInfo, column, instance) => {
    const {customClick} = this.props;

    if (typeof rowInfo !== 'undefined') {
      return {
        onClick: (e, handleOriginal) => {
          this.setState({
            selected: rowInfo.index,
            hovered: false
          });
          customClick(rowInfo.original);

          if (handleOriginal) {
            handleOriginal();
          }
        },
        onMouseOver: () => {
          this.setState({
            hovered: true
          });
        },
        onMouseLeave: () => {
          this.setState({
            hovered: false
          });
        },
        style: {
          background: this.state.hovered ? '#f0f0f0' :
            rowInfo.index === this.state.selected ? '#dcdcdc' : 'white',
          // background: rowInfo.index === this.state.selected ? '#e2e0db' : 'white',
          cursor: 'pointer'
        }
      };
    } else {
      return {
        onClick: (e, handleOriginal) => {
          if (handleOriginal) {
            handleOriginal();
          }
        },
        style: {
          background: 'white',
          color: 'black'
        }
      };
    }
  };

  // Налаштування ячейки:
  getTdProps = () => ({
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: '28px'
    }
  });

  render() {
    console.log(this.props.defaultPageSize);
    const {
      filterable,
      sortable,
      editable,
      showPaginationTop,
      showPaginationBottom,
      defaultPageSize
    } = this.props;
    const {data, columns, height, pageSize} = this.state;

    return (
      
      <Fragment>
        <div id='table'>
          <If condition={editable}>
            <button
              className='btn btn-sm btn-outline-secondary'
              id='add_button'
              onClick={this.addRow}
            >
              Додати рядок
            </button>
          </If>

          <ReactTable
            key={pageSize}
            data={data}
            columns={columns}
            showPaginationTop={showPaginationTop}
            showPaginationBottom={showPaginationBottom}
            filterable={filterable}
            sortable={sortable}
            defaultPageSize={defaultPageSize ? defaultPageSize : pageSize}
            showPageSizeOptions={false}
            showPagination={true}
            className={'-highlight'}
            style={{height: height}}
            previousText={'Назад'}
            nextText={'Вперед'}
            loadingText={'Завантаження...'}
            noDataText={'Немає даних'}
            pageText={'Сторінка'}
            ofText={'з'}
            rowsText={'рядків'}
            getTrProps={this.getTrProps}
            getTdProps={this.getTdProps}
          />
        </div>
      </Fragment>
    );
  }

  static defaultProps = {
    data: [],
    columns: [{Header: '', accessor: ''}],
    filterable: true,
    sortable: true,
    defaultPageSize: 0,
    height: 'auto',
    customClick: (row) => {}, // функція, яка повертає у батьківський компонент інформацію про клікнутий рядок
    onTableChange: (data) => {}, // функція, яка повертає у батьківський компонент змінений масив даних таблиці
    editable: false,
    showPaginationTop: true,
    showPaginationBottom: false
  };
}
