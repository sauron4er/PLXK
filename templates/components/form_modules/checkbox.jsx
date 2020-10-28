'use strict';
import React from 'react';

class Checkbox extends React.Component {
  render() {
    const {fieldName, checked, onChange, disabled, note} = this.props;
  
    return (
      <div>
        <input type='checkbox' id={fieldName} checked={checked} onChange={onChange} disabled={disabled} />
        <label className='ml-2 form-check-label' htmlFor={fieldName}>
          {' '}{fieldName}
        </label>
        <If condition={note}>
          <small> ({note})</small>
        </If>
      </div>
    );
  }

  static defaultProps = {
    checked: false,
    fieldName: '-',
    onChange: () => {},
    disabled: false,
    note: ''
  };
}

export default Checkbox;
