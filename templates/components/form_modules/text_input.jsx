'use strict';
import React from 'react';

class TextInput extends React.Component {
  render() {
    const {fieldName, text, onChange, maxLength, type} = this.props;

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
            />
          </label>
        </When>
        <Otherwise>
          <label className='full_width' htmlFor={fieldName}>
            {fieldName}:
            <textarea
              className='form-control full_width'
              name={fieldName}
              id={fieldName}
              value={text}
              rows='1'
              onChange={onChange}
              maxLength={maxLength}
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
    type: 'default'
  };
}

export default TextInput;
