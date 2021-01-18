// Компонент-обгортка над компонентом DevExtreme React Grid
// https://devexpress.github.io/devextreme-reactive/react/grid/docs/guides/getting-started/

/*
 * Якщо відправити в таблицю проп coloredStatus:
 * колонка, яка має назву status, стає зеленою, якщо її value = 'ok',
 * жовтою, коли value = 'in progress' і червоною в інших випадках.
 */

/*
 * Якщо відправити в таблицю проп redRow зі значенням - назвою колонки (наприклад redRow='is_canceled'),
 * то якщо колонка з відповідною назвою є True, то цілий рядок виділяється червоним
 */

/*
 * Якщо у списку колонок є autoActuality, таблиця автоматично буде визначати актуальність документа,
 * вираховуючи її з колонок date_start та date_end. Ця колонка буде зеленою, якщо документ актуальний,
 * червоною, якщо вже не актуальний, жовтою, якщо актуальність ще не настала
 */

/*
 * Компонент відображає список файлів у комірці, якщо ця комірка має name = files*
 * */
import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {
  Grid,
  Table,
  VirtualTable,
  TableHeaderRow,
  TableFilterRow,
  PagingPanel,
  TableEditRow,
  TableEditColumn
} from '@devexpress/dx-react-grid-material-ui';
import {
  PagingState,
  SortingState,
  FilteringState,
  IntegratedSorting,
  IntegratedFiltering,
  IntegratedPaging,
  EditingState,
  SelectionState,
  IntegratedSelection
} from '@devexpress/dx-react-grid';

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
      clicked_row_index: '',
      today: new Date()
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
          return {
            ...style,
            ...styles[row.date_canceled !== '']
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
      // onClick={() => this.onRowClick(row)} - це опрацьовується в CellComponent
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
      const color = props.value === 'in work' ? 'yellow' : props.value === 'done' ? 'lightgreen' : props.value === 'denied' ? 'red'  : '';
      style = {
        backgroundColor: color,
        color: color
      };
      cell_value = '';
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
        padding: '1',
        fontSize: '11px'
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
    const {rows, editingRowIds, rowChanges, addedRows} = this.state;

    // Таблиця бере висоту з this.props.height, якщо така є
    const height = this.props.height && this.props.height !== null ? this.props.height : '100%';
    const paper_height = !this.props.paging ? height : {};
    const grid_height = !this.props.paging ? '100%' : {};
    const virtual_height = this.props.height && this.props.height !== null ? this.props.height : 750;

    return (
      <Paper className='mt-2 full_width' style={{height: {paper_height}}}>
        <Grid rows={rows} columns={this.props.columns} getRowId={getRowId} style={{height: {grid_height}}} hoverStateEnabled={true}>
          <SortingState defaultSorting={this.props.defaultSorting} />
          <If condition={this.props.paging}>
            <PagingState pageSize={this.props.pageSize ? this.props.pageSize : 8} />
          </If>
          <FilteringState defaultFilters={[]} />
          <EditingState onCommitChanges={this.commitChanges} />
          <SelectionState />

          <IntegratedSorting />
          <If condition={this.props.paging}>
            <IntegratedPaging />
          </If>
          <IntegratedFiltering />
          <IntegratedSelection />

          {/*Якщо в props нема paging - таблиця показується зі скроллом*/}
          <Choose>
            <When condition={this.props.paging}>
              <Table
                cellComponent={this.CellComponent}
                rowComponent={this.TableRow}
                columnExtensions={this.props.colWidth}
                messages={{noData: 'Немає даних'}}
              />
            </When>
            <Otherwise>
              {/*VirtualTable чомусь неправильно працює з редагуванням. Потрібно використовувати paging */}
              <VirtualTable
                cellComponent={this.CellComponent}
                rowComponent={this.TableRow}
                columnExtensions={this.props.colWidth}
                messages={{noData: 'Немає даних'}}
                height={virtual_height}
              />
            </Otherwise>
          </Choose>

          <TableHeaderRow cellComponent={this.HeaderCellComponent} showSortingControls messages={{sortingHint: 'Сортувати'}} />

          {/*Якщо в props є edited - таблиця дає можливість редагувати рядки*/}
          <If condition={this.props.edit}>
            <EditingState
              editingRowIds={editingRowIds}
              onEditingRowIdsChange={this.changeEditingRowIds}
              rowChanges={rowChanges}
              onRowChangesChange={this.changeRowChanges}
              addedRows={addedRows}
              onAddedRowsChange={this.changeAddedRows}
              onCommitChanges={this.commitChanges}
            />
            <TableEditRow rowHeight={10} />
            <TableEditColumn
              width={220}
              messages={{
                addCommand: 'Додати',
                editCommand: 'Редагувати',
                deleteCommand: 'Видалити',
                commitCommand: 'Зберегти',
                cancelCommand: 'Відмінити'
              }}
              showAddCommand={!addedRows.length}
              showEditCommand
              showDeleteCommand
            />
          </If>

          {/*Якщо в props є filter - таблиця дає можливість фільтрувати*/}
          <If condition={this.props.filter}>
            <TableFilterRow rowHeight={1} messages={{filterPlaceholder: 'Фільтр'}} />
          </If>

          {/*Якщо в props є paging - таблиця показує панель пажинації*/}
          <If condition={this.props.paging}>
            <PagingPanel
              allowedPageSizes={[0, 5, 10, 20]}
              messages={{
                showAll: 'Усі',
                rowsPerPage: 'Записів на сторінці',
                info: 'Записи з {from} по {to} (всього {count})'
              }}
            />
          </If>
        </Grid>
      </Paper>
    );
  }
}

export default DxTable;
