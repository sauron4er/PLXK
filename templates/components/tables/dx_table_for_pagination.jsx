// Компонент-обгортка над компонентом DevExtreme React Grid
// https://devexpress.github.io/devextreme-reactive/react/grid/docs/guides/getting-started/

/*
 * Якщо відправити в таблицю проп coloredStatus: колонка,
 * яка має назву status, стає зеленою, якщо її value = 'ok',
 * жовтою, коли value = 'in progress' і червоною в інших випадках.
 */

/*
 * Компонент відображає список файлів у комірці, якщо ця комірка має name = files*
 * */
import * as React from 'react';
import {Grid, Table, VirtualTable, TableHeaderRow, TableFilterRow} from '@devexpress/dx-react-grid-material-ui';
import {SortingState, FilteringState, EditingState, SelectionState, IntegratedSelection} from '@devexpress/dx-react-grid';

import './dx_table_styles.css';

const styles = {
  true: {
    // Колір рядка червоний, якщо заданий рядок == 'true'
    backgroundColor: 'rgba(255,51,54,0.36)'
  }
};

const getRowId = (row) => row.id;

class DxTable extends React.PureComponent {
  constructor(props) {
    super(props);

    this.changeAddedRows = this.changeAddedRows.bind(this);
    this.changeEditingRowIds = this.changeEditingRowIds.bind(this);
    this.changeRowChanges = this.changeRowChanges.bind(this);
    this.commitChanges = this.commitChanges.bind(this);

    this.state = {
      rows: this.props.rows,
      addedRows: [],
      editingRowIds: [],
      rowChanges: {},
      clicked_row_index: ''
    };
  }

  // TODO розібратися, чому іноді this.props.rows не переходить в this.state.rows, а іноді переходить

  // призначає в state нові props при їх зміні.
  // додав цю функцію, бо в більшості випадків при рендері
  // props чомусь не призначалися в state (rows: this.props.rows - не спрацьовує)
  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.rows !== this.state.rows) {
      this.setState({rows: nextProps.rows});
    }
  }

  changeAddedRows(addedRows) {
    const initialized = addedRows.map((row) => (Object.keys(row).length ? row : {name: ''}));
    this.setState({addedRows: initialized});
  }

  changeEditingRowIds(editingRowIds) {
    this.setState({editingRowIds});
  }

  changeRowChanges(rowChanges) {
    this.setState({rowChanges});
  }

  commitChanges({added, changed, deleted}) {
    let {rows} = this.state;
    if (added) {
      // автозаповнення поля під назвою id (визначається по довжині масиву, а не по попередньому id)
      const startingAddedId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 1;
      rows = [
        ...rows,
        ...added.map((row, index) => ({
          id: startingAddedId + index,
          ...row
        }))
      ];
    }
    if (changed) {
      rows = rows.map((row) => (changed[row.id] ? {...row, ...changed[row.id]} : row));
    }
    if (deleted) {
      const deletedSet = new Set(deleted);
      rows = rows.filter((row) => !deletedSet.has(row.id));
    }

    this.setState({
      rows: rows
    });

    // відправляємо нові дані батьку
    // ОБЕРЕЖНО, таблиця кожен раз відправляється батьку вся,
    // якщо даних дуже багато - зміни треба робити поза таблицею.
    const push_data = this.props.getData;
    push_data(rows);
  }

  // Стилі рядків
  ChooseStyle(row) {
    const {clicked_row_index} = this.state;

    let style = {
      cursor: 'pointer',
      height: '30px',
      estimatedRowHeight: '30px'
    };

    if (row.id === clicked_row_index) {
      return {
        ...style,
        backgroundColor: '#e6e6e6'
      };
    }
    if (this.props.redRow) {
      switch (this.props.redRow) {
        case 'is_vacant':
          return {
            ...style,
            ...styles[row.is_vacant]
          };
        case 'is_canceled':
          let today = new Date();
          const dd = String(today.getDate()).padStart(2, '0');
          const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          const yyyy = today.getFullYear();
          today = yyyy + '-' + mm + '-' + dd;

          return {
            ...style,
            // ...styles[row.date_canceled !== '']
            ...styles[row.date_canceled !== '' && row.date_canceled < today]
          };
        default:
          return {
            ...style
          };
      }
    }
    return {
      ...style
    };
  }

  // внутрішні настройки рядка ReactGrid
  TableRow = ({row, ...restProps}) => (
    <Table.Row
      className='css_dx_table_row'
      {...restProps}
      // eslint-disable-next-line no-alert
      style={this.ChooseStyle(row)}
    />
  );

  arrangeFiles = (files, style) => {
    return (
      <td style={style}>
        <For each='file' index='id' of={files}>
          <div key={file.id}>
            <a href={'../../media/' + file.file} target='_blank'>
              {file.name}{' '}
            </a>
          </div>
        </For>
      </td>
    );
  };

  arrangeList = (list, style) => {
    return (
      <td style={style}>
        <For each='item' of={list} index='index'>
          <div key={index} >{item}</div>
        </For>
      </td>
    );
  };

  autoActuality = (date_start, date_end) => {
    if (new Date(date_start) > this.state.today) return 'yellow';
    if (date_end !== '' && new Date(date_end) < this.state.today) return 'red';
    return 'lightgreen';
  };

  // Налаштування комірки
  CellComponent = (props) => {
    let cell_value = props.value;

    let style = {
      padding: 0,
      paddingLeft: 5,
      margin: 0,
      fontSize: '12px',
      height: '30px',
      estimatedRowHeight: '30px',
      border: '1px solid #F0F0F0'
    };

    // status
    if (this.props.coloredStatus && props.column.name === 'status') {
      const color = props.value === 'in progress' ? 'yellow' : props.value === 'ok' ? 'lightgreen' : 'red';
      style = {
        backgroundColor: color,
        color: color
      };
      cell_value = '';
    }

    // stage
    if (this.props.coloredStage && props.column.name === 'stage') {
      let color = '';
      switch (props.value) {
        case 'В роботі':
          color = 'yellow';
          break;
        case 'Відмовлено':
          color = 'red';
          break;
        case 'Виконано':
          color = 'lightblue';
          break;
        case 'Підтверджено':
          color = 'lightgreen';
          break;
      }
      style = {
        padding: 0,
        paddingLeft: 5,
        margin: 0,
        fontSize: '12px',
        height: '30px',
        estimatedRowHeight: '30px',
        border: '1px solid #F0F0F0',
        backgroundColor: color
      };
    }

    // autoActuality
    if (props.column.name === 'autoActuality' && (props.row.date_start || props.row.date_end)) {
      const color = this.autoActuality(props.row.date_start, props.row.date_end);
      style = {
        backgroundColor: color,
        color: color
      };
      cell_value = '';
    }

    // column with list in it
    if (this.props.listTypeColumn === props.column.name) {
      if (props.value.length) {
        return this.arrangeList(props.value, style);
      } else {
        cell_value = '';
      }
    }

    // files
    if (props.column.name === 'files' && Array.isArray(props.row.files)) {
      return this.arrangeFiles(props.row.files, style);
    }

    return <Table.Cell onClick={() => this.onRowClick(props.row)} {...props} value={cell_value} style={style} />;
  };

  HeaderCellComponent = (props) => (
    <TableHeaderRow.Cell
      {...props}
      style={{
        paddingTop: '0',
        paddingRight: '0',
        paddingBottom: '0',
        paddingLeft: '1',
        fontSize: '11px'
      }}
    />
  );

  FilterCellComponent = (props) => (
    <TableFilterRow.Cell
      {...props}
      style={{
        padding: '0',
        fontSize: '9px'
      }}
    />
  );

  // передача інфу про клікнутий рядок наверх
  onRowClick(row) {
    const onRowClick = this.props.onRowClick;
    this.setState({clicked_row_index: row.id});
    onRowClick(row);
  }

  render() {
    const {rows} = this.state;
    const {height, columns, changeSorting, changeFiltering, colWidth, filters} = this.props;

    const table_height = height ? height : 750;

    return (
      <Grid rows={rows} columns={columns} getRowId={getRowId} style={'100%'} hoverStateEnabled={true}>
        <SortingState onSortingChange={changeSorting} />
        <FilteringState filters={filters} onFiltersChange={changeFiltering} defaultFilters={[]} />
        <EditingState onCommitChanges={this.commitChanges} />
        <SelectionState />

        <IntegratedSelection />

        <VirtualTable
          cellComponent={this.CellComponent}
          rowComponent={this.TableRow}
          columnExtensions={colWidth}
          messages={{noData: 'Немає даних'}}
          height={table_height}
        />

        <TableHeaderRow cellComponent={this.HeaderCellComponent} showSortingControls messages={{sortingHint: 'Сортувати'}} />

        <TableFilterRow rowHeight={1} messages={{filterPlaceholder: 'Фільтр'}} cellComponent={this.FilterCellComponent} />
      </Grid>
    );
  }
}

export default DxTable;
