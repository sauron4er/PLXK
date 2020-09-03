'use strict';
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';

class MultiSelector extends React.Component {
  render() {
    const {list, selectedName, valueField, onChange, fieldName, disabled, addItem, hint} = this.props;

    return (
      <>
        <label className='full_width' htmlFor={fieldName}>
          {fieldName}:
        </label>
        <div className='d-md-flex align-items-center'>
          <div className='flex-grow-1 d-flex'>
            <select
              className='form-control full_width'
              id={fieldName}
              name={fieldName}
              value={selectedName}
              onChange={onChange}
              disabled={disabled}
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
            <button
              className={
                selectedName
                  ? 'btn btn-sm font-weight-bold ml-1 css_flash_button'
                  : 'btn btn-sm font-weight-bold ml-1 btn-outline-secondary'
              }
              onClick={addItem}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
        <small>{hint}</small>
      </>
    );
  }

  static defaultProps = {
    list: [],
    fieldName: '',
    hint: '',
    valueField: 'name', // Назва поля, яке буде відображатись у селекторі (для працівників це name)
    selectedName: '',
    onChange: () => {},
    addItem: () => {},
    disabled: true
  };
}

export default MultiSelector;
