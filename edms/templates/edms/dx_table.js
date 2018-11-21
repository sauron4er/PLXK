// Компонент-обгортка над компонентом DevExtreme React Grid
// https://devexpress.github.io/devextreme-reactive/react/grid/docs/guides/getting-started/

import React from 'react';
import Paper from '@material-ui/core/Paper';
import {Grid, Table, VirtualTable, TableHeaderRow, TableFilterRow, PagingPanel, TableEditRow, TableEditColumn, TableSelection} from '@devexpress/dx-react-grid-material-ui';
import { PagingState, SortingState, FilteringState, IntegratedSorting, IntegratedFiltering, IntegratedPaging, EditingState, SelectionState, IntegratedSelection } from '@devexpress/dx-react-grid';

import './dx_table_styles.css'

const styles = {
    true: { // Колір рядка червоний, якщо заданий рядок == 'true'
        backgroundColor: '#ff6968'
    },
    clicked: {
        backgroundColor: '#e6e6e6'
    }
};

const getRowId = row => row.id;


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
        };
    }

    // TODO розібратися, чому іноді this.props.rows не переходить в this.state.rows, а іноді переходить

    // призначає в state нові props при їх зміні.
    // додав цю функцію, бо в більшості випадків при рендері
    // props чомусь не призначалися в state (rows: this.props.rows - не спрацьовує)
    componentWillReceiveProps(nextProps, nextContext){
      if (nextProps.rows !== this.state.rows) {
        this.setState({ rows: nextProps.rows })
      }
    }

    changeAddedRows(addedRows) {
        const initialized = addedRows.map(row => (Object.keys(row).length ? row : { name: '' }));
        this.setState({ addedRows: initialized });
    }

    changeEditingRowIds(editingRowIds) {
        this.setState({editingRowIds})
    };

    changeRowChanges(rowChanges) {
        this.setState({ rowChanges });
    }

    commitChanges({ added, changed, deleted }) {
        let { rows } = this.state;
        if (added) {

          // автозаповнення поля під назвою id (визначається по довжині масиву, а не по попередньому id)
          const startingAddedId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 1;
          rows = [
            ...rows,
            ...added.map((row, index) => ({
              id: startingAddedId + index,
              ...row,
            })),
          ];
        }
        if (changed) {
          rows = rows.map(row => (changed[row.id] ? { ...row, ...changed[row.id] } : row));
        }
        if (deleted) {
          const deletedSet = new Set(deleted);
          rows = rows.filter(row => !deletedSet.has(row.id));
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
        // TODO переробити правильно. Створити змінну style, яку міняти у switch і повертати
        if (row.id === clicked_row_index) {
            return {
                cursor: 'pointer',
                height: 30,
                ...styles['clicked'],
            };
        }
        if (this.props.redRow) {
            switch(this.props.redRow){
                case 'is_vacant':
                    return {
                        cursor: 'pointer',
                        height: 30,
                        ...styles[row.is_vacant],
                    };
                default:
                    return {
                        cursor: 'pointer',
                        height: 30,
                    };
            }
        }
        return {
            cursor: 'pointer',
            height: 30,
        }
    }

    // внутрішні настройки рядка ReactGrid
    TableRow = ({ row, ...restProps }) => (
      <Table.Row
          className='css_dx_table'
        {...restProps}
        // eslint-disable-next-line no-alert
        onClick={() => this.onRowClick(row)}
        style={this.ChooseStyle(row)}
      />
    );

    CellComponent = props => (
      <Table.Cell
        {...props}
        style={{
          paddingLeft: 5,
          margin: 0,
          fontSize: '12px',
          // textAlign: 'center',
          height: '5px',
          border: '1px solid #F0F0F0'
        }}
      />
    );

    HeaderCellComponent = props => (
      <TableHeaderRow.Cell
        {...props}
        style={{
          padding: '1',
          fontSize: '11px',
        }}
      />
    );

    // передача інфу про клікнутий рядок наверх
    onRowClick(row) {
        const onRowClick = this.props.onRowClick;
        this.setState({clicked_row_index: row.id});
        onRowClick(row)
    }

    render() {
        const { rows, editingRowIds, rowChanges, addedRows } = this.state;

        // Таблиця бере висоту з this.props.height, якщо така є
        const height = this.props.height && this.props.height !== null ? this.props.height : '100%';
        const paper_height = !this.props.paging ? height : {};
        const grid_height = !this.props.paging ? '100%' : {};
        const virtual_height = this.props.height && this.props.height !== null ? this.props.height : 750;


        return (
            <Paper className="mt-2 full_width" style={{height: {paper_height}}}>
                <Grid
                    rows={rows}
                    columns={this.props.columns}
                    getRowId={getRowId}
                    style={{height: {grid_height}}}
                    hoverStateEnabled={true} >

                    <SortingState
                        defaultSorting={this.props.defaultSorting}
                    />
                    <If condition={this.props.paging}>
                        <PagingState
                            pageSize={this.props.pageSize ? this.props.pageSize : 8}
                        />
                    </If>
                    <FilteringState defaultFilters={[]} />
                    <EditingState
                      onCommitChanges={this.commitChanges}
                    />
                    <SelectionState/>


                    <IntegratedSorting />
                    <If condition={this.props.paging}>
                        <IntegratedPaging />
                    </If>
                    <IntegratedFiltering />
                    <IntegratedSelection/>

                    {/*Якщо в props нема paging - таблиця показується зі скроллом*/}
                    <Choose>
                        <When condition={this.props.paging}>
                            <Table
                                cellComponent={this.CellComponent}
                                rowComponent={this.TableRow}
                                columnExtensions={this.props.colWidth}
                                messages={{noData: 'Немає даних',}}
                            />
                        </When>
                        <Otherwise>
                            {/*VirtualTable чомусь неправильно працює з редагуванням. Потрібно використовувати paging */}
                            <VirtualTable
                                cellComponent={this.CellComponent}
                                rowComponent={this.TableRow}
                                columnExtensions={this.props.colWidth}
                                messages={{noData: 'Немає даних',}}
                                height={virtual_height}
                            />
                        </Otherwise>
                    </Choose>

                    <TableHeaderRow cellComponent={this.HeaderCellComponent} showSortingControls messages={{sortingHint: 'Сортувати',}} />

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
                        <TableEditRow
                            rowHeight={10}
                        />
                        <TableEditColumn
                            width={220}
                            messages={{
                                addCommand: 'Додати',
                                editCommand: 'Редагувати',
                                deleteCommand: 'Видалити',
                                commitCommand: 'Зберегти',
                                cancelCommand: 'Відмінити',
                            }}
                            showAddCommand={!addedRows.length}
                            showEditCommand
                            showDeleteCommand
                        />
                    </If>

                    {/*Якщо в props є filter - таблиця дає можливість фільтрувати*/}
                    <If condition={this.props.filter}>
                        <TableFilterRow rowHeight={1} messages={{filterPlaceholder: 'Фільтр...',}} />
                    </If>

                    {/*Якщо в props є paging - таблиця показує панель пажинації*/}
                    <If condition={this.props.paging}>
                        <PagingPanel
                            allowedPageSizes={[0, 5, 10, 20]}
                            messages={{
                                showAll: 'Усі',
                                rowsPerPage: 'Записів на сторінці',
                                info: 'Записи з {from} по {to} (всього {count})',
                            }}
                        />
                    </If>


                </Grid>
            </Paper>
        )
    }
}

export default DxTable;
