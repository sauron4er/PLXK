'use strict';
import * as React from 'react';

class CheckboxInput extends React.Component {
  render() {
    const {fieldName, checked, onChange, disabled, note, className} = this.props;

    return (
      <div className={className}>
        <label className={`ml-2 form-check-label ${checked ? '' : 'text-muted'}`} htmlFor={`checkbox-${fieldName}`}>
          <input type='checkbox' id={`checkbox-${fieldName}`} checked={checked} onChange={onChange} disabled={disabled} /> {fieldName}
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
    note: '',
    className: ''
  };
}

export default CheckboxInput;
