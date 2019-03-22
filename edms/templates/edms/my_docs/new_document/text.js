'use strict';
import React from 'react';

class Text extends React.Component {
  render() {
    const {fieldName, text, onChange} = this.props;
    return (
      <label className='full_width' htmlFor='text'>
        {fieldName}:
        <textarea
          className='form-control full_width'
          name='text'
          id='text'
          value={text}
          onChange={onChange}
          maxLength={4000}
        />
      </label>
    );
  }

  static defaultProps = {
    text: '???',
    fieldName: '???'
  };
}

export default Text;
