'use strict';
import React from 'react';

class TextInput extends React.Component {
  
  render() {
    const {fieldName, text, onChange, maxLength, type, edit_mode} = this.props;

    return (
      <Choose>
        <When condition={type==='dimensions'}>
          <label className='full_width' htmlFor={fieldName}>
            {fieldName}:
            <input
              className='form-control full_width'
              name={fieldName}
              id={fieldName}
              value={text}
              type='number'
              onChange={onChange}
              maxLength={maxLength}
              disabled={!edit_mode}
            />
          </label>
        </When>
        <When condition={maxLength <= 110}>
          <label className='full_width' htmlFor={fieldName}>
            {fieldName}:
            <input
              className='form-control full_width'
              name={fieldName}
              id={fieldName}
              value={text}
              onChange={onChange}
              maxLength={maxLength}
              disabled={!edit_mode}
            />
          </label>
        </When>
        <Otherwise>
          <label className='full_width' htmlFor={fieldName}>
            {fieldName}:
            <textarea
              className='autoExpand form-control full_width'
              name={fieldName}
              id={fieldName}
              value={text}
              rows='2'
              onChange={onChange}
              maxLength={maxLength}
              disabled={!edit_mode}
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
    edit_mode: false,
  };
}

export default TextInput;
