'use strict';
import React from 'react';

class Text extends React.Component {
  render() {
    const {fieldName, text, onChange, rows, maxLength, queue, type} = this.props;

    return (
        <Choose>
          <When condition={type === 'dimensions'}>
            <div className='row align-items-center mr-lg-1'>
              <label className='col-lg-4' htmlFor={'text-' + queue}>{fieldName}:</label>
              <input className='form-control col-lg-2'
                name='text'
                id={'text-' + queue}
                value={text}
                onChange={onChange}
                maxLength={maxLength} />
            </div>
          </When>
          <Otherwise>
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
          </Otherwise>
        </Choose>
    );
  }

  static defaultProps = {
    text: '',
    fieldName: '-',
    rows: 1,
    queue: 1,
    maxLength: 5000,
    type: 'default'
  };
}

export default Text;
