'use strict';
import * as React from 'react';

class NumberInput extends React.Component {
  onChange = (e) => {
    let input = e.target.value;

    if (!Number(input)) {
      return;
    }
    this.props.onChange(e);
  };

  render() {
    const {fieldName, text, disabled, className} = this.props;

    return (
      <>
        <label className={className + ' full_width'} htmlFor={fieldName}>
          <If condition={fieldName !== '-'}>{fieldName}:</If>
          <input
            className=' form-control full_width'
            name={fieldName}
            id={fieldName}
            value={text}
            type='number'
            onChange={this.onChange}
            disabled={disabled}
          />
        </label>
      </>
    );
  }

  static defaultProps = {
    text: '',
    fieldName: '-',
    onChange: () => {},
    maxLength: 5000,
    disabled: true,
    className: {}
  };
}

export default NumberInput;
