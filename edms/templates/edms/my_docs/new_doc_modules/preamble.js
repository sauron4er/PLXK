'use strict';
import React from 'react';

class Preamble extends React.Component {
  render() {
    const {fieldName, preamble, onChange} = this.props;
    return (
      <div className='mt-1'>
        <label className='full_width' htmlFor='preamble'>
          {fieldName}:
          <textarea
            className='form-control full_width'
            name='preamble'
            id='preamble'
            value={preamble}
            onChange={onChange}
            maxLength={4000}
          />
        </label>
      </div>
    );
  }

  static defaultProps = {
    preamble: '???',
    fieldName: '???'
  };
}

export default Preamble;
