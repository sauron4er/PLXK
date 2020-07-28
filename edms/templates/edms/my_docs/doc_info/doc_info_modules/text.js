'use strict';
import React from 'react';

class Text extends React.Component {

  render() {
    const {fieldName, text} = this.props;

    return (
      <>
        <div>{fieldName}:</div>
        <div className='css_note_text ml-1'>{text}</div>
      </>
    );
  }

  static defaultProps = {
    text: '---',
    fieldName: '---',
    queue: 0
  };
}

export default Text;
