'use strict';
import React from 'react';

class Checkbox extends React.Component {
  render() {
    const {fieldName, checked, onChange} = this.props;

    return (
      <div>
        <input type='checkbox' id={fieldName} checked={checked} onChange={onChange} />
        <label className='ml-2 form-check-label' htmlFor={fieldName}>
          {fieldName}
        </label>
      </div>
    );
  }

  static defaultProps = {
    checked: false,
    fieldName: '-',
    onChange: () => {}
  };
}

export default Checkbox;
