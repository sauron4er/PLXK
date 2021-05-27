'use strict';
import * as React from 'react';
import Select from 'react-select';

class SelectorWithFilter extends React.Component {
  render() {
    const {list, onChange, fieldName, disabled, classes, value} = this.props;

    return (
      <label className={classes + ' full_width'} htmlFor={fieldName}>
        {fieldName}:
        <Select
          options={list}
          onChange={onChange}
          isDisabled={disabled}
          value={value}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.id}
        />
      </label>
    );
  }

  static defaultProps = {
    list: [],
    fieldName: '',
    valueField: 'name',
    selectedName: '',
    onChange: () => {},
    disabled: true,
    classes: {},
    value: {label: 0, value: ''}
  };
}

export default SelectorWithFilter;
