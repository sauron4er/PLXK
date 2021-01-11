'use strict';
import React, {Fragment} from 'react';
import DxTable from 'templates/components/tables/dx_table';

class CarryOut extends React.Component {
  state = {
    carry_out_items: this.props.carryOutItems,
    carry_out_columns: [
      {name: 'id', title: '№'},
      {name: 'item_name', title: 'Найменування'},
      {name: 'quantity', title: 'К-сть'},
      {name: 'measurement', title: 'Од. виміру'}
    ],
    carry_out_col_width: [
      {columnName: 'id', width: 55},
      {columnName: 'item_name'},
      {columnName: 'quantity', width: 70},
      {columnName: 'measurement', width: 80}
    ]
  };

  // Отримує з таблиці новий список матеріалів
  getCarryOutItems = (carry_out_items) => {
    const changed_event = {
      target: {
        name: 'carry_out_items',
        value: carry_out_items
      }
    };
    this.props.onChange(changed_event);
  };

  render() {
    const {module_info, carryOutItems} = this.props;
    const {carry_out_columns, carry_out_col_width} = this.state;
    
    return (
      <div className='mt-1'>
        <If condition={module_info.required}>{'* '}</If> <label>{module_info.field_name}:</label>
        <DxTable
          rows={carryOutItems}
          columns={carry_out_columns}
          colWidth={carry_out_col_width}
          edit
          getData={this.getCarryOutItems}
          paging
        />
        <small className='text-danger'>{module_info?.additional_info}</small>
      </div>
    );
  }

  static defaultProps = {
    carryOutItems: [],
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    },
  };
}

export default CarryOut;
