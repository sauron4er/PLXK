'use strict';
import React from 'react';

class Selector extends React.Component {
  render() {
    const {list, selectedName, valueField, onChange, fieldName, edit_mode} = this.props;

    return (
      <label className='full_width' htmlFor={fieldName}>
        {fieldName}:
        <select
          className='form-control full_width'
          id={fieldName}
          name={fieldName}
          value={selectedName}
          onChange={onChange}
          disabled={!edit_mode}
        >
          <option key={0} data-key={null} value='0'>
            ------------
          </option>
          {list.map((item) => {
            return (
              <option key={item.id} data-key={item.id} value={item[valueField]}>
                {item[valueField]}
              </option>
            );
          })}
        </select>
      </label>
    );
  }

  static defaultProps = {
    list: [],
    fieldName: '',
    valueField: 'name', // Назва поля, яке буде відображатись у селекторі (для працівників це name)
    selectedName: '',
    onChange: () => {},
    edit_mode: false
  };
}

export default Selector;
