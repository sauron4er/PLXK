'use strict';
import React, {Fragment} from 'react';

class Day extends React.Component {
  render() {
    const {fieldName, day} = this.props;

    return (
      <>
        <div>{fieldName}:</div>
        <div className='css_note_text ml-1'>{day}</div>
      </>
    );
  }

  static defaultProps = {
    day: '---',
    fieldName: '1111-11-11'
  };
}

export default Day;
