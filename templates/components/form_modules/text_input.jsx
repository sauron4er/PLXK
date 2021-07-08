'use strict';
import * as React from 'react';

class TextInput extends React.Component {
  
  render() {
    const {fieldName, text, onChange, maxLength, type, disabled, className} = this.props;
    
    const rows = Math.round(text.length / 100)
  
    return (
      <Choose>
        <When condition={type==='dimensions' || type==='number'}>
          <label className={className + ' full_width'} htmlFor={fieldName}>
            <If condition={fieldName !== '-'}>{fieldName}:</If>
            <input
              className=' form-control full_width'
              name={fieldName}
              id={fieldName}
              value={text}
              type='number'
              onChange={onChange}
              maxLength={maxLength}
              disabled={disabled}
            />
          </label>
        </When>
        <When condition={maxLength <= 110}>
          <label className={className + ' full_width'} htmlFor={fieldName}>
            <If condition={fieldName !== '-'}>{fieldName}:</If>
            <input
              className='form-control full_width'
              name={fieldName}
              id={fieldName}
              value={text}
              onChange={onChange}
              maxLength={maxLength}
              disabled={disabled}
            />
          </label>
        </When>
        <Otherwise>
          <label className={className + ' full_width'} htmlFor={fieldName}>
            <If condition={fieldName !== '-'}>{fieldName}:</If>
            <textarea
              className='autoExpand form-control full_width'
              name={fieldName}
              id={fieldName}
              value={text}
              rows={rows > 0 ? rows : 1}
              onChange={onChange}
              maxLength={maxLength}
              disabled={disabled}
            />
          </label>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    text: '',
    fieldName: '-',
    onChange: () => {},
    maxLength: 5000,
    type: 'default',
    disabled: true,
    className: {}
  };
}

export default TextInput;
