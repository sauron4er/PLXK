'use strict';
import React from 'react';

class Name extends React.Component {
  render() {
    const {fieldName, name, onChange} = this.props;
    return (
      <div className='mt-1'>
        <label className='full_width' htmlFor='name '>
          {fieldName}:
          <textarea
            className='form-control full_width'
            id='name'
            name='name'
            value={name}
            onChange={onChange}
            maxLength={4000}
          />
        </label>
      </div>
    );
  }

  static defaultProps = {
    name: '???',
    fieldName: '???'
  };
}

export default Name;
