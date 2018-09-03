// Компонент-обгортка над компонентом DevExtreme React Grid
// https://devexpress.github.io/devextreme-reactive/react/grid/docs/guides/getting-started/

import React from 'react';
import Paper from '@material-ui/core/Paper';
import {Grid, Table, TableHeaderRow, TableFilterRow, PagingPanel, TableEditRow, TableEditColumn,} from '@devexpress/dx-react-grid-material-ui';
import { PagingState, SortingState, FilteringState, IntegratedSorting, IntegratedFiltering, IntegratedPaging, EditingState } from '@devexpress/dx-react-grid';

import './my_styles.css'

const styles = {
      true: { // Колір рядка червоний, якщо заданий рядок == 'true'
            backgroundColor: '#ff6968'
        },
    };

const getRowId = row => row.id;




class MyTable extends React.PureComponent {
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
        };
    }

    // TODO розібратися, чому іноді this.props.rows не переходить в this.state.rows, а іноді переходить

    // призначає в state нові props при їх зміні.
    // додав цю функцію, бо в більшості випадків при рендері
    // props чомусь не призначалися в state (rows: this.props.rows - не спрацьовує)
    componentWillReceiveProps(nextProps){
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

        // змушений мутувати rows, бо немутабельна зміна відбувається
        // асинхронно в кінці функції і в push_data внизу ідуть старі дані
        // this.setState({ rows });
        this.state.rows = rows;

        // відправляємо нові дані батьку
        // ОБЕРЕЖНО, таблиця кожен раз відправляється батьку вся,
        // якщо даних дуже багато - зміни треба робити поза таблицею.
        const push_data = this.props.getData;
        push_data(this.state.rows);


    }

    // Стилі рядків
    ChooseStyle(row) {
        if (this.props.redRow) {
            switch(this.props.redRow){
                case 'is_vacant':
                    return {
                        cursor: 'pointer',
                        ...styles[row.is_vacant],
                    };
                default:
                    return {cursor: 'pointer',};
            }
        }
        return {cursor: 'pointer', }
    }

    // внутрішні настройки рядка ReactGrid
    TableRow = ({ row, ...restProps }) => (
      <Table.Row
        {...restProps}
        // eslint-disable-next-line no-alert
        onClick={() => this.onRowClick(row)}
        style={this.ChooseStyle(row)}
      />
    );

    // передача інфу про клікнутий рядок наверх
    onRowClick(row) {
        const onRowClick = this.props.onRowClick;
        onRowClick(row)
    }

    render() {
        const { rows, editingRowIds, rowChanges, addedRows } = this.state;
        return (
            <Paper className="mt-2 full_width">
                <Grid className="full_width"
                        rows={rows}
                        columns={this.props.columns}
                        getRowId={getRowId} >
                    <SortingState
                        defaultSorting={this.props.defaultSorting}
                    />
                    <PagingState />
                    <IntegratedSorting />
                    <IntegratedPaging />
                    <Table rowComponent={this.TableRow} columnExtensions={this.props.colWidth} messages={{noData: 'Немає даних',}} />
                    <TableHeaderRow showSortingControls />

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
                            rowHeight={30}
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

                    {/*Таблиця не дає можливість фільтрувати, якщо отримала noFilter в props */}
                    <If condition={this.props.filter}>
                        <FilteringState />
                        <IntegratedFiltering />
                        <TableFilterRow messages={{filterPlaceholder: 'Фільтр...',}} />
                    </If>

                    <PagingPanel
                        allowedPageSizes={[0, 5, 10, 20]}
                        messages={{
                            showAll: 'Усі',
                            rowsPerPage: 'Записів на сторінці',
                            info: 'Записи з {from} по {to} (всього {count})',
                        }}
                    />
                </Grid>
            </Paper>
        )
    }
}

export default MyTable;
