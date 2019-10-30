'use strict';
import React from 'react';

class Text extends React.Component {
  render() {
    const {fieldName, text, onChange, rows, maxLength, queue} = this.props;
    
    return (
      <label className='full_width' htmlFor={'text-' + queue}>
        {fieldName}:
        <textarea
          className='form-control full_width'
          name='text'
          id={'text-' + queue}
          value={text}
          rows={rows}
          onChange={onChange}
          maxLength={maxLength}
        />
      </label>
    );
  }

  static defaultProps = {
    text: '',
    fieldName: '-',
    rows: 1,
    queue: 1,
    maxLength: 5000
  };
}

export default Text;
